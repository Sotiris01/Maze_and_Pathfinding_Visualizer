/**
 * Greedy Best-First Search Algorithm Implementation
 * Phase F: Extensions & History
 *
 * Greedy Best-First Search is an informed search algorithm that selects
 * nodes based solely on their heuristic value (estimated distance to goal).
 *
 * Key Difference from A*:
 * - A* uses: fScore = gScore + hScore (actual distance + estimated remaining)
 * - Greedy uses: fScore = hScore only (ignores actual distance traveled)
 *
 * This makes Greedy faster but does NOT guarantee the shortest path.
 * It's useful when you want to find "a" path quickly, not necessarily the best one.
 *
 * Time Complexity: O((V + E) log V) with min-heap
 * Space Complexity: O(V)
 *
 * Note: Since this algorithm uses heuristics (needs to know target location),
 * it should be DISABLED in Hidden Target Mode.
 */

import { Grid, Node } from "../../types";

// ============================================================================
// Min-Heap Priority Queue Implementation
// ============================================================================

/**
 * Binary Min-Heap for efficient priority queue operations.
 * - insert: O(log n)
 * - extractMin: O(log n)
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

  insert(node: Node): void {
    const key = this.getKey(node);
    if (this.positionMap.has(key)) {
      // Update existing node's position
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
// Greedy Best-First Search Algorithm
// ============================================================================

/**
 * Manhattan Distance Heuristic
 *
 * For 4-directional movement, Manhattan distance provides
 * the estimated distance to the goal.
 *
 * @param nodeA - Current node
 * @param nodeB - Target node (typically the finish node)
 * @returns The Manhattan distance between the two nodes
 */
function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Performs Greedy Best-First Search to find a path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm Steps:
 * 1. Initialize priority = heuristic (distance to goal only)
 * 2. Add startNode to min-heap priority queue
 * 3. Loop while heap is not empty:
 *    - Extract node with lowest heuristic (closest to goal)
 *    - If node is finish → return visitedNodesInOrder
 *    - If node is wall or visited → skip
 *    - Mark as visited, add to visitedNodesInOrder
 *    - For each unvisited neighbor:
 *      - Set previousNode for path reconstruction
 *      - Calculate priority = heuristic only (no gScore!)
 *      - Add to heap
 * 4. Return visitedNodesInOrder (empty or partial if no path)
 *
 * Key Characteristics:
 * - Does NOT guarantee shortest path
 * - Very fast for simple mazes (beelines toward goal)
 * - Can get "stuck" in dead ends with complex mazes
 * - Explores far fewer nodes than BFS/Dijkstra in best case
 */
export function greedyBestFirst(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const visited = new Set<string>();

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;

  // Store heuristic values for heap priority
  const hScore = new Map<string, number>();

  // Min-heap priority queue using heuristic only
  const openSet = new MinHeap(
    getKey,
    (node: Node) => hScore.get(getKey(node)) ?? Infinity
  );

  // Initialize start node with heuristic only (no gScore)
  const startKey = getKey(startNode);
  hScore.set(startKey, manhattanDistance(startNode, finishNode));
  openSet.insert(startNode);

  while (!openSet.isEmpty()) {
    const current = openSet.extractMin()!;
    const currentKey = getKey(current);

    // Skip walls - they are not traversable
    if (current.isWall) {
      continue;
    }

    // Skip already visited nodes
    if (visited.has(currentKey)) {
      continue;
    }

    // Mark as visited and record visit order
    visited.add(currentKey);
    current.isVisited = true;
    visitedNodesInOrder.push(current);

    // If we reached the finish, we're done!
    if (current === finishNode) {
      return visitedNodesInOrder;
    }

    // Explore neighbors
    const neighbors = getNeighbors(current, grid);

    for (const neighbor of neighbors) {
      const neighborKey = getKey(neighbor);

      // Skip walls and already visited nodes
      if (neighbor.isWall || visited.has(neighborKey)) {
        continue;
      }

      // Set the path pointer for backtracking
      neighbor.previousNode = current;

      // GREEDY: priority = heuristic ONLY (no gScore!)
      // This is the key difference from A*
      hScore.set(neighborKey, manhattanDistance(neighbor, finishNode));

      // Add to open set
      openSet.insert(neighbor);
    }
  }

  // No path found - return visited nodes anyway for visualization
  return visitedNodesInOrder;
}

/**
 * Backtracks from finishNode to find the path.
 *
 * @param finishNode - The destination node (must have been reached by greedyBestFirst)
 * @returns Array of nodes representing the path from start to finish
 *
 * Note: This path is NOT guaranteed to be the shortest!
 * Returns nodes in order from START to FINISH (reversed during construction)
 */
export function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  const nodesInPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;

  // Follow previousNode pointers back to start
  while (currentNode !== null) {
    // Add to beginning to build path from start → finish
    nodesInPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInPathOrder;
}

// ============================================================================
// Helper Functions (not exported - internal use only)
// ============================================================================

/**
 * Gets all neighbors of a node (4-directional: up, down, left, right).
 * Does NOT filter by visited status - that's handled in the main loop.
 */
function getNeighbors(node: Node, grid: Grid): Node[] {
  const neighbors: Node[] = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Up
  if (row > 0) {
    neighbors.push(grid[row - 1][col]);
  }
  // Down
  if (row < numRows - 1) {
    neighbors.push(grid[row + 1][col]);
  }
  // Left
  if (col > 0) {
    neighbors.push(grid[row][col - 1]);
  }
  // Right
  if (col < numCols - 1) {
    neighbors.push(grid[row][col + 1]);
  }

  return neighbors;
}
