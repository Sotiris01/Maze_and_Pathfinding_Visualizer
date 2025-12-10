import {
  Node,
  Grid,
  GRID_ROWS,
  GRID_COLS,
  DEFAULT_START_ROW,
  DEFAULT_START_COL,
  DEFAULT_FINISH_ROW,
  DEFAULT_FINISH_COL,
} from '../types';

/**
 * Creates a single Node with configurable start/finish positions
 */
export const createNode = (
  row: number,
  col: number,
  startRow: number,
  startCol: number,
  finishRow: number,
  finishCol: number
): Node => {
  return {
    row,
    col,
    isStart: row === startRow && col === startCol,
    isFinish: row === finishRow && col === finishCol,
    isWall: false,
    isVisited: false,
    distance: Infinity,
    previousNode: null,
  };
};

/**
 * Calculates safe start/finish positions based on grid dimensions
 * Ensures nodes are placed within bounds with reasonable margins
 */
export const getSafeNodePositions = (
  rows: number,
  cols: number
): { startRow: number; startCol: number; finishRow: number; finishCol: number } => {
  // Start node: positioned at ~33% from top, ~10% from left
  const startRow = Math.min(DEFAULT_START_ROW, Math.floor(rows * 0.33));
  const startCol = Math.min(DEFAULT_START_COL, Math.max(1, Math.floor(cols * 0.1)));

  // Finish node: positioned at ~33% from top, ~90% from left
  const finishRow = Math.min(DEFAULT_FINISH_ROW, Math.floor(rows * 0.33));
  const finishCol = Math.min(DEFAULT_FINISH_COL, Math.max(startCol + 2, Math.floor(cols * 0.9)));

  return { startRow, startCol, finishRow, finishCol };
};

/**
 * Creates the initial grid with configurable dimensions
 * @param rows - Number of rows (default: GRID_ROWS = 30)
 * @param cols - Number of columns (default: GRID_COLS = 50)
 * Start and Finish nodes are placed safely within bounds
 */
export const getInitialGrid = (
  rows: number = GRID_ROWS,
  cols: number = GRID_COLS
): Grid => {
  const { startRow, startCol, finishRow, finishCol } = getSafeNodePositions(rows, cols);
  const grid: Grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col, startRow, startCol, finishRow, finishCol));
    }
    grid.push(currentRow);
  }

  return grid;
};

/**
 * Creates a new grid with a wall toggled at the specified position
 */
export const getNewGridWithWallToggled = (
  grid: Grid,
  row: number,
  col: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't allow walls on start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  const newNode: Node = {
    ...node,
    isWall: !node.isWall,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Creates a new grid with a wall SET at the specified position (Draw mode)
 * Used for consistent drag-to-draw functionality
 */
export const getNewGridWithWallSet = (
  grid: Grid,
  row: number,
  col: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't allow walls on start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  // Already a wall, no change needed
  if (node.isWall) {
    return grid;
  }

  const newNode: Node = {
    ...node,
    isWall: true,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Creates a new grid with wall REMOVED at the specified position (Eraser mode)
 * Used for Ctrl+Click/Drag erasing functionality
 */
export const getNewGridWithWallRemoved = (
  grid: Grid,
  row: number,
  col: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't modify start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  // Not a wall, no change needed
  if (!node.isWall) {
    return grid;
  }

  const newNode: Node = {
    ...node,
    isWall: false,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Moves the start node to a new position
 * Auto-finds current Start position and overwrites walls at new position
 */
export const getNewGridWithStartMoved = (
  grid: Grid,
  newRow: number,
  newCol: number
): Grid => {
  const targetNode = grid[newRow][newCol];

  // Can't move to finish node or if already start
  if (targetNode.isFinish || targetNode.isStart) {
    return grid;
  }

  // Find current start position
  let oldRow = -1;
  let oldCol = -1;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].isStart) {
        oldRow = r;
        oldCol = c;
        break;
      }
    }
    if (oldRow !== -1) break;
  }

  // Safety check
  if (oldRow === -1) return grid;

  const newGrid = grid.map((row) => row.slice());

  // Remove start from old position
  newGrid[oldRow][oldCol] = {
    ...newGrid[oldRow][oldCol],
    isStart: false,
  };

  // Set start at new position (overwrites wall if present)
  newGrid[newRow][newCol] = {
    ...newGrid[newRow][newCol],
    isStart: true,
    isWall: false,
  };

  return newGrid;
};

/**
 * Moves the finish node to a new position
 * Auto-finds current Finish position and overwrites walls at new position
 */
export const getNewGridWithFinishMoved = (
  grid: Grid,
  newRow: number,
  newCol: number
): Grid => {
  const targetNode = grid[newRow][newCol];

  // Can't move to start node or if already finish
  if (targetNode.isStart || targetNode.isFinish) {
    return grid;
  }

  // Find current finish position
  let oldRow = -1;
  let oldCol = -1;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].isFinish) {
        oldRow = r;
        oldCol = c;
        break;
      }
    }
    if (oldRow !== -1) break;
  }

  // Safety check
  if (oldRow === -1) return grid;

  const newGrid = grid.map((row) => row.slice());

  // Remove finish from old position
  newGrid[oldRow][oldCol] = {
    ...newGrid[oldRow][oldCol],
    isFinish: false,
  };

  // Set finish at new position (overwrites wall if present)
  newGrid[newRow][newCol] = {
    ...newGrid[newRow][newCol],
    isFinish: true,
    isWall: false,
  };

  return newGrid;
};

/**
 * Resets the grid for a new pathfinding run (clears visited/path states)
 * Keeps walls, start, and finish intact
 */
export const resetGridForPathfinding = (grid: Grid): Grid => {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    }))
  );
};

/**
 * Clears all walls from the grid
 */
export const clearWalls = (grid: Grid): Grid => {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isWall: false,
    }))
  );
};

/**
 * Completely resets the grid to initial state
 */
export const resetGrid = (): Grid => {
  return getInitialGrid();
};

/**
 * Gets the node at a specific position
 */
export const getNode = (grid: Grid, row: number, col: number): Node | null => {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
    return null;
  }
  return grid[row][col];
};

/**
 * Gets all neighboring nodes (up, down, left, right)
 */
export const getNeighbors = (grid: Grid, node: Node): Node[] => {
  const neighbors: Node[] = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]); // Up
  if (row < GRID_ROWS - 1) neighbors.push(grid[row + 1][col]); // Down
  if (col > 0) neighbors.push(grid[row][col - 1]); // Left
  if (col < GRID_COLS - 1) neighbors.push(grid[row][col + 1]); // Right

  return neighbors;
};

/**
 * Gets unvisited neighbors that are not walls
 */
export const getUnvisitedNeighbors = (grid: Grid, node: Node): Node[] => {
  return getNeighbors(grid, node).filter(
    (neighbor) => !neighbor.isVisited && !neighbor.isWall
  );
};
