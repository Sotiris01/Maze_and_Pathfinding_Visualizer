/**
 * Terrain Map Generation using Perlin Noise
 * Phase G: Weighted Terrain & Advanced Algorithms
 *
 * Generates organic "terrain maps" where grid weights vary smoothly
 * like hills and valleys. Uses 2D Perlin Noise for natural-looking
 * height distributions.
 *
 * Key Characteristics:
 * - Smooth, organic weight transitions (no jagged edges)
 * - Configurable frequency for terrain scale
 * - Full weight range 1-10 using contrast stretching
 * - Valleys (low noise values) become plains (1-3)
 * - Hills (medium noise values) become medium terrain (4-7)
 * - Peaks (high noise values) become heavy terrain (8-10)
 *
 * Weight Distribution Strategy:
 * - Uses contrast stretching on fbm output (typically 0.25-0.75)
 * - Linearly maps stretched values to weights 1-10
 */

import { Grid, Node } from "../../types";
import { fbm, seedNoise } from "../../utils/perlinNoise";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Terrain generation configuration
 */
interface TerrainConfig {
  /** Base frequency - lower = larger terrain features (default: 0.12) */
  frequency: number;
  /** Number of noise octaves for detail (default: 3) */
  octaves: number;
  /** How much each octave contributes (default: 0.5) */
  persistence: number;
  /** Frequency multiplier per octave (default: 2.0) */
  lacunarity: number;
  /** Whether to use animation frames (default: true) */
  animated: boolean;
  /** Intensity bias - lower = more peaks, higher = more valleys (default: 0.7) */
  intensity: number;
}

const DEFAULT_CONFIG: TerrainConfig = {
  frequency: 0.12,
  octaves: 3,
  persistence: 0.5,
  lacunarity: 2.0,
  animated: true,
  intensity: 0.7,
};

// ============================================================================
// Weight Mapping
// ============================================================================

/**
 * Maps noise value (0-1) to terrain weight (1-10)
 *
 * Uses contrast enhancement to stretch the typical fbm output range
 * (which clusters around 0.3-0.7) to the full 0-1 range, then maps
 * with a bias toward higher weights.
 *
 * @param noiseValue - Noise value between 0 and 1
 * @param intensity - Power curve exponent (lower = more peaks, higher = more valleys)
 * @returns Weight between 1 and 10
 */
function mapNoiseToWeight(noiseValue: number, intensity: number): number {
  // FBM output typically clusters around 0.3-0.7
  // Apply aggressive contrast stretching to push more values to extremes
  // Map 0.3-0.65 to 0-1, then clamp (narrower range = more extremes)
  const stretched = (noiseValue - 0.3) * 2.85;
  const n = Math.max(0, Math.min(1, stretched));

  // Apply power curve to bias toward higher weights
  // Lower intensity (e.g., 0.5) = more peaks (weight 10s)
  // Higher intensity (e.g., 1.0) = more valleys (weight 1s)
  const biased = Math.pow(n, intensity);

  // Linear mapping to weights 1-10
  return Math.floor(biased * 9) + 1;
}

// ============================================================================
// Terrain Generation
// ============================================================================

/**
 * Represents a terrain modification for animation
 */
interface TerrainNode {
  row: number;
  col: number;
  weight: number;
}

/**
 * Generates a terrain map using Perlin Noise
 *
 * @param grid - The current grid
 * @param startNode - The start node (kept at weight 1)
 * @param finishNode - The finish node (kept at weight 1)
 * @param config - Optional terrain configuration
 * @returns Array of terrain nodes in animation order
 *
 * Animation Order: Radial expansion from center for visual effect
 */
export function generateTerrainMap(
  grid: Grid,
  startNode: Node,
  finishNode: Node,
  config: Partial<TerrainConfig> = {}
): TerrainNode[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Seed noise with current time for variety
  seedNoise(Date.now() % 1000000);

  // Generate terrain data
  const terrainData: TerrainNode[] = [];

  // Calculate center for radial animation
  const centerRow = Math.floor(numRows / 2);
  const centerCol = Math.floor(numCols / 2);

  // Generate all terrain values
  const noiseGrid: number[][] = [];
  for (let row = 0; row < numRows; row++) {
    noiseGrid[row] = [];
    for (let col = 0; col < numCols; col++) {
      // Use fBm (fractal Brownian motion) for more natural terrain
      const noiseValue = fbm(
        col * cfg.frequency,
        row * cfg.frequency,
        cfg.octaves,
        cfg.persistence,
        cfg.lacunarity
      );
      noiseGrid[row][col] = noiseValue;
    }
  }

  // Collect all cells with their distance from center
  const cells: { row: number; col: number; distance: number }[] = [];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // Skip start and finish nodes
      if (
        (row === startNode.row && col === startNode.col) ||
        (row === finishNode.row && col === finishNode.col)
      ) {
        continue;
      }

      const distance = Math.sqrt(
        Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
      );

      cells.push({ row, col, distance });
    }
  }

  // Sort by distance for radial animation effect
  cells.sort((a, b) => a.distance - b.distance);

  // Create terrain nodes in animation order
  for (const cell of cells) {
    const weight = mapNoiseToWeight(
      noiseGrid[cell.row][cell.col],
      cfg.intensity
    );
    terrainData.push({
      row: cell.row,
      col: cell.col,
      weight,
    });
  }

  return terrainData;
}

/**
 * Applies terrain instantly to a grid (no animation)
 *
 * @param grid - The grid to modify
 * @param startNode - The start node
 * @param finishNode - The finish node
 * @param config - Optional terrain configuration
 * @returns New grid with terrain applied
 */
export function applyTerrainInstant(
  grid: Grid,
  startNode: Node,
  finishNode: Node,
  config: Partial<TerrainConfig> = {}
): Grid {
  const terrainNodes = generateTerrainMap(grid, startNode, finishNode, config);

  // Deep copy grid
  const newGrid: Grid = grid.map((row) => row.map((node) => ({ ...node })));

  // Apply terrain weights
  for (const terrain of terrainNodes) {
    newGrid[terrain.row][terrain.col].weight = terrain.weight;
    // Clear walls - terrain replaces walls
    newGrid[terrain.row][terrain.col].isWall = false;
  }

  // Ensure start and finish are weight 1
  newGrid[startNode.row][startNode.col].weight = 1;
  newGrid[finishNode.row][finishNode.col].weight = 1;

  return newGrid;
}

export type { TerrainNode, TerrainConfig };
