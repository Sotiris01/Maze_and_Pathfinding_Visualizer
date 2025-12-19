/**
 * Path Visualization Utilities
 *
 * HARD RESET: All complex 8-segment/conic-gradient logic has been removed.
 * Path visualization will be handled by an SVG Overlay component instead.
 *
 * This file contains utility functions for path calculations.
 */

import { Node } from "../types";

/**
 * Calculates the total weighted length of a path.
 * The path length is the sum of all node weights in the path.
 *
 * @param path - Array of nodes in the path
 * @returns Sum of weights of all nodes in the path, or -1 if path is invalid
 */
export function calculateWeightedPathLength(path: Node[]): number {
  if (path.length <= 1) return -1;

  // Sum the weights of all nodes in the path
  return path.reduce((sum, node) => sum + node.weight, 0);
}
