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
 * Note: Since this algorithm uses heuristics (needs to know target location),
 * it should be DISABLED in Hidden Target Mode.
 */

import { Grid, Node } from "../../types";

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
 * 1. Initialize fScore = heuristic (distance to goal only)
 * 2. Add startNode to Open Set
 * 3. Loop while Open Set is not empty:
 *    - Pop node with lowest fScore (closest to goal by heuristic)
 *    - If node is finish → return visitedNodesInOrder
 *    - If node is wall or visited → skip
 *    - Mark as visited, add to visitedNodesInOrder
 *    - For each unvisited neighbor:
 *      - Set previousNode for path reconstruction
 *      - Calculate fScore = heuristic only (no gScore!)
 *      - Add to Open Set
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

  // Use Map to track fScore (heuristic only)
  // Key: "row-col", Value: heuristic score
  const fScore = new Map<string, number>();
  const inOpenSet = new Map<string, boolean>();

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;

  // Initialize all nodes with Infinity scores
  for (const row of grid) {
    for (const node of row) {
      const key = getKey(node);
      fScore.set(key, Infinity);
    }
  }

  // Initialize start node with heuristic only (no gScore)
  const startKey = getKey(startNode);
  fScore.set(startKey, manhattanDistance(startNode, finishNode));

  // Open Set - nodes to be evaluated (sorted by fScore)
  const openSet: Node[] = [startNode];
  inOpenSet.set(startKey, true);

  while (openSet.length > 0) {
    // Sort by fScore (heuristic only) and get node with lowest fScore
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

      // Skip if already in open set (unlike A*, we don't update paths)
      if (inOpenSet.get(neighborKey)) {
        continue;
      }

      // Set the path pointer for backtracking
      neighbor.previousNode = current;

      // GREEDY: fScore = heuristic ONLY (no gScore!)
      // This is the key difference from A*
      fScore.set(neighborKey, manhattanDistance(neighbor, finishNode));

      // Add to open set
      openSet.push(neighbor);
      inOpenSet.set(neighborKey, true);
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
