/**
 * Randomized DFS (Recursive Backtracker) Maze Generation Algorithm
 * Phase C: Maze Generation
 *
 * This algorithm creates a maze by "carving" passages through a grid of walls.
 * It uses depth-first search with random neighbor selection to create
 * organic, winding passages with long corridors.
 *
 * Key Concepts:
 * - Start with a grid conceptually full of walls
 * - Carve passages using DFS with random neighbor order
 * - Each step moves 2 cells to leave room for walls between passages
 * - Results in a "perfect maze" (exactly one path between any two points)
 *
 * Output: Returns array of wall nodes for animation (inverse of carved passages)
 */

import { Grid, Node } from '../../types';

/**
 * Tracks which cells have been visited during maze generation
 * true = passage (carved), false = wall (uncarved)
 */
type VisitedGrid = boolean[][];

/**
 * Main function to generate a Randomized DFS maze
 *
 * @param grid - The current grid
 * @param startNode - The start node (must remain accessible)
 * @param finishNode - The finish node (must remain accessible)
 * @returns Array of nodes representing walls in the order they should be built
 */
export function getRandomizedDFSMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Initialize visited grid - all false (all walls)
  const visited: VisitedGrid = Array.from({ length: numRows }, () =>
    Array(numCols).fill(false)
  );

  // Track the order of carved passages (for potential future use)
  const passagesInOrder: Node[] = [];

  // Start carving from position (0, 0) - full grid without border
  const startRow = 0;
  const startCol = 0;

  // Carve the maze using recursive DFS
  carve(grid, startRow, startCol, visited, passagesInOrder);

  // Ensure start and finish nodes are passages (not walls)
  ensureAccessible(grid, startNode, visited);
  ensureAccessible(grid, finishNode, visited);

  // Build the walls array - all non-passage cells become walls
  const wallsInOrder: Node[] = [];

  // Add all walls (cells that weren't carved as passages) - no border frame
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (!visited[row][col]) {
        // This cell is a wall (not carved)
        if (!isStartOrFinish(row, col, startNode, finishNode)) {
          wallsInOrder.push(grid[row][col]);
        }
      }
    }
  }

  return wallsInOrder;
}

/**
 * Recursive carving function using DFS
 * Carves passages by visiting cells 2 steps apart
 */
function carve(
  grid: Grid,
  row: number,
  col: number,
  visited: VisitedGrid,
  passagesInOrder: Node[]
): void {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Mark current cell as passage
  visited[row][col] = true;
  passagesInOrder.push(grid[row][col]);

  // Get neighbors 2 cells away (to leave room for walls)
  const neighbors = getUnvisitedNeighbors(row, col, numRows, numCols, visited);

  // Shuffle neighbors for randomness
  shuffleArray(neighbors);

  // Visit each neighbor
  for (const neighbor of neighbors) {
    const [nextRow, nextCol] = neighbor;

    // Check if still unvisited (might have been visited from another path)
    if (!visited[nextRow][nextCol]) {
      // Carve the wall between current and neighbor
      const wallRow = row + (nextRow - row) / 2;
      const wallCol = col + (nextCol - col) / 2;
      visited[wallRow][wallCol] = true;
      passagesInOrder.push(grid[wallRow][wallCol]);

      // Recursively carve from neighbor
      carve(grid, nextRow, nextCol, visited, passagesInOrder);
    }
  }
}

/**
 * Gets unvisited neighbors 2 cells away
 * Used to ensure walls remain between passages
 */
function getUnvisitedNeighbors(
  row: number,
  col: number,
  numRows: number,
  numCols: number,
  visited: VisitedGrid
): [number, number][] {
  const neighbors: [number, number][] = [];

  // Check 2 cells in each direction
  const directions: [number, number][] = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Check bounds (allow full grid edges)
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      if (!visited[newRow][newCol]) {
        neighbors.push([newRow, newCol]);
      }
    }
  }

  return neighbors;
}

/**
 * Fisher-Yates shuffle algorithm
 * Randomizes the order of neighbors for maze variety
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Ensures a specific node and its surroundings are accessible (not walls)
 * Creates a small clearing around start/finish nodes
 */
function ensureAccessible(
  grid: Grid,
  node: Node,
  visited: VisitedGrid
): void {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Mark the node itself as passage
  visited[node.row][node.col] = true;

  // Also clear adjacent cells to ensure connectivity
  const directions: [number, number][] = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = node.row + dRow;
    const newCol = node.col + dCol;

    // Allow clearing cells at edges (full grid bounds)
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      visited[newRow][newCol] = true;
    }
  }
}

/**
 * Checks if a position is the start or finish node
 */
function isStartOrFinish(
  row: number,
  col: number,
  startNode: Node,
  finishNode: Node
): boolean {
  return (
    (row === startNode.row && col === startNode.col) ||
    (row === finishNode.row && col === finishNode.col)
  );
}

export default getRandomizedDFSMaze;
