/**
 * useVisualization Hook
 * Phase B & C: Animation System for Pathfinding and Maze Generation
 *
 * ARCHITECTURE: Industrial-Grade Benchmarking with Web Worker Isolation
 * - Timing runs in dedicated Web Worker (zero UI interference)
 * - Main thread only handles animation (DOM manipulation)
 * - Scientific precision: adaptive sampling until 200ms elapsed
 *
 * Uses direct DOM manipulation for performance (1000+ nodes).
 * Does NOT use React setState inside animation loops.
 */

import { useCallback, useRef } from "react";
import { Grid, Node, MazeType, AlgorithmType } from "../types";
import {
  dijkstra,
  getNodesInShortestPathOrder,
} from "../algorithms/pathfinding/dijkstra";
import {
  astar,
  getNodesInShortestPathOrder as getAstarPath,
} from "../algorithms/pathfinding/astar";
import {
  bfs,
  getNodesInShortestPathOrder as getBfsPath,
} from "../algorithms/pathfinding/bfs";
import {
  dfs,
  getNodesInShortestPathOrder as getDfsPath,
} from "../algorithms/pathfinding/dfs";
import {
  greedyBestFirst,
  getNodesInShortestPathOrder as getGreedyPath,
} from "../algorithms/pathfinding/greedyBestFirst";
import {
  bidirectionalBFS,
  getNodesInShortestPathOrder as getBidirectionalPath,
} from "../algorithms/pathfinding/bidirectionalBFS";
import {
  bidirectionalAStar,
  getNodesInShortestPathOrder as getBidirectionalAStarPath,
} from "../algorithms/pathfinding/bidirectionalAStar";
import {
  jumpPointSearch,
  getNodesInShortestPathOrder as getJPSPath,
} from "../algorithms/pathfinding/jumpPointSearch";
import { getRecursiveDivisionMaze } from "../algorithms/maze/recursiveDivision";
import { getRandomizedDFSMaze } from "../algorithms/maze/randomizedDFS";
import { getPrimsMaze } from "../algorithms/maze/prims";
import { getSpiralMaze } from "../algorithms/maze/spiralMaze";
import { getCellularAutomataMaze } from "../algorithms/maze/cellularAutomata";
import { resetGridForPathfinding, clearWalls } from "../utils/gridUtils";
import { AlgorithmStats, RaceStats } from "../components/Modals/StatsModal";
import { useBenchmarking } from "./useBenchmarking";

/**
 * Callbacks for stats and scroll behavior
 */
interface StatsCallbacks {
  setVisualizationStats: React.Dispatch<
    React.SetStateAction<AlgorithmStats | RaceStats | null>
  >;
  scrollToStats: () => void;
  showToast?: (msg: string) => void;
}

/**
 * Return type for the useVisualization hook
 */
interface UseVisualizationReturn {
  visualizePathfinding: (
    algorithm: AlgorithmType,
    grid: Grid,
    setGrid: React.Dispatch<React.SetStateAction<Grid>>,
    setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
    speed: number,
    statsCallbacks?: StatsCallbacks
  ) => void;
  visualizeRace: (
    algo1: AlgorithmType,
    algo2: AlgorithmType,
    grid: Grid,
    setGrid: React.Dispatch<React.SetStateAction<Grid>>,
    setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
    speed: number,
    statsCallbacks?: StatsCallbacks
  ) => void;
  generateMaze: (
    mazeType: MazeType,
    grid: Grid,
    setGrid: React.Dispatch<React.SetStateAction<Grid>>,
    setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
    speed: number
  ) => void;
  clearVisualization: (
    grid: Grid,
    setGrid: React.Dispatch<React.SetStateAction<Grid>>
  ) => void;
  isAnimating: React.MutableRefObject<boolean>;
}

/**
 * Custom hook for managing pathfinding visualization animations
 *
 * Key Design Decisions:
 * - Direct DOM manipulation via getElementById (bypasses React for performance)
 * - setTimeout-based animation queue (non-blocking UI)
 * - CSS class toggling for visual effects
 * - Ref-based animation state to prevent stale closures
 */
