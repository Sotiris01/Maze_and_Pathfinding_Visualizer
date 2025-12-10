/**
 * Recursive Division Maze Generation Algorithm
 * Phase C: Maze Generation
 *
 * This algorithm creates a maze by recursively dividing the grid into chambers
 * and adding walls with gaps to ensure a solvable path.
 *
 * Key Concepts:
 * - Start with empty grid (no walls)
 * - Recursively divide into smaller chambers
 * - Each division adds a wall with exactly one gap
 * - Orientation based on chamber dimensions (height > width = horizontal)
 */

import { Grid, Node } from '../../types';

/**
 * Orientation enum for wall placement
 */
enum Orientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

/**
 * Main function to generate a Recursive Division maze
 *
 * @param grid - The current grid
 * @param startNode - The start node (must not be overwritten)
 * @param finishNode - The finish node (must not be overwritten)
 * @returns Array of nodes representing walls in the order they should be built
 */
export function getRecursiveDivisionMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const wallsInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Add border walls first (optional - creates a frame)
  addBorderWalls(grid, wallsInOrder, startNode, finishNode);

  // Start recursive division on the inner area (excluding borders)
  divide(
    grid,
    1, // startRow (inside border)
    numRows - 2, // endRow (inside border)
    1, // startCol (inside border)
    numCols - 2, // endCol (inside border)
    chooseOrientation(numRows - 2, numCols - 2),
    wallsInOrder,
    startNode,
    finishNode
  );

  return wallsInOrder;
}

/**
 * Adds border walls around the grid
 * Creates a frame for the maze
 */
function addBorderWalls(
  grid: Grid,
  wallsInOrder: Node[],
  startNode: Node,
  finishNode: Node
): void {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Top and bottom borders
  for (let col = 0; col < numCols; col++) {
    // Top border
    if (!isStartOrFinish(0, col, startNode, finishNode)) {
      wallsInOrder.push(grid[0][col]);
    }
    // Bottom border
    if (!isStartOrFinish(numRows - 1, col, startNode, finishNode)) {
      wallsInOrder.push(grid[numRows - 1][col]);
    }
  }

  // Left and right borders (excluding corners already added)
  for (let row = 1; row < numRows - 1; row++) {
    // Left border
    if (!isStartOrFinish(row, 0, startNode, finishNode)) {
      wallsInOrder.push(grid[row][0]);
    }
    // Right border
    if (!isStartOrFinish(row, numCols - 1, startNode, finishNode)) {
      wallsInOrder.push(grid[row][numCols - 1]);
    }
  }
}

/**
 * Recursive division function
 * Divides a chamber by adding a wall with a gap
 */
function divide(
  grid: Grid,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  orientation: Orientation,
  wallsInOrder: Node[],
  startNode: Node,
  finishNode: Node
): void {
  // Calculate chamber dimensions
  const height = endRow - startRow + 1;
  const width = endCol - startCol + 1;

  // Base case: chamber too small to divide
  if (height < 3 || width < 3) {
    return;
  }

  // Choose where to place the wall and the gap
  if (orientation === Orientation.HORIZONTAL) {
    // Horizontal wall - pick a row (must be even to align with passages)
    const possibleRows = getEvenNumbers(startRow + 1, endRow - 1);
    if (possibleRows.length === 0) return;

    const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];

    // Pick a gap position (must be odd to align with passages)
    const possibleGaps = getOddNumbers(startCol, endCol);
    if (possibleGaps.length === 0) return;

    const gapCol = possibleGaps[Math.floor(Math.random() * possibleGaps.length)];

    // Build the wall with a gap
    for (let col = startCol; col <= endCol; col++) {
      if (col === gapCol) continue; // Leave the gap
      if (isStartOrFinish(wallRow, col, startNode, finishNode)) continue;

      wallsInOrder.push(grid[wallRow][col]);
    }

    // Recursively divide the two new chambers
    // Top chamber
    divide(
      grid,
      startRow,
      wallRow - 1,
      startCol,
      endCol,
      chooseOrientation(wallRow - 1 - startRow + 1, width),
      wallsInOrder,
      startNode,
      finishNode
    );

    // Bottom chamber
    divide(
      grid,
      wallRow + 1,
      endRow,
      startCol,
      endCol,
      chooseOrientation(endRow - (wallRow + 1) + 1, width),
      wallsInOrder,
      startNode,
      finishNode
    );
  } else {
    // Vertical wall - pick a column (must be even to align with passages)
    const possibleCols = getEvenNumbers(startCol + 1, endCol - 1);
    if (possibleCols.length === 0) return;

    const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

    // Pick a gap position (must be odd to align with passages)
    const possibleGaps = getOddNumbers(startRow, endRow);
    if (possibleGaps.length === 0) return;

    const gapRow = possibleGaps[Math.floor(Math.random() * possibleGaps.length)];

    // Build the wall with a gap
    for (let row = startRow; row <= endRow; row++) {
      if (row === gapRow) continue; // Leave the gap
      if (isStartOrFinish(row, wallCol, startNode, finishNode)) continue;

      wallsInOrder.push(grid[row][wallCol]);
    }

    // Recursively divide the two new chambers
    // Left chamber
    divide(
      grid,
      startRow,
      endRow,
      startCol,
      wallCol - 1,
      chooseOrientation(height, wallCol - 1 - startCol + 1),
      wallsInOrder,
      startNode,
      finishNode
    );

    // Right chamber
    divide(
      grid,
      startRow,
      endRow,
      wallCol + 1,
      endCol,
      chooseOrientation(height, endCol - (wallCol + 1) + 1),
      wallsInOrder,
      startNode,
      finishNode
    );
  }
}

/**
 * Chooses wall orientation based on chamber dimensions
 * Prefers to divide along the longer axis
 */
function chooseOrientation(height: number, width: number): Orientation {
  if (height > width) {
    return Orientation.HORIZONTAL;
  } else if (width > height) {
    return Orientation.VERTICAL;
  } else {
    // Square chamber - random choice
    return Math.random() < 0.5 ? Orientation.HORIZONTAL : Orientation.VERTICAL;
  }
}

/**
 * Gets all even numbers in a range (inclusive)
 */
function getEvenNumbers(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    if (i % 2 === 0) {
      result.push(i);
    }
  }
  return result;
}

/**
 * Gets all odd numbers in a range (inclusive)
 */
function getOddNumbers(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    if (i % 2 !== 0) {
      result.push(i);
    }
  }
  return result;
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

export default getRecursiveDivisionMaze;
