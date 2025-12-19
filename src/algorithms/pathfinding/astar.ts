/**
 * A* (A-Star) Algorithm Implementation
 * Phase D: Advanced Features
 *
 * A* is an informed search algorithm that uses a heuristic to guide
 * its search towards the goal, making it more efficient than Dijkstra
 * for pathfinding problems.
 *
 * This is a pure TypeScript implementation with no DOM/React dependencies.
 * Returns the order of visited nodes for animation purposes.
 *
 * Uses a binary min-heap priority queue for O(n log n) performance.
 */

import { Grid, Node } from "../../types";

// ============================================================================
// Min-Heap Priority Queue Implementation
// ============================================================================

/**
 * Binary Min-Heap for efficient priority queue operations.
 * - insert: O(log n)
 * - extractMin: O(log n)
 * - decreaseKey (via re-insert): O(log n)
 */
class MinHeap {
  private heap: Node[] = [];
  private getKey: (node: Node) => string;
  private getPriority: (node: Node) => number;
  private positionMap: Map<string, number> = new Map(); // Track node positions for O(1) contains check

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

  contains(node: Node): boolean {
    return this.positionMap.has(this.getKey(node));
  }

  insert(node: Node): void {
    const key = this.getKey(node);
    if (this.positionMap.has(key)) {
      // Node already exists - update its position (decrease key operation)
      const idx = this.positionMap.get(key)!;
      this.heap[idx] = node;
      this.bubbleUp(idx);
      this.bubbleDown(idx);
    } else {
      // New node
      this.heap.push(node);
      const idx = this.heap.length - 1;
      this.positionMap.set(key, idx);
      this.bubbleUp(idx);
    }
  }

  extractMin(): Node | null {
    if (this.heap.length === 0) return null;
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
// A* Algorithm
// ============================================================================

/**
 * Manhattan Distance Heuristic
 *
 * For 4-directional movement (up, down, left, right), the Manhattan distance
 * provides an admissible heuristic (never overestimates the actual cost).
 *
 * @param nodeA - First node
 * @param nodeB - Second node (typically the finish node)
 * @returns The Manhattan distance between the two nodes
 */
function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Performs A* algorithm to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm Steps:
 * 1. Initialize gScore (distance from start) and fScore (gScore + heuristic)
 * 2. Add startNode to Open Set (min-heap priority queue)
 * 3. Loop while Open Set is not empty:
 *    - Extract node with lowest fScore (O(log n))
 *    - If node is finish → return visitedNodesInOrder
 *    - If node is wall → skip
 *    - Mark as visited, add to visitedNodesInOrder
 *    - For each neighbor:
 *      - Calculate tentative gScore
 *      - If tentative < neighbor's gScore:
 *        - Update neighbor's previousNode, gScore, fScore
 *        - Insert/update in Open Set (O(log n))
 * 4. Return visitedNodesInOrder (empty or partial if no path)
 *
 * Time Complexity: O((V + E) log V) with min-heap
 * Space Complexity: O(V)
 */
export function astar(grid: Grid, startNode: Node, finishNode: Node): Node[] {
  const visitedNodesInOrder: Node[] = [];

  // Use Maps to track scores (avoid mutating Node objects in React state)
  // Key: "row-col", Value: score
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;

  // Initialize all nodes with Infinity scores
  for (const row of grid) {
    for (const node of row) {
      const key = getKey(node);
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    }
  }

  // Initialize start node
  const startKey = getKey(startNode);
  gScore.set(startKey, 0);
  fScore.set(startKey, manhattanDistance(startNode, finishNode));

  // Open Set - min-heap priority queue sorted by fScore
  const openSet = new MinHeap(
    getKey,
    (node: Node) => fScore.get(getKey(node)) ?? Infinity
  );
  openSet.insert(startNode);

  while (!openSet.isEmpty()) {
    // Extract node with lowest fScore - O(log n)
    const current = openSet.extractMin()!;
    const currentKey = getKey(current);

    // Skip walls - they are not traversable
    if (current.isWall) {
      continue;
    }

    // Skip already visited nodes
    if (current.isVisited) {
      continue;
    }

    // Check if we're trapped (no path exists)
    const currentGScore = gScore.get(currentKey) ?? Infinity;
    if (currentGScore === Infinity) {
      return visitedNodesInOrder;
    }

    // Mark as visited and record visit order
    current.isVisited = true;
    visitedNodesInOrder.push(current);

    // If we reached the finish, we're done!
    if (current === finishNode) {
      return visitedNodesInOrder;
    }

    // Explore neighbors
    const neighbors = getNeighbors(current, grid);

    for (const neighbor of neighbors) {
      // Skip walls and already visited nodes
      if (neighbor.isWall || neighbor.isVisited) {
        continue;
      }

      const neighborKey = getKey(neighbor);

      // Calculate tentative gScore using neighbor's weight as traversal cost
      // (1 = normal terrain, higher = heavier terrain like mud/hills)
      const tentativeGScore = currentGScore + neighbor.weight;

      // If this path is better than any previous one
      const neighborGScore = gScore.get(neighborKey) ?? Infinity;
      if (tentativeGScore < neighborGScore) {
        // Update the path - this is the best path to this neighbor so far
        neighbor.previousNode = current;
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(
          neighborKey,
          tentativeGScore + manhattanDistance(neighbor, finishNode)
        );

        // Insert or update in open set - O(log n)
        openSet.insert(neighbor);
      }
    }
  }

  // No path found - return visited nodes anyway for visualization
  return visitedNodesInOrder;
}

/**
 * Backtracks from finishNode to find the shortest path.
 * (Reuses the same logic as Dijkstra since both use previousNode pointers)
 *
 * @param finishNode - The destination node (must have been reached by astar)
 * @returns Array of nodes representing the shortest path from start to finish
 *
 * Note: Returns nodes in order from START to FINISH (reversed during construction)
 */
export function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  const nodesInShortestPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;

  // Follow previousNode pointers back to start
  while (currentNode !== null) {
    // Add to beginning to build path from start → finish
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInShortestPathOrder;
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

export default astar;
