import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Grid, AlgorithmType, MazeType, GRID_ROWS, GRID_COLS } from "../types";
import {
  getInitialGrid,
  resetGridForPathfinding,
  clearWalls,
} from "../utils/gridUtils";
import { AlgorithmStats, RaceStats } from "../components/Modals/StatsModal";

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
  selectedMaze: MazeType | null;
  setSelectedMaze: React.Dispatch<React.SetStateAction<MazeType | null>>;

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
  isVisualizing: false,
  setIsVisualizing: () => {},
  selectedAlgorithm: AlgorithmType.DIJKSTRA,
  setSelectedAlgorithm: () => {},
  isRaceMode: false,
  setIsRaceMode: () => {},
  secondAlgorithm: null,
  setSecondAlgorithm: () => {},
  selectedMaze: null,
  setSelectedMaze: () => {},
  animationSpeed: 10,
  setAnimationSpeed: () => {},
  visualizationStats: null,
  setVisualizationStats: () => {},
  toastMsg: null,
  showToast: () => {},
  clearToast: () => {},
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

  // Visualization State
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);

  // Algorithm Selection
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(
    AlgorithmType.DIJKSTRA
  );

  // Maze Selection
  const [selectedMaze, setSelectedMaze] = useState<MazeType | null>(null);

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
    resetBoard,
    clearPath,
    clearAllWalls,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

export default GridContext;
