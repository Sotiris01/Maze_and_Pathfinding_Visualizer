/**
 * Dijkstra's Algorithm Implementation
 * Phase B: Basic Pathfinding
 *
 * This is a pure TypeScript implementation with no DOM/React dependencies.
 * Returns the order of visited nodes for animation purposes.
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
 * - decreaseKey: O(log n)
 */
class MinHeap {
  private heap: Node[] = [];
  private positionMap: Map<string, number> = new Map();

  private getKey(node: Node): string {
    return `${node.row}-${node.col}`;
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
      // Update existing node (decrease key)
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
      if (this.heap[idx].distance >= this.heap[parentIdx].distance) {
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
        this.heap[leftIdx].distance < this.heap[smallest].distance
      ) {
        smallest = leftIdx;
      }
      if (
        rightIdx < length &&
        this.heap[rightIdx].distance < this.heap[smallest].distance
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
// Dijkstra's Algorithm
// ============================================================================

/**
 * Performs Dijkstra's algorithm to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm Steps:
 * 1. Initialize start node distance to 0 (all others are Infinity)
 * 2. Insert start node into min-heap priority queue
 * 3. Loop while heap is not empty:
 *    - Extract node with minimum distance
 *    - If already visited → skip
 *    - If wall → skip
 *    - Mark as visited, add to visitedNodesInOrder
 *    - If finish → done
 *    - Relax all unvisited neighbors (update distances if shorter)
 */
export function dijkstra(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const visited = new Set<string>();

  const getKey = (node: Node): string => `${node.row}-${node.col}`;

  // Initialize start node distance
  startNode.distance = 0;

  // Min-heap priority queue
  const minHeap = new MinHeap();
  minHeap.insert(startNode);

  while (!minHeap.isEmpty()) {
    // Extract node with minimum distance
    const closestNode = minHeap.extractMin()!;
    const closestKey = getKey(closestNode);

    // Skip if already visited
    if (visited.has(closestKey)) {
      continue;
    }

    // Skip walls - they are not traversable
    if (closestNode.isWall) {
      continue;
    }

    // If closest node has Infinity distance, we're trapped
    if (closestNode.distance === Infinity) {
      return visitedNodesInOrder;
    }

    // Mark as visited and record visit order
    visited.add(closestKey);
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    // If we reached the finish, we're done!
    if (closestNode === finishNode) {
      return visitedNodesInOrder;
    }

    // Relax all unvisited neighbors
    const neighbors = getUnvisitedNeighbors(closestNode, grid, visited);
    for (const neighbor of neighbors) {
      const newDistance = closestNode.distance + 1;

      // Standard Dijkstra relaxation: only update if shorter
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = closestNode;
        minHeap.insert(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}

/**
 * Backtracks from finishNode to find the shortest path.
 *
 * @param finishNode - The destination node (must have been reached by dijkstra)
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
 * Gets all unvisited, non-wall neighbors of a node.
 * Neighbors are the 4 adjacent cells (up, down, left, right).
 */
function getUnvisitedNeighbors(
  node: Node,
  grid: Grid,
  visited: Set<string>
): Node[] {
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

  // Filter to only unvisited, non-wall neighbors
  return neighbors.filter((neighbor) => {
    const key = `${neighbor.row}-${neighbor.col}`;
    return !visited.has(key) && !neighbor.isWall;
  });
}
