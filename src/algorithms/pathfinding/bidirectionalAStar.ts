/**
 * Bidirectional A* (A-Star) Algorithm Implementation
 * Phase F: Extensions & History
 *
 * Bidirectional A* combines the efficiency of A* heuristic search with
 * bidirectional search strategy. It searches from both start and finish
 * nodes simultaneously, using heuristics from both ends.
 *
 * Key Characteristics:
 * - Uses min-heap priority queues for O(log n) operations
 * - Two heuristics: startOpenSet → finishNode, finishOpenSet → startNode
 * - Meeting point detection when frontiers intersect
 * - Guarantees shortest path with consistent heuristics
 * - Correct early termination: μ ≤ min(topFStart, topFFinish)
 *
 * Time Complexity: O((V + E) log V) with min-heap
 * Space Complexity: O(V)
 */

import { Grid, Node } from "../../types";

// ============================================================================
// Min-Heap Priority Queue Implementation
// ============================================================================

/**
 * Binary Min-Heap for efficient priority queue operations.
 * - insert: O(log n)
 * - extractMin: O(log n)
 * - peekMin: O(1)
 */
class MinHeap {
  private heap: Node[] = [];
  private getKey: (node: Node) => string;
  private getPriority: (node: Node) => number;
  private positionMap: Map<string, number> = new Map();

