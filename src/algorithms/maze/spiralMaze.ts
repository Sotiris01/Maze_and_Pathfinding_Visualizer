/**
 * Spiral Maze Generation Algorithm
 * Phase F: Extensions & History
 *
 * Creates a maze with walls arranged in a spiral pattern from outside to inside.
 * The spiral creates a long winding path that forces traversal through the entire
 * maze structure.
 *
 * Key Characteristics:
 * - Visually distinctive spiral pattern
 * - Creates a deterministic, predictable maze shape
 * - Gaps at each ring transition allow entering inner layers
 * - Great for demonstrating how algorithms handle long paths
 *
 * Algorithm:
 * 1. Start from the outermost ring of the grid
 * 2. Add walls along each side of the ring (top, right, bottom, left)
 * 3. Leave a gap for passage to the inner ring
 * 4. Move to the next inner ring and repeat
 * 5. Continue until center is reached
 */

import { Grid, Node } from "../../types";

/**
 * Direction enum for spiral traversal
 */
enum Direction {
  RIGHT = 0,
  DOWN = 1,
  LEFT = 2,
  UP = 3,
}

/**
 * Main function to generate a spiral maze
 *
 * @param grid - The current grid
 * @param startNode - The start node (must remain open)
 * @param finishNode - The finish node (must remain open)
 * @returns Array of nodes representing walls in the order they should be built
 */
export function getSpiralMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const wallsInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Set to track which cells should NOT become walls
  const protectedCells = new Set<string>();
  protectedCells.add(`${startNode.row}-${startNode.col}`);
  protectedCells.add(`${finishNode.row}-${finishNode.col}`);

  // Also protect adjacent cells to start/finish to ensure accessibility
  protectAdjacentCells(
    startNode.row,
    startNode.col,
    numRows,
    numCols,
    protectedCells
  );
  protectAdjacentCells(
    finishNode.row,
    finishNode.col,
    numRows,
    numCols,
    protectedCells
  );

  /**
   * Helper to check if a cell can become a wall
   */
  const canBeWall = (row: number, col: number): boolean => {
    // Check bounds
    if (row < 0 || row >= numRows || col < 0 || col >= numCols) return false;
    // Check if protected
    if (protectedCells.has(`${row}-${col}`)) return false;
    // Check if it's start or finish
    if (grid[row][col].isStart || grid[row][col].isFinish) return false;
    return true;
  };

  /**
   * Add a wall if valid
   */
  const addWall = (row: number, col: number): void => {
    if (canBeWall(row, col)) {
      wallsInOrder.push(grid[row][col]);
    }
  };

  // Step 1: Add outer border walls (to prevent edge shortcuts)
  // Top border
  for (let col = 0; col < numCols; col++) {
    addWall(0, col);
  }
  // Bottom border
  for (let col = 0; col < numCols; col++) {
    addWall(numRows - 1, col);
  }
  // Left border
  for (let row = 1; row < numRows - 1; row++) {
    addWall(row, 0);
  }
  // Right border
  for (let row = 1; row < numRows - 1; row++) {
    addWall(row, numCols - 1);
  }

  // Step 2: Generate spiral walls from outside to inside
  // Each "ring" is a rectangular frame of walls with a gap to enter
  let top = 2;
  let bottom = numRows - 3;
  let left = 2;
  let right = numCols - 3;
  let ringCount = 0;

  while (top < bottom - 1 && left < right - 1) {
    // Calculate gap position - alternate sides for each ring to create winding path
    // Gap rotates: top -> right -> bottom -> left
    const gapSide = ringCount % 4;

    // Top wall (left to right) with gap
    for (let col = left; col <= right; col++) {
      const isGap = gapSide === 0 && col === Math.floor((left + right) / 2);
      if (!isGap) {
        addWall(top, col);
      }
    }

    // Right wall (top+1 to bottom) with gap
    for (let row = top + 1; row <= bottom; row++) {
      const isGap = gapSide === 1 && row === Math.floor((top + bottom) / 2);
      if (!isGap) {
        addWall(row, right);
      }
    }

    // Bottom wall (right-1 to left) with gap
    for (let col = right - 1; col >= left; col--) {
      const isGap = gapSide === 2 && col === Math.floor((left + right) / 2);
      if (!isGap) {
        addWall(bottom, col);
      }
    }

    // Left wall (bottom-1 to top+1) with gap - this is the entrance to next ring
    for (let row = bottom - 1; row > top; row--) {
      const isGap = gapSide === 3 && row === Math.floor((top + bottom) / 2);
      if (!isGap) {
        addWall(row, left);
      }
    }

    // Move to inner ring
    top += 2;
    bottom -= 2;
    left += 2;
    right -= 2;
    ringCount++;
  }

  return wallsInOrder;
}

/**
 * Protect cells adjacent to start/finish to ensure they're accessible
 */
function protectAdjacentCells(
  row: number,
  col: number,
  numRows: number,
  numCols: number,
  protectedCells: Set<string>
): void {
  const directions = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      protectedCells.add(`${newRow}-${newCol}`);
    }
  }
}

/**
 * Alternative spiral pattern: Clockwise inward spiral path
 * Creates walls everywhere EXCEPT the spiral path
 */
export function getSpiralPathMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const wallsInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Track which cells are part of the spiral path
  const isPath = new Set<string>();

  // Start position (near top-left corner)
  let row = 1;
  let col = 1;
  let direction: Direction = Direction.RIGHT;

  // Boundaries for spiral
  let minRow = 1;
  let maxRow = numRows - 2;
  let minCol = 1;
  let maxCol = numCols - 2;

  // Carve spiral path
  while (minRow <= maxRow && minCol <= maxCol) {
    // Move in current direction until hitting boundary
    switch (direction) {
      case Direction.RIGHT:
        while (col <= maxCol) {
          isPath.add(`${row}-${col}`);
          col++;
        }
        col--;
        minRow++;
        break;

      case Direction.DOWN:
        while (row <= maxRow) {
          isPath.add(`${row}-${col}`);
          row++;
        }
        row--;
        maxCol--;
        break;

      case Direction.LEFT:
        while (col >= minCol) {
          isPath.add(`${row}-${col}`);
          col--;
        }
        col++;
        maxRow--;
        break;

      case Direction.UP:
        while (row >= minRow) {
          isPath.add(`${row}-${col}`);
          row--;
        }
        row++;
        minCol++;
        break;
    }

    // Turn clockwise
    direction = (direction + 1) % 4;
  }

  // Protect start and finish
  isPath.add(`${startNode.row}-${startNode.col}`);
  isPath.add(`${finishNode.row}-${finishNode.col}`);

  // Add walls for all non-path cells
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (!isPath.has(`${r}-${c}`)) {
        const node = grid[r][c];
        if (!node.isStart && !node.isFinish) {
          wallsInOrder.push(node);
        }
      }
    }
  }

  // Shuffle walls for more interesting animation
  shuffleArray(wallsInOrder);

  return wallsInOrder;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
