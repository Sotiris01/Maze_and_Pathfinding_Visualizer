/**
 * Bidirectional A* (A-Star) Algorithm Implementation
 * Phase F: Extensions & History
 *
 * Bidirectional A* combines the efficiency of A* heuristic search with
 * bidirectional search strategy. It searches from both start and finish
 * nodes simultaneously, using heuristics from both ends.
 *
 * Key Characteristics:
 * - Uses priority queues (Open Sets) sorted by fScore for both directions
 * - Two heuristics: startOpenSet → finishNode, finishOpenSet → startNode
 * - Meeting point detection when frontiers intersect
 * - Guarantees shortest path in graphs with consistent heuristics
 * - Can be significantly faster than unidirectional A*
 *
 * Time Complexity: O(b^(d/2)) compared to O(b^d) for unidirectional A*
 * where b = branching factor, d = depth
 */

import { Grid, Node } from "../../types";

// Module-level variable to store the path after algorithm runs
let reconstructedPath: Node[] = [];

/**
 * Manhattan Distance Heuristic
 *
 * For 4-directional movement, Manhattan distance provides an
 * admissible heuristic (never overestimates the actual cost).
 */
function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Performs Bidirectional A* algorithm to find the shortest path.
 *
 * @param grid - The 2D grid of nodes
 * @param startNode - The starting node
 * @param finishNode - The destination node
 * @returns Array of nodes in the order they were visited (alternating from both sides)
 *
 * Algorithm Steps:
 * 1. Initialize two Open Sets (priority queues) - one from start, one from finish
 * 2. Each side uses gScore (distance from origin) and fScore (gScore + heuristic)
 * 3. Loop while both Open Sets are not empty:
 *    - Expand from start side: pop lowest fScore, check for intersection
 *    - Expand from finish side: pop lowest fScore, check for intersection
 * 4. When frontiers meet, reconstruct path through meeting point
 */