  constructor(
    getKey: (node: Node) => string,
    getPriority: (node: Node) => number
  ) {
    this.getKey = getKey;
    this.getPriority = getPriority;
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peekMin(): Node | undefined {
    return this.heap[0];
  }

  insert(node: Node): void {
    const key = this.getKey(node);
    if (this.positionMap.has(key)) {
      // Update existing node's position (decrease key)
      const idx = this.positionMap.get(key)!;
      this.heap[idx] = node;
      this.bubbleUp(idx);
      this.bubbleDown(idx);
    } else {
      this.heap.push(node);
      const idx = this.heap.length - 1;
      this.positionMap.set(key, idx);
      this.bubbleUp(idx);
    }
  }

  extractMin(): Node | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) {
      const node = this.heap.pop()!;
      this.positionMap.delete(this.getKey(node));
      return node;
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

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (
        this.getPriority(this.heap[idx]) >=
        this.getPriority(this.heap[parentIdx])
      ) {
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
        this.getPriority(this.heap[leftIdx]) <
          this.getPriority(this.heap[smallest])
      ) {
        smallest = leftIdx;
      }
      if (
        rightIdx < length &&
        this.getPriority(this.heap[rightIdx]) <
          this.getPriority(this.heap[smallest])
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
// Bidirectional A* Algorithm
// ============================================================================

/**
 * Manhattan Distance Heuristic
 *
 * For 4-directional movement, Manhattan distance provides an
 * admissible and consistent heuristic.
 */
function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Performs Bidirectional A* algorithm to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm:
 * 1. Initialize two min-heaps - one from start, one from finish
 * 2. Alternate expansions, tracking best meeting point
 * 3. Terminate when: μ ≤ min(topFStart, topFFinish)
 *    where μ = best path cost found so far
 * 4. Reconstruct path through meeting point
 */
export function bidirectionalAStar(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;
  const getNodeFromKey = (key: string): Node => {
    const [row, col] = key.split("-").map(Number);
    return grid[row][col];
  };

  // === START SIDE DATA STRUCTURES ===
  const gScoreStart = new Map<string, number>();
  const fScoreStart = new Map<string, number>();
  const parentFromStart = new Map<string, Node | null>();
  const visitedFromStart = new Set<string>();

  // === FINISH SIDE DATA STRUCTURES ===
  const gScoreFinish = new Map<string, number>();
  const fScoreFinish = new Map<string, number>();
  const parentFromFinish = new Map<string, Node | null>();
  const visitedFromFinish = new Set<string>();

  // Initialize all nodes with Infinity scores
  for (const row of grid) {
    for (const node of row) {
      const key = getKey(node);
      gScoreStart.set(key, Infinity);
      fScoreStart.set(key, Infinity);
      gScoreFinish.set(key, Infinity);
      fScoreFinish.set(key, Infinity);
    }
  }

  // Initialize start node
  const startKey = getKey(startNode);
  gScoreStart.set(startKey, 0);
  fScoreStart.set(startKey, manhattanDistance(startNode, finishNode));
  parentFromStart.set(startKey, null);
  visitedFromStart.add(startKey);
  startNode.isVisited = true;
  visitedNodesInOrder.push(startNode);

  // Initialize finish node
  const finishKey = getKey(finishNode);
  gScoreFinish.set(finishKey, 0);
  fScoreFinish.set(finishKey, manhattanDistance(finishNode, startNode));
  parentFromFinish.set(finishKey, null);
  visitedFromFinish.add(finishKey);

  // Min-heap priority queues
  const openSetStart = new MinHeap(
    getKey,
    (node: Node) => fScoreStart.get(getKey(node)) ?? Infinity
  );
  const openSetFinish = new MinHeap(
    getKey,
    (node: Node) => fScoreFinish.get(getKey(node)) ?? Infinity
  );

  openSetStart.insert(startNode);
  openSetFinish.insert(finishNode);

  // Track best meeting point
  let meetingKey: string | null = null;
  let bestPathCost = Infinity; // μ in the literature

  /**
   * Gets all non-wall neighbors of a node
   */
  const getNeighbors = (node: Node): Node[] => {
    const neighbors: Node[] = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

    return neighbors.filter((n) => !n.isWall);
  };

  // Main loop - alternate between expanding from start and finish
  while (!openSetStart.isEmpty() && !openSetFinish.isEmpty()) {
    // === TERMINATION CHECK ===
    // Standard bidirectional A* termination:
    // Stop when μ ≤ min(top fScore from both sides)
    const topFStart =
      fScoreStart.get(getKey(openSetStart.peekMin()!)) ?? Infinity;
    const topFFinish =
      fScoreFinish.get(getKey(openSetFinish.peekMin()!)) ?? Infinity;

    if (bestPathCost <= Math.min(topFStart, topFFinish)) {
      break;
    }

    // === EXPAND FROM START SIDE ===
    if (!openSetStart.isEmpty()) {
      const current = openSetStart.extractMin()!;
      const currentKey = getKey(current);

      if (current.isWall) continue;

      // Check for intersection with finish side
      if (visitedFromFinish.has(currentKey)) {
        const pathCost =
          (gScoreStart.get(currentKey) ?? Infinity) +
          (gScoreFinish.get(currentKey) ?? Infinity);
        if (pathCost < bestPathCost) {
          bestPathCost = pathCost;
          meetingKey = currentKey;
        }
      }

      // Process neighbors
      for (const neighbor of getNeighbors(current)) {
        const neighborKey = getKey(neighbor);
        const tentativeGScore = (gScoreStart.get(currentKey) ?? Infinity) + 1;
        const neighborGScore = gScoreStart.get(neighborKey) ?? Infinity;

        if (tentativeGScore < neighborGScore) {
          parentFromStart.set(neighborKey, current);
          gScoreStart.set(neighborKey, tentativeGScore);
          fScoreStart.set(
            neighborKey,
            tentativeGScore + manhattanDistance(neighbor, finishNode)
          );

          openSetStart.insert(neighbor);

          if (!visitedFromStart.has(neighborKey)) {
            visitedFromStart.add(neighborKey);
            neighbor.isVisited = true;
            visitedNodesInOrder.push(neighbor);

            // Check for better meeting point
            if (visitedFromFinish.has(neighborKey)) {
              const pathCost =
                tentativeGScore + (gScoreFinish.get(neighborKey) ?? Infinity);
              if (pathCost < bestPathCost) {
                bestPathCost = pathCost;
                meetingKey = neighborKey;
              }
            }
          }
        }
      }
    }

    // === EXPAND FROM FINISH SIDE ===
    if (!openSetFinish.isEmpty()) {
      const current = openSetFinish.extractMin()!;
      const currentKey = getKey(current);

      if (current.isWall) continue;

      // Add finish node to visited on first expansion
      if (current === finishNode && !visitedNodesInOrder.includes(finishNode)) {
        finishNode.isVisited = true;
        visitedNodesInOrder.push(finishNode);
      }

      // Check for intersection with start side
      if (visitedFromStart.has(currentKey)) {
        const pathCost =
          (gScoreStart.get(currentKey) ?? Infinity) +
          (gScoreFinish.get(currentKey) ?? Infinity);
        if (pathCost < bestPathCost) {
          bestPathCost = pathCost;
          meetingKey = currentKey;
        }
      }

      // Process neighbors
      for (const neighbor of getNeighbors(current)) {
        const neighborKey = getKey(neighbor);
        const tentativeGScore = (gScoreFinish.get(currentKey) ?? Infinity) + 1;
        const neighborGScore = gScoreFinish.get(neighborKey) ?? Infinity;

        if (tentativeGScore < neighborGScore) {
          parentFromFinish.set(neighborKey, current);
          gScoreFinish.set(neighborKey, tentativeGScore);
          fScoreFinish.set(
            neighborKey,
            tentativeGScore + manhattanDistance(neighbor, startNode)
          );

          openSetFinish.insert(neighbor);

          if (!visitedFromFinish.has(neighborKey)) {
            visitedFromFinish.add(neighborKey);
            neighbor.isVisited = true;
            visitedNodesInOrder.push(neighbor);

            // Check for better meeting point
            if (visitedFromStart.has(neighborKey)) {
              const pathCost =
                (gScoreStart.get(neighborKey) ?? Infinity) + tentativeGScore;
              if (pathCost < bestPathCost) {
                bestPathCost = pathCost;
                meetingKey = neighborKey;
              }
            }
          }
        }
      }
    }
  }

  // Reconstruct path through meeting point
  if (meetingKey !== null) {
    // Part 1: Path from start to meeting point
    const pathFromStart: Node[] = [];
    let currentKey: string | null = meetingKey;
    while (currentKey !== null) {
      pathFromStart.unshift(getNodeFromKey(currentKey));
      const parent = parentFromStart.get(currentKey);
      currentKey = parent ? getKey(parent) : null;
    }

    // Part 2: Path from meeting point to finish (excluding meeting point)
    const pathToFinish: Node[] = [];
    const meetingParentFromFinish = parentFromFinish.get(meetingKey);
    currentKey = meetingParentFromFinish
      ? getKey(meetingParentFromFinish)
      : null;
    while (currentKey !== null) {
      pathToFinish.push(getNodeFromKey(currentKey));
      const parent = parentFromFinish.get(currentKey);
      currentKey = parent ? getKey(parent) : null;
    }

    // Combine and set up previousNode chain
    const fullPath = [...pathFromStart, ...pathToFinish];
    for (let i = 1; i < fullPath.length; i++) {
      fullPath[i].previousNode = fullPath[i - 1];
    }

    finishNode.isVisited = true;
  }

  return visitedNodesInOrder;
}

/**
 * Returns the shortest path found by bidirectionalAStar.
 * Uses the previousNode chain set up during path reconstruction.
 *
 * @param finishNode - The destination node
 * @returns Array of nodes representing the shortest path
 */
export function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  const nodesInShortestPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;

  if (!finishNode.isVisited) {
    return nodesInShortestPathOrder;
  }

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInShortestPathOrder;
}
