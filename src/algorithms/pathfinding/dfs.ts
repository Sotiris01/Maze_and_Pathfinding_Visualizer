/**
 * Depth-First Search (DFS) Algorithm Implementation
 * Phase D: Advanced Features
 *
 * DFS explores as far as possible along each branch before backtracking.
 * Unlike BFS, DFS does NOT guarantee the shortest path.
 *
 * This is a pure TypeScript implementation with no DOM/React dependencies.
 * Returns the order of visited nodes for animation purposes.
 */

import { Grid, Node } from '../../types';

/**
 * Performs Depth-First Search to find a path (not necessarily shortest).
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited
 *
 * Algorithm Steps (Iterative):
 * 1. Initialize a stack with the start node
 * 2. While stack is not empty:
 *    - Pop the last node (LIFO)
 *    - If node is finish → return visitedNodesInOrder
 *    - If already visited → skip
 *    - Mark as visited and add to visitedNodesInOrder
 *    - Get all unvisited neighbors
 *    - For each neighbor:
 *      - Set previousNode pointer
 *      - Push to stack
 * 3. Return visitedNodesInOrder (may be incomplete if no path exists)
 *
 * Key Characteristics:
 * - Does NOT guarantee shortest path (explores depth-first)
 * - Uses a Stack (LIFO) data structure
 * - Memory efficient for deep paths
 * - Creates a "snake-like" movement pattern
 * - Time Complexity: O(V + E) where V = vertices, E = edges
 */
export function dfs(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];

  // Stack for DFS - LIFO (Last In, First Out)
  const stack: Node[] = [];

  // Initialize: push start node onto stack
  stack.push(startNode);

  while (stack.length > 0) {
    // Pop the last node (LIFO)
    const currentNode = stack.pop()!;

    // Skip walls - they are not traversable
    if (currentNode.isWall) {
      continue;
    }

    // Skip already visited nodes
    if (currentNode.isVisited) {
      continue;
    }

    // Mark as visited
    currentNode.isVisited = true;

    // Record visit order for animation
    visitedNodesInOrder.push(currentNode);

    // If we reached the finish, we're done!
    if (currentNode === finishNode) {
      return visitedNodesInOrder;
    }

    // Get all unvisited neighbors
    // Order: Up, Right, Down, Left
    // Since stack is LIFO, we push in reverse order so Up is explored first
    const neighbors = getUnvisitedNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      // Skip walls
      if (neighbor.isWall) {
        continue;
      }

      // Skip already visited
      if (neighbor.isVisited) {
        continue;
      }

      // Set previousNode for path reconstruction
      neighbor.previousNode = currentNode;

      // Push to stack
      stack.push(neighbor);
    }
  }

  // No path found - return visited nodes anyway for visualization
  return visitedNodesInOrder;
}

/**
 * Backtracks from finishNode to find the path.
 * (Identical to BFS/Dijkstra/A* since all use previousNode pointers)
 *
 * @param finishNode - The destination node (must have been reached by dfs)
 * @returns Array of nodes representing the path from start to finish
 *
 * Note: Returns nodes in order from START to FINISH (reversed during construction)
 * Warning: For DFS, this path is NOT necessarily the shortest!
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
 *
 * Order: Up, Right, Down, Left (reversed for stack to create consistent movement)
 * Since stack is LIFO, the last pushed neighbor is explored first.
 * We push Left, Down, Right, Up so that Up is explored first.
 */
function getUnvisitedNeighbors(node: Node, grid: Grid): Node[] {
  const neighbors: Node[] = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Push in reverse order for LIFO stack: Left, Down, Right, Up
  // This makes DFS explore in order: Up, Right, Down, Left

  // Left (pushed first, explored last)
  if (col > 0) {
    neighbors.push(grid[row][col - 1]);
  }
  // Down
  if (row < numRows - 1) {
    neighbors.push(grid[row + 1][col]);
  }
  // Right
  if (col < numCols - 1) {
    neighbors.push(grid[row][col + 1]);
  }
  // Up (pushed last, explored first)
  if (row > 0) {
    neighbors.push(grid[row - 1][col]);
  }

  // Filter to only unvisited neighbors
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

export default dfs;
