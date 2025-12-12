/**
 * useBenchmarking Hook
 * Bridge between Main Thread and Benchmark Web Worker
 *
 * Provides a clean API for running isolated, high-precision benchmarks
 * without blocking the UI thread.
 *
 * Features:
 * - Automatic worker lifecycle management
 * - Promise-based API for async/await usage
 * - Cleanup on unmount (prevents memory leaks)
 * - Error handling with fallback
 */

import { useRef, useCallback, useEffect } from "react";
import { Grid, AlgorithmType } from "../types";

// === TYPE DEFINITIONS ===

export interface BenchmarkResult {
  avgTime: number; // Average time per execution in ms
  iterations: number; // Number of iterations completed
  opsPerSec: number; // Operations per second
  totalTime: number; // Total benchmark duration
}

interface WorkerResponse {
  success: boolean;
  data?: BenchmarkResult;
  error?: string;
  requestId: number; // Unique ID to match request with response
}

// Serialized format for transfer to worker
type SerializedNode = {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
};

type SerializedGrid = SerializedNode[][];

// === HOOK CONFIGURATION ===

const DEFAULT_MIN_DURATION = 200; // Run benchmark for at least 200ms

// === MAIN HOOK ===

// Counter for unique request IDs (outside hook to persist across re-renders)
let requestIdCounter = 0;

export function useBenchmarking() {
  // Worker instance ref (persists across renders)
  const workerRef = useRef<Worker | null>(null);
  // Map of pending promise resolvers keyed by request ID
  // This allows multiple concurrent benchmark requests (e.g., race mode)
  const pendingRequests = useRef<
    Map<
      number,
      {
        resolve: (value: BenchmarkResult) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());

  /**
   * Initialize the worker on first use
   */
  const getWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      // Vite-specific syntax for module workers
      workerRef.current = new Worker(
        new URL("../workers/benchmark.worker.ts", import.meta.url),
        { type: "module" }
      );

      // Set up message handler
      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { requestId, success, data, error } = event.data;
        const pending = pendingRequests.current.get(requestId);

        if (pending) {
          if (success && data) {
            pending.resolve(data);
          } else {
            pending.reject(new Error(error || "Benchmark failed"));
          }
          pendingRequests.current.delete(requestId);
        }
      };

      // Handle worker errors (reject all pending requests)
      workerRef.current.onerror = (error) => {
        console.error("Benchmark worker error:", error);
        const errorObj = new Error("Worker error: " + error.message);
        pendingRequests.current.forEach((pending) => {
          pending.reject(errorObj);
        });
        pendingRequests.current.clear();
      };
    }

    return workerRef.current;
  }, []);

  /**
   * Serialize grid for transfer to worker
   * Removes circular references (previousNode) and resets state
   */
  const serializeGrid = useCallback((grid: Grid): SerializedGrid => {
    return grid.map((row) =>
      row.map((node) => ({
        row: node.row,
        col: node.col,
        isStart: node.isStart,
        isFinish: node.isFinish,
        isWall: node.isWall,
      }))
    );
  }, []);

  /**
   * Find start and finish positions in grid
   */
  const findPositions = useCallback(
    (
      grid: Grid
    ): {
      startPos: { row: number; col: number };
      finishPos: { row: number; col: number };
    } | null => {
      let startPos: { row: number; col: number } | null = null;
      let finishPos: { row: number; col: number } | null = null;

      for (const row of grid) {
        for (const node of row) {
          if (node.isStart) startPos = { row: node.row, col: node.col };
          if (node.isFinish) finishPos = { row: node.row, col: node.col };
        }
      }

      if (!startPos || !finishPos) return null;
      return { startPos, finishPos };
    },
    []
  );

  /**
   * Run a benchmark for the specified algorithm
   *
   * @param algorithm - The algorithm to benchmark
   * @param grid - The current grid state
   * @param minDuration - Minimum benchmark duration (default: 200ms)
   * @returns Promise resolving to benchmark results
   */
  const runBenchmark = useCallback(
    async (
      algorithm: AlgorithmType,
      grid: Grid,
      minDuration: number = DEFAULT_MIN_DURATION
    ): Promise<BenchmarkResult> => {
      const worker = getWorker();
      const positions = findPositions(grid);

      if (!positions) {
        throw new Error("Start or Finish node not found");
      }

      // Serialize grid for transfer (removes circular refs)
      const serializedGrid = serializeGrid(grid);

      // Generate unique request ID for this benchmark
      const requestId = ++requestIdCounter;

      return new Promise((resolve, reject) => {
        // Store resolvers keyed by request ID
        pendingRequests.current.set(requestId, { resolve, reject });

        // Send benchmark request to worker with request ID
        worker.postMessage({
          requestId,
          algorithmName: algorithm,
          gridData: serializedGrid,
          startPos: positions.startPos,
          finishPos: positions.finishPos,
          minDuration,
        });
      });
    },
    [getWorker, findPositions, serializeGrid]
  );

  /**
   * Terminate the worker (for cleanup)
   */
  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    // Reject all pending requests
    pendingRequests.current.forEach((pending) => {
      pending.reject(new Error("Worker terminated"));
    });
    pendingRequests.current.clear();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, [terminateWorker]);

  return {
    runBenchmark,
    terminateWorker,
  };
}

export default useBenchmarking;
