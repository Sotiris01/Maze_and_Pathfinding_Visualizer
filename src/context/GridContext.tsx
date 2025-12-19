import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  Grid,
  AlgorithmType,
  MazeType,
  RunRecord,
  DrawMode,
  GRID_ROWS,
  GRID_COLS,
} from "../types";
import {
  getInitialGrid,
  resetGridForPathfinding,
  clearWalls,
} from "../utils/gridUtils";
import { AlgorithmStats, RaceStats } from "../components/Modals/StatsModal";

const HISTORY_STORAGE_KEY = "pathfinder_run_history";
const MAX_HISTORY_ITEMS = 50;

/**
 * Available maze types for random selection
 */
const AVAILABLE_MAZE_TYPES: MazeType[] = [
  MazeType.RECURSIVE_DIVISION,
  MazeType.RANDOMIZED_DFS,
  MazeType.PRIMS,
  MazeType.SPIRAL,
];

/**
 * Get a random maze type from available options
 */
const getRandomMazeType = (): MazeType => {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_MAZE_TYPES.length);
  return AVAILABLE_MAZE_TYPES[randomIndex];
};

/**
 * Grid Context Type Definition
 */
interface GridContextType {
  // Grid State
  grid: Grid;
  setGrid: React.Dispatch<React.SetStateAction<Grid>>;

  // Grid Dimensions
  rowCount: number;
  colCount: number;
  resizeGrid: (newRows: number, newCols: number) => void;

  // Mouse State (for wall drawing)
  isMousePressed: boolean;
  setIsMousePressed: React.Dispatch<React.SetStateAction<boolean>>;

  // Draw Mode (Wall or Weight painting)
  drawMode: DrawMode;
  setDrawMode: React.Dispatch<React.SetStateAction<DrawMode>>;

  // Visualization State
  isVisualizing: boolean;
  setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>;

  // Algorithm Selection
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<AlgorithmType>>;

  // Race Mode State
  isRaceMode: boolean;
  setIsRaceMode: React.Dispatch<React.SetStateAction<boolean>>;
  secondAlgorithm: AlgorithmType | null;
  setSecondAlgorithm: React.Dispatch<
    React.SetStateAction<AlgorithmType | null>
  >;

  // Maze Selection
  selectedMaze: MazeType;
  setSelectedMaze: React.Dispatch<React.SetStateAction<MazeType>>;

  // Speed Control (delay in ms)
  animationSpeed: number;
  setAnimationSpeed: React.Dispatch<React.SetStateAction<number>>;

  // Visualization Stats (for Statistics Section)
  visualizationStats: AlgorithmStats | RaceStats | null;
  setVisualizationStats: React.Dispatch<
    React.SetStateAction<AlgorithmStats | RaceStats | null>
  >;

  // Toast Notification State
  toastMsg: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // Hidden Target Mode (Fog of War)
  isHiddenTargetMode: boolean;
  setIsHiddenTargetMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Run History
  runHistory: RunRecord[];
  addRunRecord: (record: Omit<RunRecord, "id" | "timestamp" | "date">) => void;
  clearRunHistory: () => void;
  deleteRunRecord: (id: string) => void;

  // Helper Functions
  resetBoard: () => void;
  clearPath: () => void;
  clearAllWalls: () => void;
}

/**
 * Default Context Value
 */
const defaultContextValue: GridContextType = {
  grid: [],
  setGrid: () => {},
  rowCount: GRID_ROWS,
  colCount: GRID_COLS,
  resizeGrid: () => {},
  isMousePressed: false,
  setIsMousePressed: () => {},
  drawMode: "WALL",
  setDrawMode: () => {},
  isVisualizing: false,
  setIsVisualizing: () => {},
  selectedAlgorithm: AlgorithmType.DIJKSTRA,
  setSelectedAlgorithm: () => {},
  isRaceMode: false,
  setIsRaceMode: () => {},
  secondAlgorithm: null,
  setSecondAlgorithm: () => {},
  selectedMaze: MazeType.RECURSIVE_DIVISION,
  setSelectedMaze: () => {},
  animationSpeed: 10,
  setAnimationSpeed: () => {},
  visualizationStats: null,
  setVisualizationStats: () => {},
  toastMsg: null,
  showToast: () => {},
  clearToast: () => {},
  isHiddenTargetMode: false,
  setIsHiddenTargetMode: () => {},
  runHistory: [],
  addRunRecord: () => {},
  clearRunHistory: () => {},
  deleteRunRecord: () => {},
  resetBoard: () => {},
  clearPath: () => {},
  clearAllWalls: () => {},
};

/**
 * Create the Context
 */
const GridContext = createContext<GridContextType>(defaultContextValue);

/**
 * Custom Hook to use Grid Context
 */
export const useGridContext = (): GridContextType => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error("useGridContext must be used within a GridProvider");
  }
  return context;
};

// Alias for shorter import in components
export const useGrid = useGridContext;

/**
 * Provider Props
 */
interface GridProviderProps {
  children: ReactNode;
}

