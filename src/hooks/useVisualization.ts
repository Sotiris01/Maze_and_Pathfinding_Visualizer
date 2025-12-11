/**
 * useVisualization Hook
 * Phase B & C: Animation System for Pathfinding and Maze Generation
 *
 * Uses direct DOM manipulation for performance (1000+ nodes).
 * Does NOT use React setState inside animation loops.
 */

import { useCallback, useRef } from 'react';
import { Grid, Node, MazeType, AlgorithmType } from '../types';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/pathfinding/dijkstra';
import { astar, getNodesInShortestPathOrder as getAstarPath } from '../algorithms/pathfinding/astar';
import { bfs, getNodesInShortestPathOrder as getBfsPath } from '../algorithms/pathfinding/bfs';
import { dfs, getNodesInShortestPathOrder as getDfsPath } from '../algorithms/pathfinding/dfs';
import { getRecursiveDivisionMaze } from '../algorithms/maze/recursiveDivision';
import { getRandomizedDFSMaze } from '../algorithms/maze/randomizedDFS';
import { resetGridForPathfinding, clearWalls } from '../utils/gridUtils';
import { AlgorithmStats, RaceStats } from '../components/Modals/StatsModal';

/**
 * Callbacks for stats and scroll behavior
 */
interface StatsCallbacks {
  setVisualizationStats: React.Dispatch<React.SetStateAction<AlgorithmStats | RaceStats | null>>;
  scrollToStats: () => void;
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
    const visitedNodes = document.querySelectorAll('.node-visited');
    const pathNodes = document.querySelectorAll('.node-path');
    const visitedNodesSecond = document.querySelectorAll('.node-visited-second');
    const pathNodesSecond = document.querySelectorAll('.node-path-second');
    const overlapNodes = document.querySelectorAll('.node-visited-overlap');
    // Simple path overlap class (for mixed color)
    const pathOverlapNodes = document.querySelectorAll('.node-path-overlap');

    visitedNodes.forEach((node) => {
      node.classList.remove('node-visited');
    });

    pathNodes.forEach((node) => {
      node.classList.remove('node-path');
    });

    visitedNodesSecond.forEach((node) => {
      node.classList.remove('node-visited-second');
    });

    pathNodesSecond.forEach((node) => {
      node.classList.remove('node-path-second');
    });

    overlapNodes.forEach((node) => {
      node.classList.remove('node-visited-overlap');
    });

