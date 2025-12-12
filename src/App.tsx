import React, {
  useRef,
  useCallback,
  useState,
  lazy,
  Suspense,
  useEffect,
} from "react";
import { GridProvider, useGridContext } from "./context/GridContext";
import Board from "./components/Board";
import { ControlPanel } from "./components/Controls";
import { Legend } from "./components/Legend";
import Toast from "./components/UI/Toast";
import { useVisualization } from "./hooks/useVisualization";
import { MazeType } from "./types";
import styles from "./App.module.css";

// Lazy load the Statistics section to reduce initial bundle size
// This component is below the fold and not needed for initial render
const StatisticsSection = lazy(
  () => import("./components/Statistics/StatisticsSection")
);

/**
 * MainContent Component - Two-Page Scroll Layout
 * Section 1: Visualizer (Board + Controls)
 * Section 2: Statistics Dashboard
 */
const MainContent: React.FC = () => {
  const {
    grid,
    setGrid,
    setIsVisualizing,
    animationSpeed,
    selectedAlgorithm,
    secondAlgorithm,
    isRaceMode,
    clearAllWalls,
    visualizationStats,
    setVisualizationStats,
    showToast,
    selectedMaze,
  } = useGridContext();

  const {
    visualizePathfinding,
    visualizeRace,
    generateMaze,
    clearVisualization,
  } = useVisualization();

  // Ref for the stats section to enable programmatic scrolling
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Track if initial maze has been generated
  const [hasGeneratedInitialMaze, setHasGeneratedInitialMaze] = useState(false);

  // Auto-generate maze on mount for better first paint experience
  useEffect(() => {
    if (hasGeneratedInitialMaze) return;

    // Small delay to ensure DOM is fully ready and grid is mounted
    const timer = setTimeout(() => {
      generateMaze(
        selectedMaze,
        grid,
        setGrid,
        setIsVisualizing,
        Math.max(15, animationSpeed / 2)
      );
      setHasGeneratedInitialMaze(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [hasGeneratedInitialMaze]); // Only depend on the flag to run once

  // Toggle mobile sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Close sidebar (for overlay click)
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Scroll to stats section
  const scrollToStats = useCallback(() => {
    statsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Stats callbacks for visualization hooks
  const statsCallbacks = {
    setVisualizationStats,
    scrollToStats,
    showToast,
  };

  // Handler for visualize button (single algorithm)
  const handleVisualize = (): void => {
    visualizePathfinding(
      selectedAlgorithm,
      grid,
      setGrid,
      setIsVisualizing,
      animationSpeed,
      statsCallbacks
    );
  };

  // Handler for race mode visualization (two algorithms)
  const handleVisualizeRace = (): void => {
    if (secondAlgorithm) {
      visualizeRace(
        selectedAlgorithm,
        secondAlgorithm,
        grid,
        setGrid,
        setIsVisualizing,
        animationSpeed,
        statsCallbacks
      );
    }
  };

  // Handler for clear path button
  const handleClearPath = (): void => {
    clearVisualization(grid, setGrid);
  };

  // Handler for generate maze button
  const handleGenerateMaze = (mazeType: MazeType): void => {
    handleClearPath();
    clearAllWalls();

    requestAnimationFrame(() => {
      setTimeout(() => {
        generateMaze(
          mazeType,
          grid,
          setGrid,
          setIsVisualizing,
          Math.max(15, animationSpeed / 2)
        );
      }, 50);
    });
  };

  return (
    <div className={styles.snapContainer}>
      {/* Section 1: Visualizer */}
      <div className={`${styles.snapSection} ${styles.visualizerSection}`}>
        {/* Mobile Menu Toggle Button */}
        <button
          className={styles.mobileMenuToggle}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isSidebarOpen}
        >
          <span className={styles.hamburgerIcon}>
            {isSidebarOpen ? "✕" : "☰"}
          </span>
        </button>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Control Panel Sidebar - Fixed width, full height */}
        <aside
          className={`${styles.controlPanelSidebar} ${
            isSidebarOpen ? styles.sidebarOpen : ""
          }`}
        >
          <ControlPanel
            onVisualize={handleVisualize}
            onClearPath={handleClearPath}
            onGenerateMaze={handleGenerateMaze}
            onVisualizeRace={handleVisualizeRace}
          />
        </aside>

        {/* Game Area - Takes remaining space */}
        <div className={styles.gameArea}>
          {/* Header - Fixed height */}
          <header className={styles.header}>
            <h1 className={styles.title}>Maze & Pathfinding Visualizer</h1>
            <p className={styles.subtitle}>
              Visualize pathfinding algorithms on an interactive grid
            </p>
          </header>

          {/* Board Container - Takes all remaining vertical space */}
          <div className={styles.boardContainer}>
            <Board />
          </div>

          {/* Legend - Fixed height */}
          <div className={styles.legendArea}>
            <Legend orientation="horizontal" compact />
          </div>

          {/* Scroll Indicator - Fixed height */}
          <footer className={styles.footer}>
            <div className={styles.scrollIndicator} onClick={scrollToStats}>
              <span>View Statistics</span>
              <span>↓</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Section 2: Statistics */}
      <div className={styles.snapSection} ref={statsSectionRef}>
        <Suspense
          fallback={
            <div className={styles.statsLoading}>Loading Statistics...</div>
          }
        >
          <StatisticsSection
            stats={visualizationStats}
            isRaceMode={isRaceMode}
          />
        </Suspense>
      </div>
    </div>
  );
};

/**
 * Main Application Component
 * Wraps the entire app with GridProvider for global state management.
 */
const App: React.FC = () => {
  return (
    <GridProvider>
      <MainContent />
      <Toast />
    </GridProvider>
  );
};

export default App;
