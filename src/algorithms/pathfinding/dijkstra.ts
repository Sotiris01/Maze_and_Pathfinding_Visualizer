/**
 * Dijkstra's Algorithm Implementation
 * Phase B: Basic Pathfinding
 *
 * This is a pure TypeScript implementation with no DOM/React dependencies.
 * Returns the order of visited nodes for animation purposes.
 */

import { Grid, Node } from '../../types';

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
 * 2. Create list of all unvisited nodes
 * 3. Loop:
 *    - Sort unvisited by distance, pick closest
 *    - If closest is Infinity → trapped (no path)
 *    - If closest is wall → skip
 *    - If closest is finish → done
 *    - Update neighbors' distances and previousNode
 *    - Mark as visited, add to visitedNodesInOrder
 */
export function dijkstra(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];

  // Initialize start node distance
  startNode.distance = 0;

  // Get all nodes as unvisited list
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    // Sort by distance (smallest first)
    sortNodesByDistance(unvisitedNodes);

    // Get the closest node
    const closestNode = unvisitedNodes.shift()!;

    // Skip walls - they are not traversable
    if (closestNode.isWall) {
      continue;
    }

    // If closest node has Infinity distance, we're trapped
    // (no path exists to remaining nodes)
    if (closestNode.distance === Infinity) {
      return visitedNodesInOrder;
    }

    // Mark as visited and record visit order
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    // If we reached the finish, we're done!
    if (closestNode === finishNode) {
      return visitedNodesInOrder;
    }

    // Update all unvisited neighbors
    updateUnvisitedNeighbors(closestNode, grid);
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
 * Flattens the 2D grid into a 1D array of all nodes.
 */
function getAllNodes(grid: Grid): Node[] {
  const nodes: Node[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

/**
 * Sorts nodes by distance in ascending order (in-place).
 * Note: Simple array sort is O(n log n). A Min-Heap would be O(log n)
 * for production, but this is acceptable for visualization purposes.
 */
function sortNodesByDistance(unvisitedNodes: Node[]): void {
  unvisitedNodes.sort((a, b) => a.distance - b.distance);
}

/**
 * Updates the distance and previousNode of all unvisited neighbors.
 * Each neighbor's distance = current distance + 1 (uniform cost)
 */
function updateUnvisitedNeighbors(node: Node, grid: Grid): void {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);

  for (const neighbor of unvisitedNeighbors) {
    // Distance to neighbor is current distance + 1
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

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
