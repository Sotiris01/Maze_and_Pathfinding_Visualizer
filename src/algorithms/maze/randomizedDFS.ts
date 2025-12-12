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
 * Time Complexity: O(V) where V = number of cells
 * Space Complexity: O(V) for visited grid and stack
 *
 * Output: Returns array of wall nodes for animation (inverse of carved passages)
 */

import { Grid, Node } from "../../types";

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

  // Carve the maze using iterative DFS (avoids stack overflow)
  carveIterative(
    grid,
    startRow,
    startCol,
    numRows,
    numCols,
    visited,
    passagesInOrder
  );

  // Ensure start and finish nodes are passages and connected to maze
  ensureConnected(startNode, visited, numRows, numCols);
  ensureConnected(finishNode, visited, numRows, numCols);

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
 * Iterative carving function using explicit stack (no recursion)
 * Carves passages by visiting cells 2 steps apart
 * This avoids stack overflow on large grids
 */
function carveIterative(
  grid: Grid,
  startRow: number,
  startCol: number,
  numRows: number,
  numCols: number,
  visited: VisitedGrid,
  passagesInOrder: Node[]
): void {
  // Stack holds [row, col] positions to process
  const stack: [number, number][] = [[startRow, startCol]];

  // Mark starting cell as passage
  visited[startRow][startCol] = true;
  passagesInOrder.push(grid[startRow][startCol]);

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1]; // Peek top

    // Get unvisited neighbors 2 cells away
    const neighbors = getUnvisitedNeighbors(
      row,
      col,
      numRows,
      numCols,
      visited
    );

    if (neighbors.length === 0) {
      // No unvisited neighbors - backtrack
      stack.pop();
    } else {
      // Pick a random neighbor
      const randomIndex = Math.floor(Math.random() * neighbors.length);
      const [nextRow, nextCol] = neighbors[randomIndex];

      // Carve the wall between current and neighbor
      const wallRow = row + (nextRow - row) / 2;
      const wallCol = col + (nextCol - col) / 2;
      visited[wallRow][wallCol] = true;
      passagesInOrder.push(grid[wallRow][wallCol]);

      // Mark neighbor as visited and push to stack
      visited[nextRow][nextCol] = true;
      passagesInOrder.push(grid[nextRow][nextCol]);
      stack.push([nextRow, nextCol]);
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
    [2, 0], // Down
    [0, -2], // Left
    [0, 2], // Right
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
 * Ensures a node is a passage and connected to the main maze
 * Uses BFS to find nearest passage and carves a path to it
 */
function ensureConnected(
  node: Node,
  visited: VisitedGrid,
  numRows: number,
  numCols: number
): void {
  // If already a passage, we're done
  if (visited[node.row][node.col]) {
    return;
  }

  // Mark the node itself as passage
  visited[node.row][node.col] = true;

  // BFS to find nearest existing passage
  const bfsVisited = new Set<string>();
  const queue: [number, number, [number, number][]][] = [
    [node.row, node.col, []],
  ];
  bfsVisited.add(`${node.row}-${node.col}`);

  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0) {
    // Use index-based dequeue to avoid O(n) shift
    const [row, col, path] = queue.shift()!;

    // Check if this cell is part of the main maze (already a passage)
    if (visited[row][col] && path.length > 0) {
      // Carve the path to connect to the maze
      for (const [pRow, pCol] of path) {
        visited[pRow][pCol] = true;
      }
      return;
    }

    // Explore neighbors
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      const key = `${newRow}-${newCol}`;

      if (
        newRow >= 0 &&
        newRow < numRows &&
        newCol >= 0 &&
        newCol < numCols &&
        !bfsVisited.has(key)
      ) {
        bfsVisited.add(key);
        queue.push([newRow, newCol, [...path, [newRow, newCol]]]);
      }
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
