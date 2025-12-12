/**
 * Prim's Maze Generation Algorithm (Randomized)
 * Phase F: Extensions & History
 *
 * Creates a maze using a randomized version of Prim's minimum spanning tree algorithm.
 * Unlike Recursive Division (which starts empty and adds walls), Prim's starts with
 * ALL walls and carves passages.
 *
 * Key Characteristics:
 * - Produces "organic" looking mazes with many dead ends
 * - Different feel from Recursive Division (more cave-like, less structured)
 * - Guaranteed to create a perfect maze (exactly one path between any two cells)
 *
 * Algorithm (Randomized Prim's):
 * 1. Start with a grid full of walls
 * 2. Pick a starting cell, mark it as a passage
 * 3. Add its wall neighbors to a "frontier" list
 * 4. While frontier is not empty:
 *    a. Pick a random cell from the frontier
 *    b. Find its neighbors that are already passages
 *    c. Connect to ONE random passage neighbor (carve the wall between them)
 *    d. Mark the frontier cell as a passage
 *    e. Add the frontier cell's wall neighbors to the frontier
 * 5. Ensure start and finish nodes are passages
 */

import { Grid, Node } from "../../types";

/**
 * Main function to generate a Prim's maze
 *
 * @param grid - The current grid
 * @param startNode - The start node (must remain open)
 * @param finishNode - The finish node (must remain open)
 * @returns Array of nodes representing walls in the order they should be built
 */
export function getPrimsMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Create a passage map: true = passage, false = wall
  // We'll use this to track the maze state during generation
  const isPassage: boolean[][] = Array.from({ length: numRows }, () =>
    Array(numCols).fill(false)
  );

  // Set to track cells in frontier
  const inFrontier = new Set<string>();

  // Frontier list - cells to potentially become passages
  const frontier: [number, number][] = [];

  // Helper to get cell key
  const getKey = (row: number, col: number): string => `${row}-${col}`;

  // Start position - use a cell near the start node
  // Using odd coordinates ensures proper maze structure
  const startRow = Math.max(1, Math.min(numRows - 2, startNode.row | 1)); // Ensure odd
  const startCol = Math.max(1, Math.min(numCols - 2, startNode.col | 1)); // Ensure odd

  // Mark starting cell as passage
  isPassage[startRow][startCol] = true;

  // Add initial frontier cells (neighbors 2 steps away, within bounds)
  addFrontier(
    startRow,
    startCol,
    numRows,
    numCols,
    isPassage,
    frontier,
    inFrontier
  );

  // Main loop - process frontier cells
  while (frontier.length > 0) {
    // Pick a random cell from the frontier
    const randomIndex = Math.floor(Math.random() * frontier.length);
    const [row, col] = frontier[randomIndex];

    // Remove from frontier
    frontier.splice(randomIndex, 1);
    inFrontier.delete(getKey(row, col));

    // Skip if already a passage (can happen due to multiple additions)
    if (isPassage[row][col]) {
      continue;
    }

    // Find passage neighbors (cells 2 steps away that are passages)
    const passageNeighbors = getPassageNeighbors(
      row,
      col,
      numRows,
      numCols,
      isPassage
    );

    if (passageNeighbors.length > 0) {
      // Pick a random passage neighbor to connect to
      const [neighborRow, neighborCol] =
        passageNeighbors[Math.floor(Math.random() * passageNeighbors.length)];

      // Carve passage: mark current cell as passage
      isPassage[row][col] = true;

      // Carve the wall between current cell and the passage neighbor
      const wallRow = (row + neighborRow) / 2;
      const wallCol = (col + neighborCol) / 2;
      isPassage[wallRow][wallCol] = true;

      // Add new frontier cells from this newly opened cell
      addFrontier(row, col, numRows, numCols, isPassage, frontier, inFrontier);
    }
  }

  // Ensure start and finish nodes are passages
  ensureNodeIsPassage(startNode, isPassage, numRows, numCols);
  ensureNodeIsPassage(finishNode, isPassage, numRows, numCols);

  // Ensure path from start to nearest passage
  connectToNearestPassage(
    startNode.row,
    startNode.col,
    isPassage,
    numRows,
    numCols
  );
  connectToNearestPassage(
    finishNode.row,
    finishNode.col,
    isPassage,
    numRows,
    numCols
  );

  // Convert passage map to walls list for animation
  // Walls are cells where isPassage is false
  const wallsInOrder: Node[] = [];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // Skip start and finish nodes
      if (
        (row === startNode.row && col === startNode.col) ||
        (row === finishNode.row && col === finishNode.col)
      ) {
        continue;
      }

      // If it's a wall (not a passage), add to walls list
      if (!isPassage[row][col]) {
        wallsInOrder.push(grid[row][col]);
      }
    }
  }

  // Shuffle walls for more interesting animation
  shuffleArray(wallsInOrder);

  return wallsInOrder;
}

/**
 * Adds frontier cells from a given position
 * Frontier cells are walls 2 steps away (in cardinal directions)
 */
function addFrontier(
  row: number,
  col: number,
  numRows: number,
  numCols: number,
  isPassage: boolean[][],
  frontier: [number, number][],
  inFrontier: Set<string>
): void {
  const directions = [
    [-2, 0], // Up
    [2, 0], // Down
    [0, -2], // Left
    [0, 2], // Right
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Check bounds (leave 1 cell border)
    if (
      newRow >= 1 &&
      newRow < numRows - 1 &&
      newCol >= 1 &&
      newCol < numCols - 1
    ) {
      const key = `${newRow}-${newCol}`;

      // Add to frontier if it's a wall and not already in frontier
      if (!isPassage[newRow][newCol] && !inFrontier.has(key)) {
        frontier.push([newRow, newCol]);
        inFrontier.add(key);
      }
    }
  }
}

/**
 * Gets passage neighbors (cells 2 steps away that are passages)
 */
function getPassageNeighbors(
  row: number,
  col: number,
  numRows: number,
  numCols: number,
  isPassage: boolean[][]
): [number, number][] {
  const neighbors: [number, number][] = [];
  const directions = [
    [-2, 0], // Up
    [2, 0], // Down
    [0, -2], // Left
    [0, 2], // Right
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Check bounds
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      if (isPassage[newRow][newCol]) {
        neighbors.push([newRow, newCol]);
      }
    }
  }

  return neighbors;
}

/**
 * Ensures a specific node is marked as a passage
 */
function ensureNodeIsPassage(
  node: Node,
  isPassage: boolean[][],
  numRows: number,
  numCols: number
): void {
  if (
    node.row >= 0 &&
    node.row < numRows &&
    node.col >= 0 &&
    node.col < numCols
  ) {
    isPassage[node.row][node.col] = true;
  }
}

/**
 * Connects a cell to the nearest passage by carving a path
 */
function connectToNearestPassage(
  startRow: number,
  startCol: number,
  isPassage: boolean[][],
  numRows: number,
  numCols: number
): void {
  // BFS to find nearest passage
  const visited = new Set<string>();
  const queue: [number, number, [number, number][]][] = [
    [startRow, startCol, []],
  ];
  visited.add(`${startRow}-${startCol}`);

  const directions = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  while (queue.length > 0) {
    const [row, col, path] = queue.shift()!;

    // Found a passage - carve the path to it
    if (isPassage[row][col] && path.length > 0) {
      for (const [pRow, pCol] of path) {
        isPassage[pRow][pCol] = true;
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
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([newRow, newCol, [...path, [newRow, newCol]]]);
      }
    }
  }
}

/**
 * Fisher-Yates shuffle for random wall animation order
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
