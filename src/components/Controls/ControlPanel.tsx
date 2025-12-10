/**
 * ControlPanel Component
 * Phase B & C: Sidebar control panel for algorithm selection, visualization, and maze generation
 *
 * Positioned to the RIGHT of the Board in a 2-column layout.
 * Contains algorithm selection, maze generation, visualization controls, and grid settings.
 */

import React from 'react';
import { useGridContext } from '../../context/GridContext';
import { AlgorithmType, MazeType } from '../../types';
import styles from './ControlPanel.module.css';

/**
 * Props for the ControlPanel component
 */
interface ControlPanelProps {
  onVisualize: () => void;
  onClearPath: () => void;
  onGenerateMaze: (mazeType: MazeType) => void;
  onVisualizeRace: () => void;
}

/**
 * Algorithm options for the dropdown
 * All pathfinding algorithms implemented (Phase D complete)
 */
const ALGORITHM_OPTIONS: { value: AlgorithmType; label: string; disabled: boolean }[] = [
  { value: AlgorithmType.DIJKSTRA, label: "Dijkstra's Algorithm", disabled: false },
  { value: AlgorithmType.ASTAR, label: 'A* Search', disabled: false },
  { value: AlgorithmType.BFS, label: 'Breadth-First Search', disabled: false },
  { value: AlgorithmType.DFS, label: 'Depth-First Search', disabled: false },
];

/**
 * Maze generation options for the dropdown
 */
const MAZE_OPTIONS: { value: MazeType | 'none'; label: string; disabled: boolean }[] = [
  { value: 'none', label: 'No Maze', disabled: false },
  { value: MazeType.RECURSIVE_DIVISION, label: 'Recursive Division', disabled: false },
  { value: MazeType.RANDOMIZED_DFS, label: 'Randomized DFS', disabled: false },
];

