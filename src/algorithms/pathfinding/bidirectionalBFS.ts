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
 * - Time Complexity: O(b^(d/2)) compared to O(b^d) for unidirectional
 *   where b = branching factor, d = depth
 */

import { Grid, Node } from "../../types";

// Module-level variable to store the path after algorithm runs
let reconstructedPath: Node[] = [];

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

  // Reset the path
  reconstructedPath = [];

  // Parent maps for path reconstruction
  const parentFromStart: Map<string, Node | null> = new Map();
  const parentFromFinish: Map<string, Node | null> = new Map();

  // Visited sets for each direction
  const visitedFromStart: Set<string> = new Set();
  const visitedFromFinish: Set<string> = new Set();

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;
  const getNodeFromKey = (key: string): Node => {
    const [row, col] = key.split("-").map(Number);
    return grid[row][col];
  };

  // Initialize queues
  const startQueue: Node[] = [startNode];
  const finishQueue: Node[] = [finishNode];

  // Initialize start node
  const startKey = getKey(startNode);
  visitedFromStart.add(startKey);
  parentFromStart.set(startKey, null);
  startNode.isVisited = true;
  visitedNodesInOrder.push(startNode);

  // Initialize finish node
  const finishKey = getKey(finishNode);
  visitedFromFinish.add(finishKey);
  parentFromFinish.set(finishKey, null);

  // Track meeting point
  let meetingKey: string | null = null;

  /**
   * Gets all non-wall neighbors of a node
   */
  const getNeighbors = (node: Node): Node[] => {
    const neighbors: Node[] = [];
    const { row, col } = node;

    // Up
    if (row > 0) neighbors.push(grid[row - 1][col]);
    // Down
    if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
    // Left
    if (col > 0) neighbors.push(grid[row][col - 1]);
    // Right
    if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

    return neighbors.filter((n) => !n.isWall);
  };

  // Main loop - alternate between expanding from start and finish
  while (startQueue.length > 0 && finishQueue.length > 0) {
    // Expand from start side
    if (startQueue.length > 0) {
      const currentNode = startQueue.shift()!;

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

        startQueue.push(neighbor);
      }

      if (meetingKey) break;
    }

    // Expand from finish side
    if (finishQueue.length > 0 && !meetingKey) {
      const currentNode = finishQueue.shift()!;

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

        finishQueue.push(neighbor);
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

    // Combine paths
    reconstructedPath = [...pathFromStart, ...pathToFinish];

    // Set up previousNode chain for the path (for compatibility with animation)
    for (let i = 1; i < reconstructedPath.length; i++) {
      reconstructedPath[i].previousNode = reconstructedPath[i - 1];
    }

    // Mark finish as having a valid path
    finishNode.isVisited = true;
  }

  return visitedNodesInOrder;
}

/**
 * Returns the shortest path found by bidirectionalBFS.
 * Must be called after bidirectionalBFS has run.
 *
 * @param finishNode - The destination node (used for compatibility, actual path stored internally)
 * @returns Array of nodes representing the shortest path from start to finish
 */
export function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  // If we have a reconstructed path from bidirectional search, use it
  if (reconstructedPath.length > 0) {
    return reconstructedPath;
  }

  // Fallback: standard path reconstruction via previousNode chain
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
