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
 * Time Complexity: O((V + E) log V) with min-heap
 * Space Complexity: O(V)
 *
 * Note: This implementation is for 4-directional movement (cardinal only).
 * For 8-directional (with diagonals), the forced neighbor rules differ.
 */

import { Grid, Node } from "../../types";

// ============================================================================
// Min-Heap Priority Queue Implementation
// ============================================================================

interface JumpPointEntry {
  row: number;
  col: number;
  dirRow: number;
  dirCol: number;
  fScore: number;
}

/**
 * Binary Min-Heap for efficient priority queue operations.
 */
class MinHeap {
  private heap: JumpPointEntry[] = [];
  private positionMap: Map<string, number> = new Map();

  private getKey(entry: JumpPointEntry): string {
    return `${entry.row}-${entry.col}`;
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  insert(entry: JumpPointEntry): void {
    const key = this.getKey(entry);
    if (this.positionMap.has(key)) {
      const idx = this.positionMap.get(key)!;
      if (entry.fScore < this.heap[idx].fScore) {
        this.heap[idx] = entry;
        this.bubbleUp(idx);
        this.bubbleDown(idx);
      }
    } else {
      this.heap.push(entry);
      const idx = this.heap.length - 1;
      this.positionMap.set(key, idx);
      this.bubbleUp(idx);
    }
  }

  extractMin(): JumpPointEntry | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) {
      const entry = this.heap.pop()!;
      this.positionMap.delete(this.getKey(entry));
      return entry;
    }

    const min = this.heap[0];
    const last = this.heap.pop()!;
    this.positionMap.delete(this.getKey(min));

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.positionMap.set(this.getKey(last), 0);
      this.bubbleDown(0);
    }

    return min;
  }

  has(key: string): boolean {
    return this.positionMap.has(key);
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].fScore >= this.heap[parentIdx].fScore) {
        break;
      }
      this.swap(idx, parentIdx);
      idx = parentIdx;
    }
  }

  private bubbleDown(idx: number): void {
    const length = this.heap.length;
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let smallest = idx;

      if (
        leftIdx < length &&
        this.heap[leftIdx].fScore < this.heap[smallest].fScore
      ) {
        smallest = leftIdx;
      }
      if (
        rightIdx < length &&
        this.heap[rightIdx].fScore < this.heap[smallest].fScore
      ) {
        smallest = rightIdx;
      }

      if (smallest === idx) break;

      this.swap(idx, smallest);
      idx = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const keyI = this.getKey(this.heap[i]);
    const keyJ = this.getKey(this.heap[j]);
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    this.positionMap.set(keyI, j);
    this.positionMap.set(keyJ, i);
  }
}

// ============================================================================
// Jump Point Search Algorithm
// ============================================================================

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

  // Use Maps to track scores (lazy initialization)
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, string | null>();

  // Initialize start node
  const startKey = getKey(startNode.row, startNode.col);
  gScore.set(startKey, 0);
  cameFrom.set(startKey, null);

  // Min-heap priority queue
  const openSet = new MinHeap();

  // Add start node with all directions (no parent direction)
  openSet.insert({
    row: startNode.row,
    col: startNode.col,
    dirRow: 0,
    dirCol: 0,
    fScore: manhattanDistance(startNode, finishNode),
  });

  /**
   * Jump function - the core of JPS (iterative to avoid stack overflow)
   * Jumps in a direction until it finds:
   * 1. The goal node
   * 2. A jump point (forced neighbor exists)
   * 3. A wall or boundary (returns null)
   */
  const jump = (
    startRow: number,
    startCol: number,
    dirRow: number,
    dirCol: number
  ): { row: number; col: number } | null => {
    let row = startRow + dirRow;
    let col = startCol + dirCol;

    while (true) {
      // Hit wall or boundary
      if (!isWalkable(row, col)) {
        return null;
      }

      // Found the goal!
      if (row === finishNode.row && col === finishNode.col) {
        return { row, col };
      }

      // Check for forced neighbors (4-directional rules)
      // Horizontal movement (dirRow === 0)
      if (dirRow === 0) {
        if (
          (!isWalkable(row - 1, col - dirCol) && isWalkable(row - 1, col)) ||
          (!isWalkable(row + 1, col - dirCol) && isWalkable(row + 1, col))
        ) {
          return { row, col };
        }
      }

      // Vertical movement (dirCol === 0)
      if (dirCol === 0) {
        if (
          (!isWalkable(row - dirRow, col - 1) && isWalkable(row, col - 1)) ||
          (!isWalkable(row - dirRow, col + 1) && isWalkable(row, col + 1))
        ) {
          return { row, col };
        }
      }

      // Continue jumping in the same direction
      row += dirRow;
      col += dirCol;
    }
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
      directionsToCheck = [[0, parentDirCol]];

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
      directionsToCheck = [[parentDirRow, 0]];

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
  while (!openSet.isEmpty()) {
    const current = openSet.extractMin()!;
    const currentKey = getKey(current.row, current.col);
    const currentNode = grid[current.row][current.col];

    // Skip if already visited
    if (currentNode.isVisited) continue;

    // Mark as visited
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // Found the goal!
    if (current.row === finishNode.row && current.col === finishNode.col) {
      // Reconstruct path using previousNode pointers
      reconstructPath(grid, cameFrom, finishNode);
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

        const fScoreValue =
          tentativeGScore + manhattanDistance(successorNode, finishNode);

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

        openSet.insert({
          row: successor.row,
          col: successor.col,
          dirRow,
          dirCol,
          fScore: fScoreValue,
        });
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