/**
 * ControlPanel - Sidebar component for controlling the visualization
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ onVisualize, onClearPath, onGenerateMaze, onVisualizeRace }) => {
  const {
    selectedAlgorithm,
    setSelectedAlgorithm,
    selectedMaze,
    setSelectedMaze,
    isVisualizing,
    isRaceMode,
    setIsRaceMode,
    secondAlgorithm,
    setSecondAlgorithm,
    rowCount,
    colCount,
    resizeGrid,
    resetBoard,
    clearAllWalls,
    animationSpeed,
    setAnimationSpeed,
  } = useGridContext();

  // Handler for algorithm selection
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedAlgorithm(e.target.value as AlgorithmType);
  };

  // Handler for second algorithm selection (Race Mode)
  const handleSecondAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSecondAlgorithm(e.target.value as AlgorithmType);
  };

  // Handler for race mode toggle
  const handleRaceModeToggle = (): void => {
    if (isVisualizing) return;
    const newRaceMode = !isRaceMode;
    setIsRaceMode(newRaceMode);
    // Set default second algorithm if enabling race mode
    if (newRaceMode && !secondAlgorithm) {
      // Pick a different algorithm than the first one
      const defaultSecond = selectedAlgorithm === AlgorithmType.DIJKSTRA 
        ? AlgorithmType.ASTAR 
        : AlgorithmType.DIJKSTRA;
      setSecondAlgorithm(defaultSecond);
    }
  };

  // Handler for visualize button (supports both single and race mode)
  const handleVisualize = (): void => {
    if (isRaceMode && secondAlgorithm) {
      onVisualizeRace();
    } else {
      onVisualize();
    }
  };

  // Handler for maze selection
  const handleMazeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    setSelectedMaze(value === 'none' ? null : (value as MazeType));
  };

  // Handler for generate maze button
  const handleGenerateMaze = (): void => {
    if (selectedMaze) {
      onGenerateMaze(selectedMaze);
    }
  };

  // Handler for row slider
  const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newRows = parseInt(e.target.value, 10);
    resizeGrid(newRows, colCount);
  };

  // Handler for column slider
  const handleColChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newCols = parseInt(e.target.value, 10);
    resizeGrid(rowCount, newCols);
  };

  // Handler for speed slider
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSpeed = parseInt(e.target.value, 10);
    setAnimationSpeed(newSpeed);
  };

  // Calculate speed label (inverse - lower delay = faster)
  const getSpeedLabel = (): string => {
    if (animationSpeed <= 5) return 'Very Fast';
    if (animationSpeed <= 10) return 'Fast';
    if (animationSpeed <= 20) return 'Normal';
    if (animationSpeed <= 40) return 'Slow';
    return 'Very Slow';
  };

  return (
    <aside className={styles.panel}>
      {/* Header */}
      <h2 className={styles.header}>Controls</h2>

      {/* Algorithm Selection Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Algorithm</h3>
        <select
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
          disabled={isVisualizing}
          className={styles.select}
        >
          {ALGORITHM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Race Mode Toggle */}
        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>🏁 Race Mode</span>
          <div
            className={`${styles.toggle} ${isRaceMode ? styles.toggleActive : ''} ${isVisualizing ? styles.toggleDisabled : ''}`}
            onClick={handleRaceModeToggle}
            role="switch"
            aria-checked={isRaceMode}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleRaceModeToggle()}
          />
        </div>

        {/* Second Algorithm (shown when Race Mode is active) */}
        {isRaceMode && (
          <div className={styles.secondAlgorithmSection}>
            <div className={styles.secondAlgorithmLabel}>Agent 2</div>
            <select
              value={secondAlgorithm || ''}
              onChange={handleSecondAlgorithmChange}
              disabled={isVisualizing}
              className={styles.selectSecond}
            >
              {ALGORITHM_OPTIONS.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value} 
                  disabled={option.disabled || option.value === selectedAlgorithm}
                >
                  {option.label}{option.value === selectedAlgorithm ? ' (Agent 1)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Maze Generation Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Maze</h3>
        <select
          value={selectedMaze || 'none'}
          onChange={handleMazeChange}
          disabled={isVisualizing}
          className={styles.select}
        >
          {MAZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerateMaze}
          disabled={isVisualizing || !selectedMaze}
          className={`${styles.button} ${styles.buttonMaze}`}
        >
          Generate Maze
        </button>
      </section>

      {/* Visualization Actions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Actions</h3>
        <button
          onClick={handleVisualize}
          disabled={isVisualizing || (isRaceMode && !secondAlgorithm)}
          className={`${styles.button} ${isRaceMode ? styles.buttonRace : styles.buttonVisualize}`}
        >
          {isVisualizing ? 'Visualizing...' : isRaceMode ? '🏁 Race!' : 'Visualize!'}
        </button>
        <button
          onClick={onClearPath}
          disabled={isVisualizing}
          className={`${styles.button} ${styles.buttonClear}`}
        >
          Clear Path
        </button>
      </section>

      {/* Speed Control */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Speed</h3>
        <div className={styles.sliderGroup}>
          <input
            type="range"
            min="1"
            max="50"
            value={animationSpeed}
            onChange={handleSpeedChange}
            disabled={isVisualizing}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>{getSpeedLabel()}</span>
        </div>
      </section>

      {/* Grid Settings */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Grid Size</h3>
        <div className={styles.sliderGroup}>
          <label htmlFor="panel-rows">Rows: {rowCount}</label>
          <input
            id="panel-rows"
            type="range"
            min="5"
            max="40"
            value={rowCount}
            onChange={handleRowChange}
            disabled={isVisualizing}
            className={styles.slider}
          />
        </div>
        <div className={styles.sliderGroup}>
          <label htmlFor="panel-cols">Cols: {colCount}</label>
          <input
            id="panel-cols"
            type="range"
            min="5"
            max="60"
            value={colCount}
            onChange={handleColChange}
            disabled={isVisualizing}
            className={styles.slider}
          />
        </div>
      </section>

      {/* Board Actions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Board</h3>
        <button
          onClick={resetBoard}
          disabled={isVisualizing}
          className={`${styles.button} ${styles.buttonReset}`}
        >
          Reset Board
        </button>
        <button
          onClick={clearAllWalls}
          disabled={isVisualizing}
          className={`${styles.button} ${styles.buttonWalls}`}
        >
          Clear Walls
        </button>
      </section>

      {/* Instructions */}
      <section className={styles.instructions}>
        <h3 className={styles.sectionTitle}>Instructions</h3>
        <ul>
          <li>Click & drag to draw walls</li>
          <li>Ctrl + Click to erase walls</li>
          <li>Drag 🟢 Start or 🔴 Finish nodes</li>
        </ul>
      </section>
    </aside>
  );
};

export default ControlPanel;
