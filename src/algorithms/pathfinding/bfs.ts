/**
 * Breadth-First Search (BFS) Algorithm Implementation
 * Phase D: Advanced Features
 *
 * BFS explores nodes layer by layer, guaranteeing the shortest path
 * in an unweighted graph (all edges have equal cost).
 *
 * This is a pure TypeScript implementation with no DOM/React dependencies.
 * Returns the order of visited nodes for animation purposes.
 *
 * Uses an O(1) dequeue implementation for optimal performance.
 */

import { Grid, Node } from "../../types";

// ============================================================================
// O(1) Queue Implementation
// ============================================================================

/**
 * Simple queue with O(1) enqueue and dequeue operations.
 * Uses a head pointer instead of Array.shift() which is O(n).
 */
class Queue<T> {
  private items: T[] = [];
  private head: number = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    this.head++;
    // Periodically compact the array to prevent memory bloat
    if (this.head > 1000 && this.head > this.items.length / 2) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return item;
  }

  isEmpty(): boolean {
    return this.head >= this.items.length;
  }

  get size(): number {
    return this.items.length - this.head;
  }
}

// ============================================================================
// BFS Algorithm
// ============================================================================

/**
 * Performs Breadth-First Search to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm Steps:
 * 1. Initialize a queue with the start node
 * 2. Mark start node as visited
 * 3. While queue is not empty:
 *    - Dequeue the first node (FIFO) - O(1)
 *    - If node is finish → return visitedNodesInOrder
 *    - If node is wall → skip
 *    - Get all unvisited neighbors (up, down, left, right)
 *    - For each neighbor:
 *      - Mark as visited
 *      - Set previousNode pointer
 *      - Enqueue the neighbor
 *      - Add to visitedNodesInOrder
 * 4. Return visitedNodesInOrder (may be incomplete if no path exists)
 *
 * Time Complexity: O(V + E) where V = vertices, E = edges
 * Space Complexity: O(V)
 */
export function bfs(grid: Grid, startNode: Node, finishNode: Node): Node[] {
  const visitedNodesInOrder: Node[] = [];

  // Queue for BFS - FIFO with O(1) operations
  const queue = new Queue<Node>();

  // Initialize: mark start as visited and enqueue
  startNode.isVisited = true;
  startNode.distance = 0;
  queue.enqueue(startNode);
  visitedNodesInOrder.push(startNode);

  while (!queue.isEmpty()) {
    // Dequeue the first node (FIFO) - O(1)
    const currentNode = queue.dequeue()!;

    // Skip walls - they are not traversable
    if (currentNode.isWall) {
      continue;
    }

    // If we reached the finish, we're done!
    if (currentNode === finishNode) {
      return visitedNodesInOrder;
    }

    // Get all unvisited neighbors
    const neighbors = getUnvisitedNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      // Skip walls
      if (neighbor.isWall) {
        continue;
      }

      // Mark as visited
      neighbor.isVisited = true;

      // Set previousNode for path reconstruction
      neighbor.previousNode = currentNode;

      // Set distance (optional for BFS, but useful for consistency)
      neighbor.distance = currentNode.distance + 1;

      // Enqueue the neighbor - O(1)
      queue.enqueue(neighbor);

      // Record visit order for animation
      visitedNodesInOrder.push(neighbor);

      // Early exit: if we just added the finish node, we can return
      if (neighbor === finishNode) {
        return visitedNodesInOrder;
      }
    }
  }

  // No path found - return visited nodes anyway for visualization
  return visitedNodesInOrder;
}

/**
 * Backtracks from finishNode to find the shortest path.
 * (Identical to Dijkstra/A* since all use previousNode pointers)
 *
 * @param finishNode - The destination node (must have been reached by bfs)
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
function getUnvisitedNeighbors(node: Node, grid: Grid): Node[] {
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

  // Filter to only unvisited neighbors
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

export default bfs;
