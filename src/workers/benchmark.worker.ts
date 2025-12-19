/**
 * Benchmark Web Worker
 * Industrial-Grade Isolated Timing System
 *
 * This worker runs in a completely separate thread from the UI,
 * guaranteeing zero interference from:
 * - DOM rendering
 * - React state updates
 * - User interactions (mouse, scroll, resize)
 * - Animation frames
 * - Garbage collection on main thread
 *
 * Uses adaptive sampling: keeps running until minDuration passes,
 * then calculates average time per operation.
 */

import { Grid, Node, AlgorithmType } from "../types";

// === ALGORITHM IMPORTS ===
// Import the raw algorithm functions directly
import { dijkstra } from "../algorithms/pathfinding/dijkstra";
import { astar } from "../algorithms/pathfinding/astar";
import { bfs } from "../algorithms/pathfinding/bfs";
import { dfs } from "../algorithms/pathfinding/dfs";
import { greedyBestFirst } from "../algorithms/pathfinding/greedyBestFirst";
import { bidirectionalBFS } from "../algorithms/pathfinding/bidirectionalBFS";
import { bidirectionalAStar } from "../algorithms/pathfinding/bidirectionalAStar";
import { jumpPointSearch } from "../algorithms/pathfinding/jumpPointSearch";

// === TYPE DEFINITIONS ===

interface BenchmarkInput {
  requestId: number; // Unique ID to match request with response
  algorithmName: AlgorithmType;
  gridData: SerializedGrid;
  startPos: { row: number; col: number };
  finishPos: { row: number; col: number };
  minDuration: number; // Minimum benchmark duration in ms (e.g., 200)
}

interface BenchmarkOutput {
  avgTime: number; // Average time per execution in ms
  iterations: number; // Number of iterations completed
  opsPerSec: number; // Operations per second
  totalTime: number; // Total benchmark duration
}

// Serialized grid format (no circular references)
type SerializedNode = {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
};

type SerializedGrid = SerializedNode[][];

// === HELPER FUNCTIONS ===

/**
 * Reconstructs a full Grid from serialized data
 * Creates fresh Node objects with all required properties
 */
function deserializeGrid(serialized: SerializedGrid): Grid {
  return serialized.map((row) =>
    row.map((cell) => ({
      row: cell.row,
      col: cell.col,
      isStart: cell.isStart,
      isFinish: cell.isFinish,
      isWall: cell.isWall,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
      weight: 1, // Default weight for benchmark grids
    }))
  );
}

/**
 * Creates a fresh deep copy of the grid for each benchmark iteration
 * Ensures no state pollution between runs
 */
function cloneGridForIteration(grid: Grid): {
  clonedGrid: Grid;
  start: Node;
  finish: Node;
} {
  const clonedGrid: Grid = grid.map((row) =>
    row.map((node) => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    }))
  );

  let start: Node | null = null;
  let finish: Node | null = null;

  for (const row of clonedGrid) {
    for (const node of row) {
      if (node.isStart) start = node;
      if (node.isFinish) finish = node;
    }
  }

  if (!start || !finish) {
    throw new Error("Start or Finish node not found in grid");
  }

  return { clonedGrid, start, finish };
}

/**
 * Runs the specified algorithm on a grid
 */
function runAlgorithm(
  algorithmName: AlgorithmType,
  grid: Grid,
  start: Node,
  finish: Node
): void {
  switch (algorithmName) {
    case AlgorithmType.DIJKSTRA:
      dijkstra(grid, start, finish);
      break;
    case AlgorithmType.ASTAR:
      astar(grid, start, finish);
      break;
    case AlgorithmType.BFS:
      bfs(grid, start, finish);
      break;
    case AlgorithmType.DFS:
      dfs(grid, start, finish);
      break;
    case AlgorithmType.GREEDY_BEST_FIRST:
      greedyBestFirst(grid, start, finish);
      break;
    case AlgorithmType.BIDIRECTIONAL_BFS:
      bidirectionalBFS(grid, start, finish);
      break;
    case AlgorithmType.BIDIRECTIONAL_ASTAR:
      bidirectionalAStar(grid, start, finish);
      break;
    case AlgorithmType.JUMP_POINT_SEARCH:
      jumpPointSearch(grid, start, finish);
      break;
    default:
      dijkstra(grid, start, finish);
  }
}

// === MAIN MESSAGE HANDLER ===

self.onmessage = (event: MessageEvent<BenchmarkInput>) => {
  const {
    requestId,
    algorithmName,
    gridData,
    startPos,
    finishPos,
    minDuration,
  } = event.data;

  try {
    // === PHASE 1: DESERIALIZE ===
    // Parse grid data (this overhead is NOT measured)
    const baseGrid = deserializeGrid(gridData);

    // Verify start/finish positions
    if (
      !baseGrid[startPos.row]?.[startPos.col]?.isStart ||
      !baseGrid[finishPos.row]?.[finishPos.col]?.isFinish
    ) {
      throw new Error("Invalid start/finish positions");
    }

    // === PHASE 2: WARM-UP ===
    // Run 3 times to trigger JIT optimization
    // These results are discarded
    for (let i = 0; i < 3; i++) {
      const { clonedGrid, start, finish } = cloneGridForIteration(baseGrid);
      runAlgorithm(algorithmName, clonedGrid, start, finish);
    }

    // === PHASE 3: ADAPTIVE SAMPLING LOOP ===
    // Keep running until minDuration has passed
    let iterations = 0;
    const startTime = performance.now();
    let elapsed = 0;

    while (elapsed < minDuration) {
      // Create fresh grid for this iteration
      const { clonedGrid, start, finish } = cloneGridForIteration(baseGrid);

      // Run algorithm (only this is timed)
      runAlgorithm(algorithmName, clonedGrid, start, finish);

      iterations++;
      elapsed = performance.now() - startTime;
    }

    // === PHASE 4: CALCULATE STATISTICS ===
    const totalTime = elapsed;
    const avgTime = totalTime / iterations;
    const opsPerSec = 1000 / avgTime;

    // === PHASE 5: RETURN RESULTS ===
    const output: BenchmarkOutput = {
      avgTime,
      iterations,
      opsPerSec,
      totalTime,
    };

    self.postMessage({ success: true, data: output, requestId });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      requestId,
    });
  }
};

// TypeScript requires this for module workers
export {};