/**
 * Grid Provider Component
 */
export const GridProvider: React.FC<GridProviderProps> = ({ children }) => {
  // Grid Dimension State
  const [rowCount, setRowCount] = useState<number>(GRID_ROWS);
  const [colCount, setColCount] = useState<number>(GRID_COLS);

  // Core Grid State
  const [grid, setGrid] = useState<Grid>(() =>
    getInitialGrid(GRID_ROWS, GRID_COLS)
  );

  // Mouse State for wall drawing
  const [isMousePressed, setIsMousePressed] = useState<boolean>(false);

  // Draw Mode State (Wall or Weight painting)
  const [drawMode, setDrawMode] = useState<DrawMode>("WALL");

  // Visualization State
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);

  // Algorithm Selection
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(
    AlgorithmType.DIJKSTRA
  );

  // Maze Selection - initialized with random maze type for first paint experience
  const [selectedMaze, setSelectedMaze] = useState<MazeType>(getRandomMazeType);

  // Race Mode State
  const [isRaceMode, setIsRaceMode] = useState<boolean>(false);
  const [secondAlgorithm, setSecondAlgorithm] = useState<AlgorithmType | null>(
    null
  );

  // Animation Speed (delay between node animations in ms)
  const [animationSpeed, setAnimationSpeed] = useState<number>(10);

  // Visualization Stats (displayed in Statistics Section)
  const [visualizationStats, setVisualizationStats] = useState<
    AlgorithmStats | RaceStats | null
  >(null);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hidden Target Mode State (Fog of War)
  const [isHiddenTargetMode, setIsHiddenTargetMode] = useState<boolean>(false);

  // Run History State with localStorage persistence
  const [runHistory, setRunHistory] = useState<RunRecord[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as RunRecord[];
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
    return [];
  });

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(runHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  }, [runHistory]);

  /**
   * Shows a toast notification message
   */
  const showToast = useCallback((msg: string): void => {
    setToastMsg(msg);
  }, []);

  /**
   * Clears the current toast notification
   */
  const clearToast = useCallback((): void => {
    setToastMsg(null);
  }, []);

  /**
   * Adds a new run record to history
   */
  const addRunRecord = useCallback(
    (record: Omit<RunRecord, "id" | "timestamp" | "date">): void => {
      const newRecord: RunRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };
      setRunHistory((prev) => {
        const updated = [newRecord, ...prev];
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    },
    []
  );

  /**
   * Clears all run history
   */
  const clearRunHistory = useCallback((): void => {
    setRunHistory([]);
  }, []);

  /**
   * Deletes a single run record by ID
   */
  const deleteRunRecord = useCallback((id: string): void => {
    setRunHistory((prev) => prev.filter((record) => record.id !== id));
  }, []);

  /**
   * Resets the entire board to initial state with current dimensions
   */
  const resetBoard = useCallback((): void => {
    if (isVisualizing) return; // Don't reset while visualizing
    setGrid(getInitialGrid(rowCount, colCount));
  }, [isVisualizing, rowCount, colCount]);

  /**
   * Resizes the grid to new dimensions
   * Generates a completely new grid (walls are cleared)
   */
  const resizeGrid = useCallback(
    (newRows: number, newCols: number): void => {
      if (isVisualizing) return; // Don't resize while visualizing

      // Clamp values to reasonable bounds
      const clampedRows = Math.max(5, Math.min(50, newRows));
      const clampedCols = Math.max(5, Math.min(80, newCols));

      setRowCount(clampedRows);
      setColCount(clampedCols);
      setGrid(getInitialGrid(clampedRows, clampedCols));
    },
    [isVisualizing]
  );

  /**
   * Clears only the path/visited nodes, keeps walls
   */
  const clearPath = useCallback((): void => {
    if (isVisualizing) return;
    setGrid((currentGrid) => resetGridForPathfinding(currentGrid));
  }, [isVisualizing]);

  /**
   * Clears all walls from the grid
   */
  const clearAllWalls = useCallback((): void => {
    if (isVisualizing) return;
    setGrid((currentGrid) => clearWalls(currentGrid));
  }, [isVisualizing]);

  const value: GridContextType = {
    grid,
    setGrid,
    rowCount,
    colCount,
    resizeGrid,
    isMousePressed,
    setIsMousePressed,
    drawMode,
    setDrawMode,
    isVisualizing,
    setIsVisualizing,
    selectedAlgorithm,
    setSelectedAlgorithm,
    isRaceMode,
    setIsRaceMode,
    secondAlgorithm,
    setSecondAlgorithm,
    selectedMaze,
    setSelectedMaze,
    animationSpeed,
    setAnimationSpeed,
    visualizationStats,
    setVisualizationStats,
    toastMsg,
    showToast,
    clearToast,
    isHiddenTargetMode,
    setIsHiddenTargetMode,
    runHistory,
    addRunRecord,
    clearRunHistory,
    deleteRunRecord,
    resetBoard,
    clearPath,
    clearAllWalls,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

export default GridContext;
