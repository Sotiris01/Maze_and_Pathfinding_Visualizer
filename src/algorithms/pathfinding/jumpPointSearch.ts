/**
 * Jump Point Search (JPS) Algorithm Implementation
 * Phase F: Extensions & History
 *
 * Jump Point Search is an optimization over A* for uniform-cost grids.
 * It dramatically reduces the number of nodes that need to be examined
 * by "jumping" over intermediate nodes in straight lines and only
 * considering nodes that are "forced neighbors" or corner points.
 *
 * Key Characteristics:
 * - Guarantees shortest path (same as A*)
 * - Only works on uniform-cost grids (all edge weights equal)
 * - Exploits grid structure to skip intermediate nodes
 * - Typically 10-100x faster than A* in open spaces
 * - Falls back to A*-like behavior in dense obstacle environments
 *
 * Note: This implementation is for 4-directional movement (cardinal only).
 * For 8-directional (with diagonals), the forced neighbor rules differ.
 */

import { Grid, Node } from "../../types";

/**
 * Manhattan Distance Heuristic
 */
function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Direction vectors for 4-directional movement
 * [row delta, col delta]
 */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // Up
  [1, 0], // Down
  [0, -1], // Left
  [0, 1], // Right
];

/**
 * Performs Jump Point Search to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 */
export function jumpPointSearch(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Helper to get node key
  const getKey = (row: number, col: number): string => `${row}-${col}`;

  // Check if a position is valid and not a wall
  const isWalkable = (row: number, col: number): boolean => {
    if (row < 0 || row >= numRows || col < 0 || col >= numCols) return false;
    return !grid[row][col].isWall;
  };

  // Use Maps to track scores
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string | null>();
  const inOpenSet = new Map<string, boolean>();

  // Initialize all with Infinity
  for (const row of grid) {
    for (const node of row) {
      const key = getKey(node.row, node.col);
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    }
  }

  // Initialize start node
  const startKey = getKey(startNode.row, startNode.col);
  gScore.set(startKey, 0);
  fScore.set(startKey, manhattanDistance(startNode, finishNode));
  cameFrom.set(startKey, null);

  // Open set with direction info: [row, col, dirRow, dirCol]
  // Direction is used to determine which neighbors to explore
  const openSet: {
    row: number;
    col: number;
    dirRow: number;
    dirCol: number;
  }[] = [];

  // Add start node with all directions (no parent direction)
  openSet.push({
    row: startNode.row,
    col: startNode.col,
    dirRow: 0,
    dirCol: 0,
  });
  inOpenSet.set(startKey, true);

  /**
   * Jump function - the core of JPS
   * Recursively jumps in a direction until it finds:
   * 1. The goal node
   * 2. A jump point (forced neighbor exists)
   * 3. A wall or boundary (returns null)
   */
  const jump = (
    row: number,
    col: number,
    dirRow: number,
    dirCol: number
  ): { row: number; col: number } | null => {
    const nextRow = row + dirRow;
    const nextCol = col + dirCol;

    // Hit wall or boundary
    if (!isWalkable(nextRow, nextCol)) {
      return null;
    }

    // Found the goal!
    if (nextRow === finishNode.row && nextCol === finishNode.col) {
      return { row: nextRow, col: nextCol };
    }

    // Check for forced neighbors (4-directional rules)
    // A forced neighbor exists when there's a wall adjacent to the path
    // that creates a shorter path through the current node

    // Horizontal movement (dirRow === 0)
    if (dirRow === 0) {
      // Check for forced neighbors above and below
      // If there's a wall above/below and walkable diagonal, it's a jump point
      if (
        (!isWalkable(nextRow - 1, nextCol - dirCol) &&
          isWalkable(nextRow - 1, nextCol)) ||
        (!isWalkable(nextRow + 1, nextCol - dirCol) &&
          isWalkable(nextRow + 1, nextCol))
      ) {
        return { row: nextRow, col: nextCol };
      }
    }

    // Vertical movement (dirCol === 0)
    if (dirCol === 0) {
      // Check for forced neighbors left and right
      if (
        (!isWalkable(nextRow - dirRow, nextCol - 1) &&
          isWalkable(nextRow, nextCol - 1)) ||
        (!isWalkable(nextRow - dirRow, nextCol + 1) &&
          isWalkable(nextRow, nextCol + 1))
      ) {
        return { row: nextRow, col: nextCol };
      }
    }

    // Continue jumping in the same direction
    return jump(nextRow, nextCol, dirRow, dirCol);
  };

  /**
   * Identify successors (jump points) from a node
   */
  const identifySuccessors = (
    row: number,
    col: number,
    parentDirRow: number,
    parentDirCol: number
  ): { row: number; col: number }[] => {
    const successors: { row: number; col: number }[] = [];

    // Determine which directions to explore based on parent direction
    let directionsToCheck: [number, number][];

    if (parentDirRow === 0 && parentDirCol === 0) {
      // Start node - check all directions
      directionsToCheck = DIRECTIONS;
    } else if (parentDirRow === 0) {
      // Horizontal movement - continue horizontal + check perpendicular if forced
      directionsToCheck = [[0, parentDirCol]]; // Continue in same direction

      // Add perpendicular directions if forced neighbors exist
      if (
        !isWalkable(row - 1, col - parentDirCol) &&
        isWalkable(row - 1, col)
      ) {
        directionsToCheck.push([-1, 0]);
      }
      if (
        !isWalkable(row + 1, col - parentDirCol) &&
        isWalkable(row + 1, col)
      ) {
        directionsToCheck.push([1, 0]);
      }
    } else {
      // Vertical movement - continue vertical + check perpendicular if forced
      directionsToCheck = [[parentDirRow, 0]]; // Continue in same direction

      // Add perpendicular directions if forced neighbors exist
      if (
        !isWalkable(row - parentDirRow, col - 1) &&
        isWalkable(row, col - 1)
      ) {
        directionsToCheck.push([0, -1]);
      }
      if (
        !isWalkable(row - parentDirRow, col + 1) &&
        isWalkable(row, col + 1)
      ) {
        directionsToCheck.push([0, 1]);
      }
    }

    // Jump in each valid direction
    for (const [dRow, dCol] of directionsToCheck) {
      const jumpPoint = jump(row, col, dRow, dCol);
      if (jumpPoint) {
        successors.push(jumpPoint);
      }
    }

    return successors;
  };

  // Main loop
  while (openSet.length > 0) {
    // Sort by fScore and get lowest
    openSet.sort((a, b) => {
      const fA = fScore.get(getKey(a.row, a.col)) ?? Infinity;
      const fB = fScore.get(getKey(b.row, b.col)) ?? Infinity;
      return fA - fB;
    });

    const current = openSet.shift()!;
    const currentKey = getKey(current.row, current.col);
    const currentNode = grid[current.row][current.col];

    inOpenSet.set(currentKey, false);

    // Skip if already visited
    if (currentNode.isVisited) continue;

    // Mark as visited
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // Found the goal!
    if (current.row === finishNode.row && current.col === finishNode.col) {
      // Reconstruct path using previousNode pointers
      reconstructPath(grid, cameFrom, startNode, finishNode);
      return visitedNodesInOrder;
    }

    // Get successors (jump points)
    const successors = identifySuccessors(
      current.row,
      current.col,
      current.dirRow,
      current.dirCol
    );

    for (const successor of successors) {
      const successorKey = getKey(successor.row, successor.col);
      const successorNode = grid[successor.row][successor.col];

      if (successorNode.isVisited) continue;

      // Calculate tentative gScore (actual distance, not just 1)
      const tentativeGScore =
        (gScore.get(currentKey) ?? Infinity) +
        manhattanDistance(currentNode, successorNode);

      if (tentativeGScore < (gScore.get(successorKey) ?? Infinity)) {
        // Found a better path
        cameFrom.set(successorKey, currentKey);
        gScore.set(successorKey, tentativeGScore);
        fScore.set(
          successorKey,
          tentativeGScore + manhattanDistance(successorNode, finishNode)
        );

        // Calculate direction from current to successor
        const dirRow =
          successor.row === current.row
            ? 0
            : successor.row > current.row
            ? 1
            : -1;
        const dirCol =
          successor.col === current.col
            ? 0
            : successor.col > current.col
            ? 1
            : -1;

        if (!inOpenSet.get(successorKey)) {
          openSet.push({
            row: successor.row,
            col: successor.col,
            dirRow,
            dirCol,
          });
          inOpenSet.set(successorKey, true);
        }
      }
    }
  }

  // No path found
  return visitedNodesInOrder;
}

