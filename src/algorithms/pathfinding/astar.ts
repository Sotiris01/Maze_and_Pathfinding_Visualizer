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
 */

import { Grid, Node } from '../../types';

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
 * 2. Add startNode to Open Set
 * 3. Loop while Open Set is not empty:
 *    - Pop node with lowest fScore
 *    - If node is finish → return visitedNodesInOrder
 *    - If node is wall → skip
 *    - Mark as visited, add to visitedNodesInOrder
 *    - For each neighbor:
 *      - Calculate tentative gScore
 *      - If tentative < neighbor's gScore:
 *        - Update neighbor's previousNode, gScore, fScore
 *        - Add to Open Set if not present
 * 4. Return visitedNodesInOrder (empty or partial if no path)
 *
 * Key Difference from Dijkstra:
 * - Dijkstra uses only distance from start (gScore)
 * - A* uses distance from start + estimated distance to goal (fScore)
 * - This heuristic guides the search towards the goal more efficiently
 */
export function astar(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];

  // Use Maps to track scores (avoid mutating Node objects in React state)
  // Key: "row-col", Value: score
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const inOpenSet = new Map<string, boolean>();

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

  // Open Set - nodes to be evaluated (sorted by fScore)
  const openSet: Node[] = [startNode];
  inOpenSet.set(startKey, true);

  while (openSet.length > 0) {
    // Sort by fScore and get node with lowest fScore
    openSet.sort((a, b) => {
      const fA = fScore.get(getKey(a)) ?? Infinity;
      const fB = fScore.get(getKey(b)) ?? Infinity;
      return fA - fB;
    });

    const current = openSet.shift()!;
    const currentKey = getKey(current);
    inOpenSet.set(currentKey, false);

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

      // Calculate tentative gScore (current gScore + 1 for uniform cost)
      const tentativeGScore = currentGScore + 1;

      // If this path is better than any previous one
      const neighborGScore = gScore.get(neighborKey) ?? Infinity;
      if (tentativeGScore < neighborGScore) {
        // Update the path - this is the best path to this neighbor so far
        neighbor.previousNode = current;
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + manhattanDistance(neighbor, finishNode));

        // Add to open set if not already there
        if (!inOpenSet.get(neighborKey)) {
          openSet.push(neighbor);
          inOpenSet.set(neighborKey, true);
        }
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
