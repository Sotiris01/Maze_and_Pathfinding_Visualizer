/**
 * Node Interface - Core data model for each cell in the grid
 * As specified in Section 3.1 of the project requirements
 */
export interface Node {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  distance: number; // For Dijkstra/A* - initialized to Infinity
  previousNode: Node | null; // For backtracking the shortest path
}

/**
 * Grid Type - 2D array of Nodes
 */
export type Grid = Node[][];

/**
 * Algorithm Types
 */
export enum AlgorithmType {
  DIJKSTRA = "dijkstra",
  ASTAR = "astar",
  BFS = "bfs",
  DFS = "dfs",
  GREEDY_BEST_FIRST = "greedyBestFirst",
  BIDIRECTIONAL_BFS = "bidirectionalBFS",
  BIDIRECTIONAL_ASTAR = "bidirectionalAStar",
  JUMP_POINT_SEARCH = "jumpPointSearch",
}

/**
 * Maze Generation Types
 */
export enum MazeType {
  RECURSIVE_DIVISION = "recursiveDivision",
  RANDOMIZED_DFS = "randomizedDFS",
  PRIMS = "prims",
  SPIRAL = "spiral",
  CELLULAR_AUTOMATA = "cellularAutomata",
}

/**
 * Node State for styling purposes
 */
export enum NodeState {
  UNVISITED = "unvisited",
  VISITED = "visited",
  WALL = "wall",
  START = "start",
  FINISH = "finish",
  PATH = "path",
}

/**
 * Algorithm Result - returned after algorithm execution
 */
export interface AlgorithmResult {
  visitedNodesInOrder: Node[];
  shortestPath: Node[];
  executionTimeMs: number;
  visitedCount: number;
  pathLength: number;
}

/**
 * Run Record - stored in localStorage for history tracking
 */
export interface RunRecord {
  id: string; // UUID
  timestamp: number; // Unix timestamp for sorting
  date: string; // ISO format for display
  mode: "Single" | "Race";
  algorithm1: string; // Display name of algorithm 1
  algorithm2?: string; // Display name of algorithm 2 (Race mode only)
  gridSize: string; // e.g., "20x30"
  // Algorithm 1 stats
  time1: number; // Execution time in ms
  pathLength1: number;
  visitedCount1: number;
  // Algorithm 2 stats (Race mode only)
  time2?: number;
  pathLength2?: number;
  visitedCount2?: number;
  // Race mode result
  winner?: string; // "Algorithm 1 Name" | "Algorithm 2 Name" | "Tie" | "Both Failed"
}

/**
 * Grid Configuration Constants
 */
export const GRID_ROWS = 20;
export const GRID_COLS = 30;
// Default Start: Top-left corner (1,1) for nice padding from edge
export const DEFAULT_START_ROW = 1;
export const DEFAULT_START_COL = 1;
// Default Finish: Center of the grid (calculated dynamically)
export const DEFAULT_FINISH_ROW = Math.floor(GRID_ROWS / 2);
export const DEFAULT_FINISH_COL = Math.floor(GRID_COLS / 2);