export const useVisualization = (): UseVisualizationReturn => {
  // Track animation state with ref (not state - to avoid stale closures)
  const isAnimating = useRef<boolean>(false);
  // Store timeout IDs for cleanup
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  // === WEB WORKER BENCHMARKING ===
  // Industrial-grade timing isolated from UI thread
  const { runBenchmark } = useBenchmarking();

  // Benchmark duration: run algorithm repeatedly for 1 second to get stable average
  const BENCHMARK_MIN_DURATION = 1000;

  /**
   * Clears all pending animation timeouts
   */
  const clearAllTimeouts = useCallback((): void => {
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];
  }, []);

  /**
   * Removes visualization CSS classes from all nodes via DOM
   * SIMPLIFIED: Only handles basic visited/path classes
   */
  const clearVisualizationClasses = useCallback((): void => {
    // Remove visited and path classes from all nodes (both agents)
    const visitedNodes = document.querySelectorAll(".node-visited");
    const pathNodes = document.querySelectorAll(".node-path");
    const visitedNodesSecond = document.querySelectorAll(
      ".node-visited-second"
    );
    const pathNodesSecond = document.querySelectorAll(".node-path-second");
    const overlapNodes = document.querySelectorAll(".node-visited-overlap");
    // Simple path overlap class (for mixed color)
    const pathOverlapNodes = document.querySelectorAll(".node-path-overlap");

    visitedNodes.forEach((node) => {
      node.classList.remove("node-visited");
    });

    pathNodes.forEach((node) => {
      node.classList.remove("node-path");
    });

    visitedNodesSecond.forEach((node) => {
      node.classList.remove("node-visited-second");
    });

    pathNodesSecond.forEach((node) => {
      node.classList.remove("node-path-second");
    });

    overlapNodes.forEach((node) => {
      node.classList.remove("node-visited-overlap");
    });

    // Clear simple path overlap class
    pathOverlapNodes.forEach((node) => {
      node.classList.remove("node-path-overlap");
    });
  }, []);

  /**
   * Clears the visualization (both DOM and React state)
   */
  const clearVisualization = useCallback(
    (grid: Grid, setGrid: React.Dispatch<React.SetStateAction<Grid>>): void => {
      // Stop any ongoing animation
      clearAllTimeouts();
      isAnimating.current = false;

      // Clear DOM classes
      clearVisualizationClasses();

      // Reset React state (distance, previousNode, isVisited)
      setGrid(resetGridForPathfinding(grid));
    },
    [clearAllTimeouts, clearVisualizationClasses]
  );

  /**
   * Animates the visited nodes one by one
   * Uses setTimeout with increasing delays based on index
   */
  const animateVisitedNodes = useCallback(
    (
      visitedNodesInOrder: Node[],
      speed: number,
      onComplete: () => void
    ): void => {
      for (let i = 0; i < visitedNodesInOrder.length; i++) {
        const timeoutId = setTimeout(() => {
          const node = visitedNodesInOrder[i];

          // Skip Start and Finish nodes (preserve their colors)
          if (node.isStart || node.isFinish) {
            // If this is the last node, trigger path animation
            if (i === visitedNodesInOrder.length - 1) {
              onComplete();
            }
            return;
          }

          // Direct DOM manipulation for performance
          const element = document.getElementById(
            `node-${node.row}-${node.col}`
          );
          if (element) {
            element.classList.add("node-visited");
          }

          // If this is the last node, trigger path animation
          if (i === visitedNodesInOrder.length - 1) {
            onComplete();
          }
        }, i * speed);

        timeoutIds.current.push(timeoutId);
      }
    },
    []
  );

  /**
   * Animates the shortest path nodes
   * Called after visited animation completes
   */
  const animateShortestPath = useCallback(
    (
      nodesInShortestPathOrder: Node[],
      speed: number,
      onComplete: () => void
    ): void => {
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        const timeoutId = setTimeout(() => {
          const node = nodesInShortestPathOrder[i];

          // Skip Start and Finish nodes (preserve their colors)
          if (node.isStart || node.isFinish) {
            if (i === nodesInShortestPathOrder.length - 1) {
              onComplete();
            }
            return;
          }

          // Direct DOM manipulation
          const element = document.getElementById(
            `node-${node.row}-${node.col}`
          );
          if (element) {
            // Remove visited class first, then add path class
            element.classList.remove("node-visited");
            element.classList.add("node-path");
          }

          // If this is the last node, mark animation as complete
          if (i === nodesInShortestPathOrder.length - 1) {
            onComplete();
          }
        }, i * (speed * 3)); // Path animation is slower (3x)

        timeoutIds.current.push(timeoutId);
      }
    },
    []
  );

  /**
   * Helper function to run an algorithm and get results
   * Extracted for reuse in benchmarking and race mode
   */
  const runAlgorithm = useCallback(
    (
      algorithm: AlgorithmType,
      algorithmGrid: Grid,
      startNode: Node,
      finishNode: Node
    ): { visitedNodes: Node[]; pathNodes: Node[] } => {
      let visitedNodes: Node[] = [];
      let pathNodes: Node[] = [];

      switch (algorithm) {
        case AlgorithmType.ASTAR:
          visitedNodes = astar(algorithmGrid, startNode, finishNode);
          pathNodes = getAstarPath(finishNode);
          break;
        case AlgorithmType.BFS:
          visitedNodes = bfs(algorithmGrid, startNode, finishNode);
          pathNodes = getBfsPath(finishNode);
          break;
        case AlgorithmType.DFS:
          visitedNodes = dfs(algorithmGrid, startNode, finishNode);
          pathNodes = getDfsPath(finishNode);
          break;
        case AlgorithmType.GREEDY_BEST_FIRST:
          visitedNodes = greedyBestFirst(algorithmGrid, startNode, finishNode);
          pathNodes = getGreedyPath(finishNode);
          break;
        case AlgorithmType.BIDIRECTIONAL_BFS:
          visitedNodes = bidirectionalBFS(algorithmGrid, startNode, finishNode);
          pathNodes = getBidirectionalPath(finishNode);
          break;
        case AlgorithmType.BIDIRECTIONAL_ASTAR:
          visitedNodes = bidirectionalAStar(
            algorithmGrid,
            startNode,
            finishNode
          );
          pathNodes = getBidirectionalAStarPath(finishNode);
          break;
        case AlgorithmType.JUMP_POINT_SEARCH:
          visitedNodes = jumpPointSearch(algorithmGrid, startNode, finishNode);
          pathNodes = getJPSPath(finishNode);
          break;
        case AlgorithmType.DIJKSTRA:
        default:
          visitedNodes = dijkstra(algorithmGrid, startNode, finishNode);
          pathNodes = getNodesInShortestPathOrder(finishNode);
          break;
      }

      return { visitedNodes, pathNodes };
    },
    []
  );

  /**
   * Main visualization function for pathfinding algorithms
   *
   * ARCHITECTURE: Web Worker Isolation for Scientific Timing
   * - Phase 1: ASYNC BENCHMARK - Run in Web Worker (isolated from UI thread)
   * - Phase 2: LOCAL EXECUTION - Run once on main thread for animation data
   * - Phase 3: ANIMATION - DOM manipulation for visual feedback
   * - Phase 4: CLEANUP - Reset animation state
   *
   * The timing number comes from the Worker (rock-solid stable).
   * The animation data comes from a single main-thread run (visual only).
   */
  const visualizePathfinding = useCallback(
    async (
      algorithm: AlgorithmType,
      grid: Grid,
      _setGrid: React.Dispatch<React.SetStateAction<Grid>>,
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number,
      statsCallbacks?: StatsCallbacks
    ): Promise<void> => {
      // Prevent multiple visualizations
      if (isAnimating.current) return;

      // Clear any previous visualization (DOM classes)
      clearAllTimeouts();
      clearVisualizationClasses();

      // Mark as visualizing
      isAnimating.current = true;
      setIsVisualizing(true);

      // === PHASE 1: WEB WORKER BENCHMARK (Isolated Thread) ===
      // This runs in a separate thread - no UI interference
      let benchmarkResult: { avgTime: number } | null = null;
      try {
        benchmarkResult = await runBenchmark(
          algorithm,
          grid,
          BENCHMARK_MIN_DURATION
        );
      } catch (error) {
        console.warn("Worker benchmark failed, using fallback:", error);
        // Fallback: single measurement on main thread
        benchmarkResult = null;
      }

      // === PHASE 2: LOCAL EXECUTION (For Animation Data) ===
      // Run algorithm once on main thread to get visitedNodes for animation
      // This execution time is NOT reported - only used for visual data
      const algorithmGrid: Grid = grid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          distance: Infinity,
          previousNode: null,
        }))
      );

      let startNode: Node | null = null;
      let finishNode: Node | null = null;
      for (const row of algorithmGrid) {
        for (const node of row) {
          if (node.isStart) startNode = node;
          if (node.isFinish) finishNode = node;
        }
      }

      if (!startNode || !finishNode) {
        console.error("Start or Finish node not found!");
        isAnimating.current = false;
        setIsVisualizing(false);
        return;
      }

      // Fallback timing if worker failed
      const fallbackStart = performance.now();
      const { visitedNodes, pathNodes } = runAlgorithm(
        algorithm,
        algorithmGrid,
        startNode,
        finishNode
      );
      const fallbackTime = performance.now() - fallbackStart;

      // Use worker time if available, otherwise fallback
      const executionTime = benchmarkResult?.avgTime ?? fallbackTime;

      const visitedNodesInOrder = visitedNodes;
      const nodesInShortestPathOrder = pathNodes;

      // Check if path was found
      const pathFound = nodesInShortestPathOrder.length > 1;

      // Capture stats
      const stats: AlgorithmStats = {
        algorithm,
        executionTime,
        visitedCount: visitedNodesInOrder.length,
        pathLength: pathFound ? nodesInShortestPathOrder.length : -1,
      };

      // === PHASE 3: ANIMATION (DOM Manipulation) ===
      animateVisitedNodes(visitedNodesInOrder, speed, () => {
        if (!pathFound) {
          isAnimating.current = false;
          setIsVisualizing(false);

          if (statsCallbacks) {
            statsCallbacks.setVisualizationStats(stats);
            if (statsCallbacks.showToast) {
              statsCallbacks.showToast(
                "Target is unreachable! No path exists."
              );
            }
            setTimeout(() => {
              statsCallbacks.scrollToStats();
            }, 500);
          }
          return;
        }

        const pathDelay = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder, speed, () => {
            // === PHASE 4: CLEANUP ===
            isAnimating.current = false;
            setIsVisualizing(false);

            if (statsCallbacks) {
              statsCallbacks.setVisualizationStats(stats);
              setTimeout(() => {
                statsCallbacks.scrollToStats();
              }, 500);
            }
          });
        }, 50);
        timeoutIds.current.push(pathDelay);
      });
    },
    [
      clearAllTimeouts,
      clearVisualizationClasses,
      animateVisitedNodes,
      animateShortestPath,
      runAlgorithm,
      runBenchmark,
      BENCHMARK_MIN_DURATION,
    ]
  );

  /**
   * Removes wall CSS classes from all nodes via DOM
   */
  const clearWallClasses = useCallback((): void => {
    const wallNodes = document.querySelectorAll(".node-wall");
    wallNodes.forEach((node) => {
      node.classList.remove("node-wall");
    });
  }, []);

  /**
   * Animates maze wall generation
   * Uses setTimeout to sequentially add walls for visual effect
   * Protects Start/Finish nodes from being turned into walls
   */
  const animateMazeWalls = useCallback(
    (wallsInOrder: Node[], speed: number, onComplete: () => void): void => {
      for (let i = 0; i < wallsInOrder.length; i++) {
        const timeoutId = setTimeout(() => {
          const node = wallsInOrder[i];

          // PROTECTION: Skip Start and Finish nodes (never turn them into walls)
          if (node.isStart || node.isFinish) {
            // If this is the last wall, trigger completion
            if (i === wallsInOrder.length - 1) {
              onComplete();
            }
            return;
          }

          // Direct DOM manipulation for wall animation
          const element = document.getElementById(
            `node-${node.row}-${node.col}`
          );
          if (element) {
            element.classList.add("node-wall");
          }

          // If this is the last wall, trigger completion
          if (i === wallsInOrder.length - 1) {
            onComplete();
          }
        }, i * speed);

        timeoutIds.current.push(timeoutId);
      }

      // Handle empty walls array
      if (wallsInOrder.length === 0) {
        onComplete();
      }
    },
    []
  );

  /**
   * Main maze generation function
   *
   * Steps:
   * A. Clear any existing visualization and walls
   * B. Get maze walls from algorithm
   * C. Animate wall building
   * D. Sync React state with final walls
   */
  const generateMaze = useCallback(
    (
      mazeType: MazeType,
      grid: Grid,
      setGrid: React.Dispatch<React.SetStateAction<Grid>>,
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number
    ): void => {
      // Prevent multiple generations
      if (isAnimating.current) return;

      // Clear any previous animations and timeouts
      clearAllTimeouts();

      // === DOM SAFETY NET ===
      // Explicitly clear ALL visualization classes from DOM before starting
      // This ensures a clean slate even if React state and DOM are out of sync
      clearVisualizationClasses(); // Removes .node-visited and .node-path
      clearWallClasses(); // Removes .node-wall

      // Step A: Clear walls AND pathfinding state from React state
      // First reset pathfinding (isVisited, distance, previousNode)
      const resetGrid = resetGridForPathfinding(grid);
      // Then clear walls
      const clearedGrid = clearWalls(resetGrid);
      setGrid(clearedGrid);

      // Find Start and Finish nodes
      let startNode: Node | null = null;
      let finishNode: Node | null = null;

      for (const row of clearedGrid) {
        for (const node of row) {
          if (node.isStart) startNode = node;
          if (node.isFinish) finishNode = node;
        }
      }

      // Safety check
      if (!startNode || !finishNode) {
        console.error("Start or Finish node not found!");
        return;
      }

      // Step B: Get maze walls based on algorithm type
      let wallsInOrder: Node[] = [];
      let animationSpeed = speed;

      switch (mazeType) {
        case MazeType.RECURSIVE_DIVISION:
          wallsInOrder = getRecursiveDivisionMaze(
            clearedGrid,
            startNode,
            finishNode
          );
          break;
        case MazeType.RANDOMIZED_DFS:
          wallsInOrder = getRandomizedDFSMaze(
            clearedGrid,
            startNode,
            finishNode
          );
          // DFS generates many walls - use faster animation (5ms min)
          animationSpeed = Math.max(5, speed / 3);
          break;
        case MazeType.PRIMS:
          wallsInOrder = getPrimsMaze(clearedGrid, startNode, finishNode);
          // Prim's generates many walls - use faster animation
          animationSpeed = Math.max(5, speed / 3);
          break;
        case MazeType.SPIRAL:
          wallsInOrder = getSpiralMaze(clearedGrid, startNode, finishNode);
          break;
        case MazeType.CELLULAR_AUTOMATA:
          wallsInOrder = getCellularAutomataMaze(
            clearedGrid,
            startNode,
            finishNode
          );
          // Cellular automata generates many walls - use faster animation
          animationSpeed = Math.max(5, speed / 3);
          break;
        default:
          console.error("Unknown maze type:", mazeType);
          return;
      }

      // Mark as visualizing
      isAnimating.current = true;
      setIsVisualizing(true);

      // Step C: Animate wall building
      // Use setTimeout to allow React to process the grid state update first
      // This ensures isVisited=false is rendered before animation starts
      setTimeout(() => {
        animateMazeWalls(wallsInOrder, animationSpeed, () => {
          // Step D: Sync React state with walls
          // This is CRUCIAL - without this, Dijkstra won't see the walls
          setGrid((currentGrid) => {
            const newGrid = currentGrid.map((row) =>
              row.map((node) => ({ ...node }))
            );

            // Mark all walls in the grid state
            for (const wall of wallsInOrder) {
              if (
                !newGrid[wall.row][wall.col].isStart &&
                !newGrid[wall.row][wall.col].isFinish
              ) {
                newGrid[wall.row][wall.col].isWall = true;
              }
            }

            return newGrid;
          });

          // Animation complete
          isAnimating.current = false;
          setIsVisualizing(false);
        });
      }, 50); // Small delay to let React re-render with cleared state
    },
    [
      clearAllTimeouts,
      clearVisualizationClasses,
      clearWallClasses,
      animateMazeWalls,
    ]
  );

  /**
   * Race Mode: Run two algorithms simultaneously and animate them together
   *
   * ARCHITECTURE: Web Worker Isolation for Scientific Timing (Both Algorithms)
   * - Phase 1: ASYNC BENCHMARK - Run both algorithms in Web Worker (parallel)
   * - Phase 2: LOCAL EXECUTION - Run once each on main thread for animation data
   * - Phase 3: ANIMATION - DOM manipulation for visual feedback
   * - Phase 4: CLEANUP - Reset animation state
   */
  const visualizeRace = useCallback(
    async (
      algo1: AlgorithmType,
      algo2: AlgorithmType,
      grid: Grid,
      _setGrid: React.Dispatch<React.SetStateAction<Grid>>,
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number,
      statsCallbacks?: StatsCallbacks
    ): Promise<void> => {
      // Prevent multiple visualizations
      if (isAnimating.current) return;

      // Clear any previous visualization
      clearAllTimeouts();
      clearVisualizationClasses();

      // Mark as visualizing
      isAnimating.current = true;
      setIsVisualizing(true);

      // === PHASE 1: WEB WORKER BENCHMARK (Both Algorithms in Parallel) ===
      let benchmark1Result: { avgTime: number } | null = null;
      let benchmark2Result: { avgTime: number } | null = null;

      try {
        // Run both benchmarks in parallel for efficiency
        const [b1, b2] = await Promise.all([
          runBenchmark(algo1, grid, BENCHMARK_MIN_DURATION),
          runBenchmark(algo2, grid, BENCHMARK_MIN_DURATION),
        ]);
        benchmark1Result = b1;
        benchmark2Result = b2;
      } catch (error) {
        console.warn("Worker benchmark failed, using fallback:", error);
      }

      // === PHASE 2: LOCAL EXECUTION (For Animation Data) ===
      const createGridCopy = (): Grid =>
        grid.map((row) =>
          row.map((node) => ({
            ...node,
            isVisited: false,
            distance: Infinity,
            previousNode: null,
          }))
        );

      const findNodes = (g: Grid): { start: Node; finish: Node } | null => {
        let start: Node | null = null;
        let finish: Node | null = null;
        for (const row of g) {
          for (const node of row) {
            if (node.isStart) start = node;
            if (node.isFinish) finish = node;
          }
        }
        if (!start || !finish) return null;
        return { start, finish };
      };

      // Run algo1 for animation data
      const grid1 = createGridCopy();
      const nodes1 = findNodes(grid1);
      if (!nodes1) {
        console.error("Start or Finish node not found!");
        isAnimating.current = false;
        setIsVisualizing(false);
        return;
      }

      const fallback1Start = performance.now();
      const result1 = runAlgorithm(algo1, grid1, nodes1.start, nodes1.finish);
      const fallback1Time = performance.now() - fallback1Start;

      // Run algo2 for animation data
      const grid2 = createGridCopy();
      const nodes2 = findNodes(grid2);
      if (!nodes2) {
        console.error("Start or Finish node not found!");
        isAnimating.current = false;
        setIsVisualizing(false);
        return;
      }

      const fallback2Start = performance.now();
      const result2 = runAlgorithm(algo2, grid2, nodes2.start, nodes2.finish);
      const fallback2Time = performance.now() - fallback2Start;

      // Use worker times if available
      const executionTime1 = benchmark1Result?.avgTime ?? fallback1Time;
      const executionTime2 = benchmark2Result?.avgTime ?? fallback2Time;

      const visited1 = result1.visitedNodes;
      const visited2 = result2.visitedNodes;
      const path1 = result1.pathNodes;
      const path2 = result2.pathNodes;

      // Check if paths were found
      const path1Found = path1.length > 1;
      const path2Found = path2.length > 1;

      // Capture stats
      const stats1: AlgorithmStats = {
        algorithm: algo1,
        executionTime: executionTime1,
        visitedCount: visited1.length,
        pathLength: path1Found ? path1.length : -1,
      };

      const stats2: AlgorithmStats = {
        algorithm: algo2,
        executionTime: executionTime2,
        visitedCount: visited2.length,
        pathLength: path2Found ? path2.length : -1,
      };

      // Determine winner
      let winner: "agent1" | "agent2" | "tie" = "tie";
      if (path1Found && path2Found) {
        if (path1.length < path2.length) {
          winner = "agent1";
        } else if (path2.length < path1.length) {
          winner = "agent2";
        } else if (stats1.executionTime < stats2.executionTime) {
          winner = "agent1";
        } else if (stats2.executionTime < stats1.executionTime) {
          winner = "agent2";
        }
      } else if (path1Found) {
        winner = "agent1";
      } else if (path2Found) {
        winner = "agent2";
      }

      const raceStats: RaceStats = {
        agent1: stats1,
        agent2: stats2,
        winner,
      };

      // Track which nodes have been visited by which agent
      const visitedByAgent1 = new Set<string>();
      const visitedByAgent2 = new Set<string>();

      // === PHASE 2: PARALLEL ANIMATION ===
      const maxVisitedLen = Math.max(visited1.length, visited2.length);

      for (let i = 0; i < maxVisitedLen; i++) {
        const timeoutId = setTimeout(() => {
          // Agent 1 animation
          if (i < visited1.length) {
            const node1 = visited1[i];
            if (!node1.isStart && !node1.isFinish) {
              const key1 = `${node1.row}-${node1.col}`;
              const element1 = document.getElementById(
                `node-${node1.row}-${node1.col}`
              );
              if (element1) {
                visitedByAgent1.add(key1);
                // Check if Agent 2 already visited this node
                if (visitedByAgent2.has(key1)) {
                  element1.classList.remove("node-visited-second");
                  element1.classList.add("node-visited-overlap");
                } else {
                  element1.classList.add("node-visited");
                }
              }
            }
          }

          // Agent 2 animation
          if (i < visited2.length) {
            const node2 = visited2[i];
            if (!node2.isStart && !node2.isFinish) {
              const key2 = `${node2.row}-${node2.col}`;
              const element2 = document.getElementById(
                `node-${node2.row}-${node2.col}`
              );
              if (element2) {
                visitedByAgent2.add(key2);
                // Check if Agent 1 already visited this node
                if (visitedByAgent1.has(key2)) {
                  element2.classList.remove("node-visited");
                  element2.classList.add("node-visited-overlap");
                } else {
                  element2.classList.add("node-visited-second");
                }
              }
            }
          }

          // After last visited node, animate paths
          if (i === maxVisitedLen - 1) {
            const pathDelay = setTimeout(() => {
              // Create a Set for path1 nodes for O(1) lookup (to detect overlaps)
              const path1Keys = new Set<string>();
              for (const node of path1) {
                path1Keys.add(`${node.row}-${node.col}`);
              }

              // Create a Set for path2 nodes for O(1) lookup
              const path2Keys = new Set<string>();
              for (const node of path2) {
                path2Keys.add(`${node.row}-${node.col}`);
              }

              // SIMPLIFIED: Path animation uses simple CSS classes
              // Complex SVG overlay will be added in a future component
              const maxPathLen = Math.max(path1.length, path2.length);

              for (let j = 0; j < maxPathLen; j++) {
                const pathTimeoutId = setTimeout(() => {
                  // Path 1 animation (Agent 1 - Yellow)
                  if (j < path1.length) {
                    const pathNode1 = path1[j];
                    if (!pathNode1.isStart && !pathNode1.isFinish) {
                      const key1 = `${pathNode1.row}-${pathNode1.col}`;
                      const element = document.getElementById(
                        `node-${pathNode1.row}-${pathNode1.col}`
                      );
                      if (element) {
                        element.classList.remove(
                          "node-visited",
                          "node-visited-second",
                          "node-visited-overlap"
                        );
                        // Check if this node is also in path2 (overlap)
                        if (path2Keys.has(key1)) {
                          // Simple overlap class (lime green for now)
                          element.classList.add("node-path-overlap");
                        } else {
                          element.classList.add("node-path");
                        }
                      }
                    }
                  }

                  // Path 2 animation (Agent 2 - Cyan)
                  if (j < path2.length) {
                    const pathNode2 = path2[j];
                    if (!pathNode2.isStart && !pathNode2.isFinish) {
                      const key2 = `${pathNode2.row}-${pathNode2.col}`;
                      const element = document.getElementById(
                        `node-${pathNode2.row}-${pathNode2.col}`
                      );
                      if (element) {
                        element.classList.remove(
                          "node-visited",
                          "node-visited-second",
                          "node-visited-overlap",
                          "node-path"
                        );
                        // Check if this node is also in path1 (overlap)
                        if (path1Keys.has(key2)) {
                          // Simple overlap class (lime green for now)
                          element.classList.add("node-path-overlap");
                        } else {
                          element.classList.add("node-path-second");
                        }
                      }
                    }
                  }

                  // After both paths complete
                  if (j === maxPathLen - 1) {
                    isAnimating.current = false;
                    setIsVisualizing(false);

                    // Update stats and scroll to statistics section
                    if (statsCallbacks) {
                      statsCallbacks.setVisualizationStats(raceStats);
                      setTimeout(() => {
                        statsCallbacks.scrollToStats();
                      }, 500);
                    }
                  }
                }, j * (speed * 3));

                timeoutIds.current.push(pathTimeoutId);
              }

              // Handle case where both paths are empty
              if (maxPathLen === 0) {
                isAnimating.current = false;
                setIsVisualizing(false);

                // Update stats and scroll even if no paths found
                if (statsCallbacks) {
                  statsCallbacks.setVisualizationStats(raceStats);
                  // Show toast if neither algorithm found a path
                  if (!path1Found && !path2Found && statsCallbacks.showToast) {
                    statsCallbacks.showToast(
                      "Target is unreachable! Neither algorithm found a path."
                    );
                  }
                  setTimeout(() => {
                    statsCallbacks.scrollToStats();
                  }, 500);
                }
              }
            }, 50);

            timeoutIds.current.push(pathDelay);
          }
        }, i * speed);

        timeoutIds.current.push(timeoutId);
      }

      // Handle case where both visited arrays are empty
      if (maxVisitedLen === 0) {
        isAnimating.current = false;
        setIsVisualizing(false);

        // Update stats and scroll even if nothing was visited
        if (statsCallbacks) {
          statsCallbacks.setVisualizationStats(raceStats);
          setTimeout(() => {
            statsCallbacks.scrollToStats();
          }, 500);
        }
      }
    },
    [
      clearAllTimeouts,
      clearVisualizationClasses,
      runAlgorithm,
      runBenchmark,
      BENCHMARK_MIN_DURATION,
    ]
  );

  return {
    visualizePathfinding,
    visualizeRace,
    generateMaze,
    clearVisualization,
    isAnimating,
  };
};

export default useVisualization;
