/**
 * useVisualization Hook
 * Phase B & C: Animation System for Pathfinding and Maze Generation
 *
 * Uses direct DOM manipulation for performance (1000+ nodes).
 * Does NOT use React setState inside animation loops.
 */

import { useCallback, useRef } from 'react';
import { Grid, Node, MazeType } from '../types';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/pathfinding/dijkstra';
import { getRecursiveDivisionMaze } from '../algorithms/maze/recursiveDivision';
import { getRandomizedDFSMaze } from '../algorithms/maze/randomizedDFS';
import { resetGridForPathfinding, clearWalls } from '../utils/gridUtils';

/**
 * Return type for the useVisualization hook
 */
interface UseVisualizationReturn {
  visualizeDijkstra: (
    grid: Grid,
    setGrid: React.Dispatch<React.SetStateAction<Grid>>,
    setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
    speed: number
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
   */
  const clearVisualizationClasses = useCallback((): void => {
    // Remove visited and path classes from all nodes
    const visitedNodes = document.querySelectorAll('.node-visited');
    const pathNodes = document.querySelectorAll('.node-path');

    visitedNodes.forEach((node) => {
      node.classList.remove('node-visited');
    });

    pathNodes.forEach((node) => {
      node.classList.remove('node-path');
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
   * Main visualization function for Dijkstra's algorithm
   *
   * CRITICAL: Strict separation between Calculation and Visualization
   * - Phase 1: Calculation (Pure Logic) - NO React state updates
   * - Phase 2: Animation (DOM Manipulation) - Progressive visual feedback
   * - Phase 3: Cleanup - Reset animation state
   *
   * The algorithm runs on a DEEP COPY of the grid to prevent React re-renders
   * from showing the final state before animation completes.
   */
  const visualizeDijkstra = useCallback(
    (
      grid: Grid,
      _setGrid: React.Dispatch<React.SetStateAction<Grid>>, // Unused - kept for API consistency
      setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>,
      speed: number
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
      // Run Dijkstra on the COPY - this mutates algorithmGrid, NOT React state
      // The original grid in React state remains unchanged (all nodes white)
      const visitedNodesInOrder = dijkstra(algorithmGrid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

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

  return {
    visualizeDijkstra,
    generateMaze,
    clearVisualization,
    isAnimating,
  };
};

export default useVisualization;
