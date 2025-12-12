/**
 * Cellular Automata Maze Generation Algorithm
 * Phase F: Extensions & History
 *
 * Creates a maze using cellular automata rules inspired by Conway's Game of Life.
 * This produces organic, cave-like patterns that differ from traditional maze algorithms.
 *
 * Key Characteristics:
 * - Creates natural-looking cave systems
 * - Non-deterministic (random initial state + rules = unique mazes)
 * - May create isolated regions (not guaranteed solvable without post-processing)
 * - Smooth, organic wall patterns unlike grid-based mazes
 *
 * Algorithm:
 * 1. Initialize grid with random walls (configurable density)
 * 2. Apply cellular automata rules for several generations:
 *    - Birth: Empty cell becomes wall if it has >= birthLimit wall neighbors
 *    - Death: Wall cell becomes empty if it has < deathLimit wall neighbors
 * 3. Ensure start and finish nodes are clear
 * 4. Ensure a path exists between start and finish (flood fill + carve if needed)
 */

import { Grid, Node } from "../../types";

/**
 * Configuration for the cellular automata
 */
interface CellularAutomataConfig {
  initialWallChance: number; // 0.0 to 1.0 - probability of initial wall
  birthLimit: number; // Neighbors needed for empty cell to become wall
  deathLimit: number; // Neighbors needed for wall cell to stay wall
  generations: number; // Number of simulation steps
}

/**
 * Default configuration - produces good cave-like mazes
 * Tuned for 4-directional pathfinding grids
 */
const DEFAULT_CONFIG: CellularAutomataConfig = {
  initialWallChance: 0.4, // 40% initial walls (reduced for more open caves)
  birthLimit: 4, // Empty becomes wall if >= 5 wall neighbors (harder to create walls)
  deathLimit: 4, // Wall dies if < 4 wall neighbors (easier to remove walls)
  generations: 1, // 1 simulation step (fewer to preserve openness)
};

/**
 * Main function to generate a Cellular Automata maze
 *
 * @param grid - The current grid
 * @param startNode - The start node (must remain open)
 * @param finishNode - The finish node (must remain open)
 * @returns Array of nodes representing walls in the order they should be built
 */
export function getCellularAutomataMaze(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const config = DEFAULT_CONFIG;

  // Create a 2D array to track wall state (true = wall)
  let wallState: boolean[][] = initializeRandomWalls(
    numRows,
    numCols,
    config.initialWallChance,
    startNode,
    finishNode
  );

  // Run cellular automata simulation
  for (let gen = 0; gen < config.generations; gen++) {
    wallState = simulateGeneration(
      wallState,
      numRows,
      numCols,
      config.birthLimit,
      config.deathLimit
    );
  }

  // Ensure start and finish are clear along with their neighbors
  clearAroundNode(wallState, startNode.row, startNode.col, numRows, numCols);
  clearAroundNode(wallState, finishNode.row, finishNode.col, numRows, numCols);

  // Ensure path exists between start and finish
  ensurePathExists(
    wallState,
    startNode.row,
    startNode.col,
    finishNode.row,
    finishNode.col,
    numRows,
    numCols
  );

  // Keep border walls for nice appearance
  addBorderWalls(wallState, numRows, numCols, startNode, finishNode);

  // Convert wall state to Node array for animation
  const wallsInOrder: Node[] = [];

  // Collect walls in a visually interesting order (spiral from outside in)
  const visited = new Set<string>();
  const getKey = (r: number, c: number) => `${r}-${c}`;

  // Add walls layer by layer from outside
  for (let layer = 0; layer < Math.max(numRows, numCols) / 2; layer++) {
    // Top row of this layer
    for (let c = layer; c < numCols - layer; c++) {
      const r = layer;
      if (r < numRows && !visited.has(getKey(r, c))) {
        visited.add(getKey(r, c));
        if (wallState[r][c] && !grid[r][c].isStart && !grid[r][c].isFinish) {
          wallsInOrder.push(grid[r][c]);
        }
      }
    }
    // Right column
    for (let r = layer + 1; r < numRows - layer; r++) {
      const c = numCols - 1 - layer;
      if (c >= 0 && !visited.has(getKey(r, c))) {
        visited.add(getKey(r, c));
        if (wallState[r][c] && !grid[r][c].isStart && !grid[r][c].isFinish) {
          wallsInOrder.push(grid[r][c]);
        }
      }
    }
    // Bottom row
    for (let c = numCols - 2 - layer; c >= layer; c--) {
      const r = numRows - 1 - layer;
      if (r >= 0 && !visited.has(getKey(r, c))) {
        visited.add(getKey(r, c));
        if (wallState[r][c] && !grid[r][c].isStart && !grid[r][c].isFinish) {
          wallsInOrder.push(grid[r][c]);
        }
      }
    }
    // Left column
    for (let r = numRows - 2 - layer; r > layer; r--) {
      const c = layer;
      if (c < numCols && !visited.has(getKey(r, c))) {
        visited.add(getKey(r, c));
        if (wallState[r][c] && !grid[r][c].isStart && !grid[r][c].isFinish) {
          wallsInOrder.push(grid[r][c]);
        }
      }
    }
  }

  return wallsInOrder;
}

/**
 * Initialize grid with random walls
 */