    // Clear simple path overlap class
    pathOverlapNodes.forEach((node) => {
      node.classList.remove('node-path-overlap');
    });
  }, []);

  /**
   * Clears the visualization (both DOM and React state)
   */
  const clearVisualization = useCallback(
    (
      grid: Grid,
      setGrid: React.Dispatch<React.SetStateAction<Grid>>
    ): void => {
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
          const element = document.getElementById(`node-${node.row}-${node.col}`);
          if (element) {
            element.classList.add('node-visited');
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
          const element = document.getElementById(`node-${node.row}-${node.col}`);
          if (element) {
            // Remove visited class first, then add path class
            element.classList.remove('node-visited');
            element.classList.add('node-path');
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
   * Main visualization function for pathfinding algorithms
   *
   * CRITICAL: Strict separation between Calculation and Visualization
   * - Phase 1: Calculation (Pure Logic) - NO React state updates
   * - Phase 2: Animation (DOM Manipulation) - Progressive visual feedback
   * - Phase 3: Cleanup - Reset animation state
   *
   * The algorithm runs on a DEEP COPY of the grid to prevent React re-renders
   * from showing the final state before animation completes.
   */
  const visualizePathfinding = useCallback(
    (
      algorithm: AlgorithmType,
      grid: Grid,
      _setGrid: React.Dispatch<React.SetStateAction<Grid>>, // Unused - kept for API consistency
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number,
      statsCallbacks?: StatsCallbacks
    ): void => {
      // Prevent multiple visualizations
      if (isAnimating.current) return;

      // Clear any previous visualization (DOM classes)
      clearAllTimeouts();
      clearVisualizationClasses();

      // CRITICAL: Create a DEEP COPY of the grid for algorithm execution
      // This prevents the algorithm from mutating React state
      // The original grid in React state stays "clean" (isVisited: false)
      const algorithmGrid: Grid = grid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          distance: Infinity,
          previousNode: null,
        }))
      );

      // Find Start and Finish nodes from the ALGORITHM COPY
      let startNode: Node | null = null;
      let finishNode: Node | null = null;

      for (const row of algorithmGrid) {
        for (const node of row) {
          if (node.isStart) startNode = node;
          if (node.isFinish) finishNode = node;
        }
      }

      // Safety check
      if (!startNode || !finishNode) {
        console.error('Start or Finish node not found!');
        return;
      }

      // Mark as visualizing BEFORE algorithm runs
      isAnimating.current = true;
      setIsVisualizing(true);

      // === PHASE 1: CALCULATION (Pure Logic) ===
      // Run pathfinding algorithm on the COPY - this mutates algorithmGrid, NOT React state
      // The original grid in React state remains unchanged (all nodes white)
      let visitedNodesInOrder: Node[] = [];
      let nodesInShortestPathOrder: Node[] = [];

      // Start timing for metrics
      const startTime = performance.now();

      switch (algorithm) {
        case AlgorithmType.ASTAR:
          visitedNodesInOrder = astar(algorithmGrid, startNode, finishNode);
          nodesInShortestPathOrder = getAstarPath(finishNode);
          break;
        case AlgorithmType.BFS:
          visitedNodesInOrder = bfs(algorithmGrid, startNode, finishNode);
          nodesInShortestPathOrder = getBfsPath(finishNode);
          break;
        case AlgorithmType.DFS:
          visitedNodesInOrder = dfs(algorithmGrid, startNode, finishNode);
          nodesInShortestPathOrder = getDfsPath(finishNode);
          break;
        case AlgorithmType.DIJKSTRA:
        default:
          visitedNodesInOrder = dijkstra(algorithmGrid, startNode, finishNode);
          nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
          break;
      }

      // End timing
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Capture stats for single algorithm mode
      const stats: AlgorithmStats = {
        algorithm,
        executionTime,
        visitedCount: visitedNodesInOrder.length,
        pathLength: nodesInShortestPathOrder.length,
      };

      // === PHASE 2: ANIMATION (DOM Manipulation) ===
      // Now animate using setTimeout + DOM classList
      // React state is NOT updated - only CSS classes are toggled
      animateVisitedNodes(visitedNodesInOrder, speed, () => {
        // After visited animation, animate shortest path
        const pathDelay = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder, speed, () => {
            // === PHASE 3: CLEANUP ===
            // Animation complete - reset flags
            isAnimating.current = false;
            setIsVisualizing(false);
            
            // Update stats and scroll to statistics section
            if (statsCallbacks) {
              statsCallbacks.setVisualizationStats(stats);
              // Small delay before scrolling to let user see the final path
              setTimeout(() => {
                statsCallbacks.scrollToStats();
              }, 500);
            }
            // NOTE: We intentionally do NOT sync React state here
            // The visual state (DOM classes) is the source of truth during visualization
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
    ]
  );

  /**
   * Removes wall CSS classes from all nodes via DOM
   */
  const clearWallClasses = useCallback((): void => {
    const wallNodes = document.querySelectorAll('.node-wall');
    wallNodes.forEach((node) => {
      node.classList.remove('node-wall');
    });
  }, []);

  /**
   * Animates maze wall generation
   * Uses setTimeout to sequentially add walls for visual effect
   * Protects Start/Finish nodes from being turned into walls
   */
  const animateMazeWalls = useCallback(
    (
      wallsInOrder: Node[],
      speed: number,
      onComplete: () => void
    ): void => {
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
          const element = document.getElementById(`node-${node.row}-${node.col}`);
          if (element) {
            element.classList.add('node-wall');
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
      clearWallClasses();          // Removes .node-wall

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
        console.error('Start or Finish node not found!');
        return;
      }

      // Step B: Get maze walls based on algorithm type
      let wallsInOrder: Node[] = [];
      let animationSpeed = speed;

      switch (mazeType) {
        case MazeType.RECURSIVE_DIVISION:
          wallsInOrder = getRecursiveDivisionMaze(clearedGrid, startNode, finishNode);
          break;
        case MazeType.RANDOMIZED_DFS:
          wallsInOrder = getRandomizedDFSMaze(clearedGrid, startNode, finishNode);
          // DFS generates many walls - use faster animation (5ms min)
          animationSpeed = Math.max(5, speed / 3);
          break;
        default:
          console.error('Unknown maze type:', mazeType);
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
            const newGrid = currentGrid.map((row) => row.map((node) => ({ ...node })));

            // Mark all walls in the grid state
            for (const wall of wallsInOrder) {
              if (!newGrid[wall.row][wall.col].isStart && !newGrid[wall.row][wall.col].isFinish) {
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
   * Helper function to run an algorithm and get results
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
   * Race Mode: Run two algorithms simultaneously and animate them together
   *
   * Algorithm Logic:
   * 1. Create two independent deep copies of the grid
   * 2. Run both algorithms on their respective copies
   * 3. Animate both visited node arrays in parallel (step by step)
   * 4. Handle overlaps with a special class
   * 5. Animate both paths after visited animation completes
   */
  const visualizeRace = useCallback(
    (
      algo1: AlgorithmType,
      algo2: AlgorithmType,
      grid: Grid,
      _setGrid: React.Dispatch<React.SetStateAction<Grid>>,
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number,
      statsCallbacks?: StatsCallbacks
    ): void => {
      // Prevent multiple visualizations
      if (isAnimating.current) return;

      // Clear any previous visualization
      clearAllTimeouts();
      clearVisualizationClasses();

      // Create TWO independent deep copies - one for each algorithm
      const createGridCopy = (): Grid =>
        grid.map((row) =>
          row.map((node) => ({
            ...node,
            isVisited: false,
            distance: Infinity,
            previousNode: null,
          }))
        );

      const grid1 = createGridCopy();
      const grid2 = createGridCopy();

      // Find Start and Finish nodes from each copy
      let startNode1: Node | null = null;
      let finishNode1: Node | null = null;
      let startNode2: Node | null = null;
      let finishNode2: Node | null = null;

      for (const row of grid1) {
        for (const node of row) {
          if (node.isStart) startNode1 = node;
          if (node.isFinish) finishNode1 = node;
        }
      }

      for (const row of grid2) {
        for (const node of row) {
          if (node.isStart) startNode2 = node;
          if (node.isFinish) finishNode2 = node;
        }
      }

      // Safety check
      if (!startNode1 || !finishNode1 || !startNode2 || !finishNode2) {
        console.error('Start or Finish node not found!');
        return;
      }

      // Mark as visualizing
      isAnimating.current = true;
      setIsVisualizing(true);

      // === PHASE 1: CALCULATION ===
      // Run both algorithms on their respective grid copies with timing
      const startTime1 = performance.now();
      const result1 = runAlgorithm(algo1, grid1, startNode1, finishNode1);
      const endTime1 = performance.now();

      const startTime2 = performance.now();
      const result2 = runAlgorithm(algo2, grid2, startNode2, finishNode2);
      const endTime2 = performance.now();

      const visited1 = result1.visitedNodes;
      const visited2 = result2.visitedNodes;
      const path1 = result1.pathNodes;
      const path2 = result2.pathNodes;

      // Capture stats for both algorithms
      const stats1: AlgorithmStats = {
        algorithm: algo1,
        executionTime: endTime1 - startTime1,
        visitedCount: visited1.length,
        pathLength: path1.length,
      };

      const stats2: AlgorithmStats = {
        algorithm: algo2,
        executionTime: endTime2 - startTime2,
        visitedCount: visited2.length,
        pathLength: path2.length,
      };

      // Determine winner (shorter path = winner, tie if equal or no path)
      let winner: 'agent1' | 'agent2' | 'tie' = 'tie';
      if (path1.length > 0 && path2.length > 0) {
        if (path1.length < path2.length) {
          winner = 'agent1';
        } else if (path2.length < path1.length) {
          winner = 'agent2';
        }
        // If paths are equal, compare execution time
        if (path1.length === path2.length) {
          if (stats1.executionTime < stats2.executionTime) {
            winner = 'agent1';
          } else if (stats2.executionTime < stats1.executionTime) {
            winner = 'agent2';
          }
        }
      } else if (path1.length > 0) {
        winner = 'agent1';
      } else if (path2.length > 0) {
        winner = 'agent2';
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
              const element1 = document.getElementById(`node-${node1.row}-${node1.col}`);
              if (element1) {
                visitedByAgent1.add(key1);
                // Check if Agent 2 already visited this node
                if (visitedByAgent2.has(key1)) {
                  element1.classList.remove('node-visited-second');
                  element1.classList.add('node-visited-overlap');
                } else {
                  element1.classList.add('node-visited');
                }
              }
            }
          }

          // Agent 2 animation
          if (i < visited2.length) {
            const node2 = visited2[i];
            if (!node2.isStart && !node2.isFinish) {
              const key2 = `${node2.row}-${node2.col}`;
              const element2 = document.getElementById(`node-${node2.row}-${node2.col}`);
              if (element2) {
                visitedByAgent2.add(key2);
                // Check if Agent 1 already visited this node
                if (visitedByAgent1.has(key2)) {
                  element2.classList.remove('node-visited');
                  element2.classList.add('node-visited-overlap');
                } else {
                  element2.classList.add('node-visited-second');
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
                      const element = document.getElementById(`node-${pathNode1.row}-${pathNode1.col}`);
                      if (element) {
                        element.classList.remove('node-visited', 'node-visited-second', 'node-visited-overlap');
                        // Check if this node is also in path2 (overlap)
                        if (path2Keys.has(key1)) {
                          // Simple overlap class (lime green for now)
                          element.classList.add('node-path-overlap');
                        } else {
                          element.classList.add('node-path');
                        }
                      }
                    }
                  }

                  // Path 2 animation (Agent 2 - Cyan)
                  if (j < path2.length) {
                    const pathNode2 = path2[j];
                    if (!pathNode2.isStart && !pathNode2.isFinish) {
                      const key2 = `${pathNode2.row}-${pathNode2.col}`;
                      const element = document.getElementById(`node-${pathNode2.row}-${pathNode2.col}`);
                      if (element) {
                        element.classList.remove('node-visited', 'node-visited-second', 'node-visited-overlap', 'node-path');
                        // Check if this node is also in path1 (overlap)
                        if (path1Keys.has(key2)) {
                          // Simple overlap class (lime green for now)
                          element.classList.add('node-path-overlap');
                        } else {
                          element.classList.add('node-path-second');
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
    [clearAllTimeouts, clearVisualizationClasses, runAlgorithm]
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
