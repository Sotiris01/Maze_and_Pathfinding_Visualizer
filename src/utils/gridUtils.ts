import { Node, Grid, GRID_ROWS, GRID_COLS } from "../types";

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
    weight: 1, // Default weight: 1 = normal terrain
  };
};

/**
 * Calculates safe start/finish positions based on grid dimensions
 * Start: Top-left corner (1,1) with padding from edge
 * Finish: Exact center of the grid
 */
export const getSafeNodePositions = (
  rows: number,
  cols: number
): {
  startRow: number;
  startCol: number;
  finishRow: number;
  finishCol: number;
} => {
  // Start node: Top-left corner with 1 cell padding from edge
  // For very small grids (5x5), use row 1, col 1
  const startRow = Math.min(1, rows - 2);
  const startCol = Math.min(1, cols - 2);

  // Finish node: Exact center of the grid
  const finishRow = Math.floor(rows / 2);
  const finishCol = Math.floor(cols / 2);

  // Ensure start and finish don't overlap (for very small grids)
  // If they would overlap, move finish slightly
  if (startRow === finishRow && startCol === finishCol) {
    // Move finish to bottom-right area for small grids
    return {
      startRow,
      startCol,
      finishRow: Math.max(startRow + 1, rows - 2),
      finishCol: Math.max(startCol + 1, cols - 2),
    };
  }

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
  const { startRow, startCol, finishRow, finishCol } = getSafeNodePositions(
    rows,
    cols
  );
  const grid: Grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(
        createNode(row, col, startRow, startCol, finishRow, finishCol)
      );
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
 * Weight constants
 */
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 10;

/**
 * Creates a new grid with wall TOGGLED to ON at the specified position
 * Used for WALL mode: Sets tile to wall (∞) regardless of current weight
 * Skips if already a wall
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
    weight: 1,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Creates a new grid with wall TOGGLED to OFF at the specified position
 * Used for WALL mode: Sets tile to weight=1 (removes wall)
 * Skips if not a wall
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
    weight: 1,
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
 * Keeps walls, start, finish, and weights intact
 */
export const resetGridForPathfinding = (grid: Grid): Grid => {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
      // weight is preserved
    }))
  );
};

/**
 * Clears all walls and weights from the grid
 */
export const clearWalls = (grid: Grid): Grid => {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isWall: false,
      weight: 1, // Reset to normal terrain
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

/**
 * Creates a new grid with the weight INCREMENTED at the specified position
 * Increments weight: 1 → 2 → ... → 10 → wall (∞)
 * Returns unchanged grid if already a wall
 */
export const getNewGridWithWeightIncremented = (
  grid: Grid,
  row: number,
  col: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't allow changes on start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  // Already a wall, no change (stop at wall)
  if (node.isWall) {
    return grid;
  }

  // At max weight (10), convert to wall
  if (node.weight >= MAX_WEIGHT) {
    const newNode: Node = {
      ...node,
      isWall: true,
      weight: 1, // Reset weight when becoming wall
    };
    newGrid[row] = newGrid[row].slice();
    newGrid[row][col] = newNode;
    return newGrid;
  }

  // Increment weight by 1
  const newNode: Node = {
    ...node,
    weight: node.weight + 1,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Creates a new grid with the weight DECREMENTED at the specified position
 * Decrements weight: wall (∞) → 10 → ... → 2 → 1
 * Returns unchanged grid if already at min weight (1)
 */
export const getNewGridWithWeightDecremented = (
  grid: Grid,
  row: number,
  col: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't allow changes on start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  // Wall: convert to max weight (10)
  if (node.isWall) {
    const newNode: Node = {
      ...node,
      isWall: false,
      weight: MAX_WEIGHT,
    };
    newGrid[row] = newGrid[row].slice();
    newGrid[row][col] = newNode;
    return newGrid;
  }

  // Already at min weight (1), no change
  if (node.weight <= MIN_WEIGHT) {
    return grid;
  }

  // Decrement weight by 1
  const newNode: Node = {
    ...node,
    weight: node.weight - 1,
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};

/**
 * Creates a new grid with the weight SET at the specified position
 * Used for consistent drag-to-paint weight functionality
 * Note: Adding weight removes any wall on the node
 */
export const getNewGridWithWeightSet = (
  grid: Grid,
  row: number,
  col: number,
  weight: number
): Grid => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  // Don't allow weights on start or finish nodes
  if (node.isStart || node.isFinish) {
    return grid;
  }

  // Already has this weight, no change needed
  if (node.weight === weight && !node.isWall) {
    return grid;
  }

  const newNode: Node = {
    ...node,
    weight,
    isWall: false, // Remove wall when setting weight
  };

  newGrid[row] = newGrid[row].slice();
  newGrid[row][col] = newNode;

  return newGrid;
};