function initializeRandomWalls(
  numRows: number,
  numCols: number,
  wallChance: number,
  startNode: Node,
  finishNode: Node
): boolean[][] {
  const walls: boolean[][] = [];

  for (let r = 0; r < numRows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < numCols; c++) {
      // Never place walls on start/finish
      if (
        (r === startNode.row && c === startNode.col) ||
        (r === finishNode.row && c === finishNode.col)
      ) {
        row.push(false);
      } else {
        row.push(Math.random() < wallChance);
      }
    }
    walls.push(row);
  }

  return walls;
}

/**
 * Simulate one generation of cellular automata
 */
function simulateGeneration(
  currentState: boolean[][],
  numRows: number,
  numCols: number,
  birthLimit: number,
  deathLimit: number
): boolean[][] {
  const newState: boolean[][] = [];

  for (let r = 0; r < numRows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < numCols; c++) {
      const wallNeighbors = countWallNeighbors(
        currentState,
        r,
        c,
        numRows,
        numCols
      );

      if (currentState[r][c]) {
        // Cell is currently a wall
        // It survives if it has enough wall neighbors
        row.push(wallNeighbors >= deathLimit);
      } else {
        // Cell is currently empty
        // It becomes a wall if it has enough wall neighbors
        row.push(wallNeighbors >= birthLimit);
      }
    }
    newState.push(row);
  }

  return newState;
}

/**
 * Count wall neighbors (8-directional including diagonals)
 */
function countWallNeighbors(
  state: boolean[][],
  row: number,
  col: number,
  numRows: number,
  numCols: number
): number {
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip self

      const nr = row + dr;
      const nc = col + dc;

      // Out-of-bounds counts as empty (prevents border from filling everything)
      if (nr < 0 || nr >= numRows || nc < 0 || nc >= numCols) {
        // Don't count out-of-bounds as walls
        continue;
      } else if (state[nr][nc]) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Clear cells around a node (ensure it's accessible)
 */
function clearAroundNode(
  state: boolean[][],
  row: number,
  col: number,
  numRows: number,
  numCols: number
): void {
  // Clear the node itself and its 4-directional neighbors
  state[row][col] = false;

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
      state[nr][nc] = false;
    }
  }
}

/**
 * Ensure a path exists between start and finish using flood fill
 * If no path exists, carve a winding path
 */
function ensurePathExists(
  state: boolean[][],
  startRow: number,
  startCol: number,
  finishRow: number,
  finishCol: number,
  numRows: number,
  numCols: number
): void {
  // Flood fill from start to find all reachable cells
  const reachable = new Set<string>();
  const getKey = (r: number, c: number) => `${r}-${c}`;

  const queue: [number, number][] = [[startRow, startCol]];
  reachable.add(getKey(startRow, startCol));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = getKey(nr, nc);

      if (
        nr >= 0 &&
        nr < numRows &&
        nc >= 0 &&
        nc < numCols &&
        !state[nr][nc] &&
        !reachable.has(key)
      ) {
        reachable.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  // Check if finish is reachable
  if (reachable.has(getKey(finishRow, finishCol))) {
    return; // Path exists!
  }

  // No path exists - carve a winding path with some randomness
  carveWindingPath(
    state,
    startRow,
    startCol,
    finishRow,
    finishCol,
    numRows,
    numCols
  );
}

/**
 * Carve a winding path between two points (more organic than straight line)
 */
function carveWindingPath(
  state: boolean[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  numRows: number,
  numCols: number
): void {
  let r = startRow;
  let c = startCol;

  // Clear starting area
  state[r][c] = false;

  while (r !== endRow || c !== endCol) {
    // Clear current cell and some neighbors for wider passages
    state[r][c] = false;

    // Randomly widen the path occasionally
    if (Math.random() < 0.3) {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      const [dr, dc] =
        directions[Math.floor(Math.random() * directions.length)];
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < numRows - 1 && nc > 0 && nc < numCols - 1) {
        state[nr][nc] = false;
      }
    }

    // Decide direction with some randomness
    const moveVertical = Math.random() < 0.5;

    if (moveVertical && r !== endRow) {
      r += r < endRow ? 1 : -1;
    } else if (c !== endCol) {
      c += c < endCol ? 1 : -1;
    } else if (r !== endRow) {
      r += r < endRow ? 1 : -1;
    }
  }

  // Clear the end point and area around it
  state[endRow][endCol] = false;
}

/**
 * Add border walls for a clean look
 */
function addBorderWalls(
  state: boolean[][],
  numRows: number,
  numCols: number,
  startNode: Node,
  finishNode: Node
): void {
  // Top and bottom borders
  for (let c = 0; c < numCols; c++) {
    if (
      !(startNode.row === 0 && startNode.col === c) &&
      !(finishNode.row === 0 && finishNode.col === c)
    ) {
      state[0][c] = true;
    }
    if (
      !(startNode.row === numRows - 1 && startNode.col === c) &&
      !(finishNode.row === numRows - 1 && finishNode.col === c)
    ) {
      state[numRows - 1][c] = true;
    }
  }

  // Left and right borders
  for (let r = 0; r < numRows; r++) {
    if (
      !(startNode.row === r && startNode.col === 0) &&
      !(finishNode.row === r && finishNode.col === 0)
    ) {
      state[r][0] = true;
    }
    if (
      !(startNode.row === r && startNode.col === numCols - 1) &&
      !(finishNode.row === r && finishNode.col === numCols - 1)
    ) {
      state[r][numCols - 1] = true;
    }
  }
}
