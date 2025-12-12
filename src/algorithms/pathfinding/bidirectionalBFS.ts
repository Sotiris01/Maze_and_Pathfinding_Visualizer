/**
 * Bidirectional BFS (Breadth-First Search) Algorithm Implementation
 * Phase F: Extensions & History
 *
 * Bidirectional BFS searches from both the start and finish nodes simultaneously,
 * meeting somewhere in the middle. This can be significantly faster than
 * unidirectional BFS as it explores roughly half the search space.
 *
 * Key Characteristics:
 * - Guarantees shortest path in unweighted graphs
 * - Explores from both ends simultaneously
 * - Meeting point detection when frontiers intersect
 * - Uses O(1) queue operations for optimal performance
 *
 * Time Complexity: O(V + E) with efficient queue
 * Space Complexity: O(V)
 */

import { Grid, Node } from "../../types";

// ============================================================================
// O(1) Queue Implementation
// ============================================================================

/**
 * Efficient FIFO Queue with O(1) enqueue and dequeue operations.
 * Uses a head pointer instead of Array.shift() to avoid O(n) operations.
 */
class Queue<T> {
  private items: T[] = [];
  private head: number = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const item = this.items[this.head];
    this.head++;
    // Compact when more than half the array is dead space
    if (this.head > this.items.length / 2 && this.head > 100) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return item;
  }

  get size(): number {
    return this.items.length - this.head;
  }

  isEmpty(): boolean {
    return this.head >= this.items.length;
  }
}

// ============================================================================
// Bidirectional BFS Algorithm
// ============================================================================

/**
 * Performs Bidirectional BFS to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited (alternating from both sides)
 */
export function bidirectionalBFS(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Parent maps for path reconstruction
  const parentFromStart = new Map<string, Node | null>();
  const parentFromFinish = new Map<string, Node | null>();

  // Visited sets for each direction
  const visitedFromStart = new Set<string>();
  const visitedFromFinish = new Set<string>();

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;
  const getNodeFromKey = (key: string): Node => {
    const [row, col] = key.split("-").map(Number);
    return grid[row][col];
  };

  // Initialize O(1) queues
  const startQueue = new Queue<Node>();
  const finishQueue = new Queue<Node>();

  // Initialize start node
  const startKey = getKey(startNode);
  visitedFromStart.add(startKey);
  parentFromStart.set(startKey, null);
  startNode.isVisited = true;
  visitedNodesInOrder.push(startNode);
  startQueue.enqueue(startNode);

  // Initialize finish node
  const finishKey = getKey(finishNode);
  visitedFromFinish.add(finishKey);
  parentFromFinish.set(finishKey, null);
  finishQueue.enqueue(finishNode);

  // Track meeting point
  let meetingKey: string | null = null;

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
  while (!startQueue.isEmpty() && !finishQueue.isEmpty()) {
    // Expand from start side
    if (!startQueue.isEmpty()) {
      const currentNode = startQueue.dequeue()!;

      for (const neighbor of getNeighbors(currentNode)) {
        const neighborKey = getKey(neighbor);

        // Skip if already visited from start
        if (visitedFromStart.has(neighborKey)) continue;

        // Mark as visited from start
        visitedFromStart.add(neighborKey);
        parentFromStart.set(neighborKey, currentNode);
        neighbor.isVisited = true;
        visitedNodesInOrder.push(neighbor);

        // Check if this node was visited from finish - INTERSECTION!
        if (visitedFromFinish.has(neighborKey)) {
          meetingKey = neighborKey;
          break;
        }

        startQueue.enqueue(neighbor);
      }

      if (meetingKey) break;
    }

    // Expand from finish side
    if (!finishQueue.isEmpty() && !meetingKey) {
      const currentNode = finishQueue.dequeue()!;

      // Add finish node to visited order on first expansion
      if (currentNode === finishNode) {
        finishNode.isVisited = true;
        visitedNodesInOrder.push(finishNode);
      }

      for (const neighbor of getNeighbors(currentNode)) {
        const neighborKey = getKey(neighbor);

        // Skip if already visited from finish
        if (visitedFromFinish.has(neighborKey)) continue;

        // Mark as visited from finish
        visitedFromFinish.add(neighborKey);
        parentFromFinish.set(neighborKey, currentNode);
        neighbor.isVisited = true;
        visitedNodesInOrder.push(neighbor);

        // Check if this node was visited from start - INTERSECTION!
        if (visitedFromStart.has(neighborKey)) {
          meetingKey = neighborKey;
          break;
        }

        finishQueue.enqueue(neighbor);
      }

      if (meetingKey) break;
    }
  }

  // Reconstruct path if meeting point found
  if (meetingKey) {
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

    // Mark finish as having a valid path
    finishNode.isVisited = true;
  }

  return visitedNodesInOrder;
}

/**
 * Returns the shortest path found by bidirectionalBFS.
 * Uses the previousNode chain set up during path reconstruction.
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
