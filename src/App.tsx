import React from 'react';
import { GridProvider, useGridContext } from './context/GridContext';
import Board from './components/Board';
import { ControlPanel } from './components/Controls';
import { useVisualization } from './hooks/useVisualization';
import { MazeType } from './types';
import styles from './App.module.css';

/**
 * MainContent Component - Contains Board and ControlPanel in 2-column layout
 * Separated to use context hooks inside GridProvider
 */
const MainContent: React.FC = () => {
  const { 
    grid, 
    setGrid,
    setIsVisualizing,
    animationSpeed,
    clearAllWalls
  } = useGridContext();
  
  const { visualizeDijkstra, generateMaze, clearVisualization } = useVisualization();

  // Handler for visualize button
  const handleVisualize = (): void => {
    visualizeDijkstra(grid, setGrid, setIsVisualizing, animationSpeed);
  };

  // Handler for clear path button
  const handleClearPath = (): void => {
    clearVisualization(grid, setGrid);
  };

  // Handler for generate maze button
  // Strict sequence: 1. Clear path (same as Clear Path button), 2. Clear walls, 3. Generate maze
  const handleGenerateMaze = (mazeType: MazeType): void => {
    // Step 1: Clear any existing path/visited visualization 
    // This is the SAME as clicking "Clear Path" button
    handleClearPath();
    
    // Step 2: Clear all existing walls (React state)
    clearAllWalls();
    
    // Step 3: Generate the maze after React has re-rendered with cleared state
    // Use requestAnimationFrame to ensure DOM is updated, then setTimeout for safety
    requestAnimationFrame(() => {
      setTimeout(() => {
        generateMaze(mazeType, grid, setGrid, setIsVisualizing, Math.max(15, animationSpeed / 2));
      }, 50);
    });
  };

  return (
    <div className={styles.mainContent}>
      {/* Left Side - Board */}
      <main className={styles.boardContainer}>
        <Board />
      </main>

      {/* Right Side - Control Panel */}
      <ControlPanel
        onVisualize={handleVisualize}
        onClearPath={handleClearPath}
        onGenerateMaze={handleGenerateMaze}
      />
    </div>
  );
};

/**
 * Main Application Component
 * 
 * Wraps the entire app with GridProvider for global state management.
 * Uses a 2-column layout: Board (left) + ControlPanel (right).
 */
const App: React.FC = () => {
  return (
    <GridProvider>
      <div className={styles.app}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Maze & Pathfinding Visualizer</h1>
          <p className={styles.subtitle}>
            Visualize pathfinding algorithms on an interactive grid
          </p>
        </header>

        {/* Main Content: Board + ControlPanel */}
        <MainContent />

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            Built with React + TypeScript • Phase C: Maze Generation
          </p>
        </footer>
      </div>
    </GridProvider>
  );
};

export default App;
