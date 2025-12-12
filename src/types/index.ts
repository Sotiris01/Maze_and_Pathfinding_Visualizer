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
