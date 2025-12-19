/**
 * Perlin Noise Implementation
 * Phase G: Weighted Terrain Generation
 *
 * A pure TypeScript implementation of 2D Perlin Noise for terrain generation.
 * No external dependencies - implements the algorithm directly.
 *
 * Based on Ken Perlin's improved noise algorithm (2002).
 *
 * Usage:
 *   const value = noise(x, y);  // Returns 0.0 to 1.0
 */

// ============================================================================
// Permutation Table
// ============================================================================

/**
 * Standard permutation table used in Perlin noise.
 * This is a shuffled array of 0-255, doubled for wrapping.
 */
const PERMUTATION: number[] = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

// Double the permutation table to avoid overflow
const p: number[] = [...PERMUTATION, ...PERMUTATION];

// ============================================================================
// Gradient Vectors
// ============================================================================

/**
 * 2D gradient vectors for Perlin noise.
 * These are unit vectors pointing in 8 directions.
 */
const GRADIENTS_2D: [number, number][] = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fade function (6t^5 - 15t^4 + 10t^3)
 * Provides smooth interpolation curve.
 * This is Ken Perlin's improved smoothstep function.
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation between a and b
 */
function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

/**
 * Calculate dot product of gradient vector and distance vector
 */
function grad(hash: number, x: number, y: number): number {
  const gradient = GRADIENTS_2D[hash & 7];
  return gradient[0] * x + gradient[1] * y;
}

// ============================================================================
// Main Noise Function
// ============================================================================

/**
 * 2D Perlin Noise function
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value between 0 and 1 (normalized from -1 to 1)
 *
 * Algorithm:
 * 1. Find unit grid cell containing point
 * 2. Get relative coordinates within cell (0-1)
 * 3. Compute fade curves for interpolation
 * 4. Hash grid corners to get gradient indices
 * 5. Calculate dot products of gradients and distance vectors
 * 6. Interpolate between corner values
 * 7. Normalize to 0-1 range
 */
export function noise(x: number, y: number): number {
  // Find unit grid cell containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  // Get relative x, y coordinates within cell
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  // Compute fade curves for each coordinate
  const u = fade(xf);
  const v = fade(yf);

  // Hash coordinates of the 4 corners
  const aa = p[p[X] + Y];
  const ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y];
  const bb = p[p[X + 1] + Y + 1];

  // Calculate gradient dot products for each corner
  const gradAA = grad(aa, xf, yf);
  const gradBA = grad(ba, xf - 1, yf);
  const gradAB = grad(ab, xf, yf - 1);
  const gradBB = grad(bb, xf - 1, yf - 1);

  // Interpolate along x
  const x1 = lerp(u, gradAA, gradBA);
  const x2 = lerp(u, gradAB, gradBB);

  // Interpolate along y
  const result = lerp(v, x1, x2);

  // Normalize from [-1, 1] to [0, 1]
  return (result + 1) / 2;
}

/**
 * Fractal Brownian Motion (fBm) - Multi-octave noise
 *
 * Combines multiple layers of noise at different frequencies
 * to create more natural-looking terrain.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param octaves - Number of noise layers (default: 4)
 * @param persistence - Amplitude multiplier per octave (default: 0.5)
 * @param lacunarity - Frequency multiplier per octave (default: 2.0)
 * @returns Noise value between 0 and 1
 */
export function fbm(
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  // Normalize to [0, 1]
  return total / maxValue;
}

/**
 * Seeded random shuffle for reproducible results
 * Can be used to reseed the permutation table
 */
export function seedNoise(seed: number): void {
  // Simple LCG random number generator
  let s = seed;
  const random = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  // Fisher-Yates shuffle
  const perm = [...PERMUTATION];
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }

  // Update permutation table
  for (let i = 0; i < 256; i++) {
    p[i] = perm[i];
    p[i + 256] = perm[i];
  }
}