export function bidirectionalAStar(
  grid: Grid,
  startNode: Node,
  finishNode: Node
): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Reset the path
  reconstructedPath = [];

  // Helper to get node key
  const getKey = (node: Node): string => `${node.row}-${node.col}`;
  const getNodeFromKey = (key: string): Node => {
    const [row, col] = key.split("-").map(Number);
    return grid[row][col];
  };

  // === START SIDE DATA STRUCTURES ===
  // gScore: distance from startNode
  // fScore: gScore + heuristic to finishNode
  const gScoreStart = new Map<string, number>();
  const fScoreStart = new Map<string, number>();
  const parentFromStart = new Map<string, Node | null>();
  const visitedFromStart = new Set<string>();
  const inOpenSetStart = new Map<string, boolean>();
  const openSetStart: Node[] = [];

  // === FINISH SIDE DATA STRUCTURES ===
  // gScore: distance from finishNode
  // fScore: gScore + heuristic to startNode
  const gScoreFinish = new Map<string, number>();
  const fScoreFinish = new Map<string, number>();
  const parentFromFinish = new Map<string, Node | null>();
  const visitedFromFinish = new Set<string>();
  const inOpenSetFinish = new Map<string, boolean>();
  const openSetFinish: Node[] = [];

  // Initialize all nodes with Infinity scores
  for (const row of grid) {
    for (const node of row) {
      const key = getKey(node);
      gScoreStart.set(key, Infinity);
      fScoreStart.set(key, Infinity);
      gScoreFinish.set(key, Infinity);
      fScoreFinish.set(key, Infinity);
    }
  }

  // Initialize start node
  const startKey = getKey(startNode);
  gScoreStart.set(startKey, 0);
  fScoreStart.set(startKey, manhattanDistance(startNode, finishNode));
  parentFromStart.set(startKey, null);
  openSetStart.push(startNode);
  inOpenSetStart.set(startKey, true);
  visitedFromStart.add(startKey);
  startNode.isVisited = true;
  visitedNodesInOrder.push(startNode);

  // Initialize finish node
  const finishKey = getKey(finishNode);
  gScoreFinish.set(finishKey, 0);
  fScoreFinish.set(finishKey, manhattanDistance(finishNode, startNode));
  parentFromFinish.set(finishKey, null);
  openSetFinish.push(finishNode);
  inOpenSetFinish.set(finishKey, true);
  visitedFromFinish.add(finishKey);

  // Track meeting point
  let meetingKey: string | null = null;
  let bestPathCost = Infinity;

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

  /**
   * Sort and pop the node with lowest fScore from an open set
   */
  const popLowestFScore = (
    openSet: Node[],
    fScore: Map<string, number>
  ): Node | undefined => {
    openSet.sort((a, b) => {
      const fA = fScore.get(getKey(a)) ?? Infinity;
      const fB = fScore.get(getKey(b)) ?? Infinity;
      return fA - fB;
    });
    return openSet.shift();
  };

  // Main loop - alternate between expanding from start and finish
  while (openSetStart.length > 0 && openSetFinish.length > 0) {
    // === EXPAND FROM START SIDE ===
    if (openSetStart.length > 0) {
      const current = popLowestFScore(openSetStart, fScoreStart);
      if (!current) break;

      const currentKey = getKey(current);
      inOpenSetStart.set(currentKey, false);

      // Skip walls
      if (current.isWall) continue;

      // Check for intersection - has finish side visited this node?
      if (visitedFromFinish.has(currentKey)) {
        // Calculate total path cost through this meeting point
        const pathCost =
          (gScoreStart.get(currentKey) ?? Infinity) +
          (gScoreFinish.get(currentKey) ?? Infinity);

        if (pathCost < bestPathCost) {
          bestPathCost = pathCost;
          meetingKey = currentKey;
        }
      }

      // Process neighbors
      for (const neighbor of getNeighbors(current)) {
        const neighborKey = getKey(neighbor);

        // Skip already fully processed nodes
        if (
          visitedFromStart.has(neighborKey) &&
          !inOpenSetStart.get(neighborKey)
        ) {
          continue;
        }

        const tentativeGScore = (gScoreStart.get(currentKey) ?? Infinity) + 1;
        const neighborGScore = gScoreStart.get(neighborKey) ?? Infinity;

        if (tentativeGScore < neighborGScore) {
          // Found a better path
          parentFromStart.set(neighborKey, current);
          gScoreStart.set(neighborKey, tentativeGScore);
          fScoreStart.set(
            neighborKey,
            tentativeGScore + manhattanDistance(neighbor, finishNode)
          );

          if (!inOpenSetStart.get(neighborKey)) {
            openSetStart.push(neighbor);
            inOpenSetStart.set(neighborKey, true);
          }

          // Add to visited order for animation (if not already visited from start)
          if (!visitedFromStart.has(neighborKey)) {
            visitedFromStart.add(neighborKey);
            neighbor.isVisited = true;
            visitedNodesInOrder.push(neighbor);

            // Check if this creates a better meeting point
            if (visitedFromFinish.has(neighborKey)) {
              const pathCost =
                tentativeGScore + (gScoreFinish.get(neighborKey) ?? Infinity);
              if (pathCost < bestPathCost) {
                bestPathCost = pathCost;
                meetingKey = neighborKey;
              }
            }
          }
        }
      }
    }

    // === EXPAND FROM FINISH SIDE ===
    if (openSetFinish.length > 0) {
      const current = popLowestFScore(openSetFinish, fScoreFinish);
      if (!current) break;

      const currentKey = getKey(current);
      inOpenSetFinish.set(currentKey, false);

      // Skip walls
      if (current.isWall) continue;

      // Add finish node to visited order on first expansion
      if (current === finishNode && !visitedNodesInOrder.includes(finishNode)) {
        finishNode.isVisited = true;
        visitedNodesInOrder.push(finishNode);
      }

      // Check for intersection - has start side visited this node?
      if (visitedFromStart.has(currentKey)) {
        // Calculate total path cost through this meeting point
        const pathCost =
          (gScoreStart.get(currentKey) ?? Infinity) +
          (gScoreFinish.get(currentKey) ?? Infinity);

        if (pathCost < bestPathCost) {
          bestPathCost = pathCost;
          meetingKey = currentKey;
        }
      }

      // Process neighbors
      for (const neighbor of getNeighbors(current)) {
        const neighborKey = getKey(neighbor);

        // Skip already fully processed nodes
        if (
          visitedFromFinish.has(neighborKey) &&
          !inOpenSetFinish.get(neighborKey)
        ) {
          continue;
        }

        const tentativeGScore = (gScoreFinish.get(currentKey) ?? Infinity) + 1;
        const neighborGScore = gScoreFinish.get(neighborKey) ?? Infinity;

        if (tentativeGScore < neighborGScore) {
          // Found a better path
          parentFromFinish.set(neighborKey, current);
          gScoreFinish.set(neighborKey, tentativeGScore);
          fScoreFinish.set(
            neighborKey,
            tentativeGScore + manhattanDistance(neighbor, startNode)
          );

          if (!inOpenSetFinish.get(neighborKey)) {
            openSetFinish.push(neighbor);
            inOpenSetFinish.set(neighborKey, true);
          }

          // Add to visited order for animation (if not already visited from finish)
          if (!visitedFromFinish.has(neighborKey)) {
            visitedFromFinish.add(neighborKey);
            neighbor.isVisited = true;
            visitedNodesInOrder.push(neighbor);

            // Check if this creates a better meeting point
            if (visitedFromStart.has(neighborKey)) {
              const pathCost =
                (gScoreStart.get(neighborKey) ?? Infinity) + tentativeGScore;
              if (pathCost < bestPathCost) {
                bestPathCost = pathCost;
                meetingKey = neighborKey;
              }
            }
          }
        }
      }
    }

    // Early termination: if both sides have exhausted their frontiers near the meeting point
    // We use a simple heuristic: if the sum of minimum fScores exceeds best path cost, we're done
    if (
      meetingKey !== null &&
      openSetStart.length > 0 &&
      openSetFinish.length > 0
    ) {
      const minFStart = fScoreStart.get(getKey(openSetStart[0])) ?? Infinity;
      const minFFinish = fScoreFinish.get(getKey(openSetFinish[0])) ?? Infinity;

      // If the minimum possible path through remaining nodes is worse than our best, stop
      if (minFStart + minFFinish >= bestPathCost) {
        break;
      }
    }
  }

  // Reconstruct path if meeting point found
  if (meetingKey !== null) {
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
 * Returns the shortest path found by bidirectionalAStar.
 * Must be called after bidirectionalAStar has run.
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