/**
 * Reconstructs the path by setting previousNode pointers
 * JPS jumps over nodes, so we need to fill in the gaps
 */
function reconstructPath(
  grid: Grid,
  cameFrom: Map<string, string | null>,
  _startNode: Node,
  finishNode: Node
): void {
  const path: Node[] = [];
  let currentKey: string | null = `${finishNode.row}-${finishNode.col}`;

  // Collect jump points from finish to start
  const jumpPoints: Node[] = [];
  while (currentKey !== null) {
    const [row, col] = currentKey.split("-").map(Number);
    jumpPoints.unshift(grid[row][col]);
    currentKey = cameFrom.get(currentKey) ?? null;
  }

  // Fill in intermediate nodes between jump points
  for (let i = 0; i < jumpPoints.length - 1; i++) {
    const from = jumpPoints[i];
    const to = jumpPoints[i + 1];

    // Add intermediate nodes
    let currentRow = from.row;
    let currentCol = from.col;

    while (currentRow !== to.row || currentCol !== to.col) {
      const node = grid[currentRow][currentCol];
      if (path.length > 0) {
        node.previousNode = path[path.length - 1];
      }
      path.push(node);

      // Move towards target
      if (currentRow < to.row) currentRow++;
      else if (currentRow > to.row) currentRow--;
      else if (currentCol < to.col) currentCol++;
      else if (currentCol > to.col) currentCol--;
    }
  }

  // Add the finish node
  if (jumpPoints.length > 0) {
    finishNode.previousNode = path.length > 0 ? path[path.length - 1] : null;
    path.push(finishNode);
  }
}

/**
 * Returns the shortest path found by Jump Point Search.
 *
 * @param finishNode - The destination node
 * @returns Array of nodes representing the shortest path from start to finish
 */
export function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  const nodesInShortestPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;

  // Check if finish was actually reached
  if (!finishNode.isVisited) {
    return nodesInShortestPathOrder;
  }

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInShortestPathOrder;
}
