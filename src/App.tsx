import React, { useRef, useCallback } from 'react';
import { GridProvider, useGridContext } from './context/GridContext';
import Board from './components/Board';
import { ControlPanel } from './components/Controls';
import { StatisticsSection } from './components/Statistics';
import { Legend } from './components/Legend';
import { useVisualization } from './hooks/useVisualization';
import { MazeType } from './types';
import styles from './App.module.css';

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
    setVisualizationStats
  } = useGridContext();
  
  const { visualizePathfinding, visualizeRace, generateMaze, clearVisualization } = useVisualization();
  
  // Ref for the stats section to enable programmatic scrolling
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to stats section
  const scrollToStats = useCallback(() => {
    statsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Stats callbacks for visualization hooks
  const statsCallbacks = {
    setVisualizationStats,
    scrollToStats,
  };

  // Handler for visualize button (single algorithm)
  const handleVisualize = (): void => {
    visualizePathfinding(selectedAlgorithm, grid, setGrid, setIsVisualizing, animationSpeed, statsCallbacks);
  };

  // Handler for race mode visualization (two algorithms)
  const handleVisualizeRace = (): void => {
    if (secondAlgorithm) {
      visualizeRace(selectedAlgorithm, secondAlgorithm, grid, setGrid, setIsVisualizing, animationSpeed, statsCallbacks);
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
        generateMaze(mazeType, grid, setGrid, setIsVisualizing, Math.max(15, animationSpeed / 2));
      }, 50);
    });
  };

  return (
    <div className={styles.snapContainer}>
      {/* Section 1: Visualizer */}
      <div className={`${styles.snapSection} ${styles.visualizerSection}`}>
        {/* Control Panel Sidebar - Fixed width, full height */}
        <aside className={styles.controlPanelSidebar}>
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
        <StatisticsSection 
          stats={visualizationStats} 
          isRaceMode={isRaceMode} 
        />
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
    </GridProvider>
  );
};

export default App;
