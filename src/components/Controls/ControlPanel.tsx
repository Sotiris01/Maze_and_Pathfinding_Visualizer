/**
 * ControlPanel Component
 * Professional sidebar with grouped accordion sections
 *
 * Redesigned with clean, minimalist UI featuring:
 * - Collapsible accordion sections
 * - Logical grouping of controls
 * - Prominent primary CTA
 * - Dark theme with subtle accents
 */

import React from "react";
import { useGridContext } from "../../context/GridContext";
import { AlgorithmType, MazeType } from "../../types";
import Accordion from "./Accordion";
import styles from "./ControlPanel.module.css";

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
 * Note: A* and Greedy Best-First use heuristics and should be disabled in Hidden Target Mode
 */
const ALGORITHM_OPTIONS: {
  value: AlgorithmType;
  label: string;
  usesHeuristic: boolean;
}[] = [
  {
    value: AlgorithmType.DIJKSTRA,
    label: "Dijkstra's Algorithm",
    usesHeuristic: false,
  },
  { value: AlgorithmType.ASTAR, label: "A* Search", usesHeuristic: true },
  {
    value: AlgorithmType.GREEDY_BEST_FIRST,
    label: "Greedy Best-First",
    usesHeuristic: true,
  },
  {
    value: AlgorithmType.BFS,
    label: "Breadth-First Search",
    usesHeuristic: false,
  },
  {
    value: AlgorithmType.DFS,
    label: "Depth-First Search",
    usesHeuristic: false,
  },
  {
    value: AlgorithmType.BIDIRECTIONAL_BFS,
    label: "Bidirectional Swarm",
    usesHeuristic: true, // Needs target location to search from both ends
  },
  {
    value: AlgorithmType.BIDIRECTIONAL_ASTAR,
    label: "Bidirectional A*",
    usesHeuristic: true,
  },
  {
    value: AlgorithmType.JUMP_POINT_SEARCH,
    label: "Jump Point Search",
    usesHeuristic: true, // Uses heuristic like A*
  },
];

/**
 * Maze generation options for the dropdown
 */
const MAZE_OPTIONS: { value: MazeType; label: string }[] = [
  { value: MazeType.RECURSIVE_DIVISION, label: "Recursive Division" },
  { value: MazeType.RANDOMIZED_DFS, label: "Randomized DFS" },
  { value: MazeType.PRIMS, label: "Prim's Algorithm" },
  { value: MazeType.SPIRAL, label: "Spiral Pattern" },
  { value: MazeType.CELLULAR_AUTOMATA, label: "Cellular Automata" },
];

/**
 * ControlPanel - Redesigned sidebar with accordion groups
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  onVisualize,
  onClearPath,
  onGenerateMaze,
  onVisualizeRace,
}) => {
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
    isHiddenTargetMode,
    setIsHiddenTargetMode,
  } = useGridContext();

  // === Handlers ===

  /**
   * Helper to check if an algorithm needs visible target
   * (heuristic-based or bidirectional algorithms that search from both ends)
   */
  const isHeuristicAlgorithm = (alg: AlgorithmType): boolean => {
    return (
      alg === AlgorithmType.ASTAR ||
      alg === AlgorithmType.GREEDY_BEST_FIRST ||
      alg === AlgorithmType.BIDIRECTIONAL_ASTAR ||
      alg === AlgorithmType.BIDIRECTIONAL_BFS ||
      alg === AlgorithmType.JUMP_POINT_SEARCH
    );
  };

  const handleAlgorithmChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newAlgorithm = e.target.value as AlgorithmType;
    setSelectedAlgorithm(newAlgorithm);

    // If hidden target mode is on and user selects a heuristic algorithm, switch to Dijkstra
    if (isHiddenTargetMode && isHeuristicAlgorithm(newAlgorithm)) {
      setSelectedAlgorithm(AlgorithmType.DIJKSTRA);
    }
  };

  const handleSecondAlgorithmChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newAlgorithm = e.target.value as AlgorithmType;
    setSecondAlgorithm(newAlgorithm);

    // If hidden target mode is on and user selects a heuristic algorithm, switch to BFS
    if (isHiddenTargetMode && isHeuristicAlgorithm(newAlgorithm)) {
      setSecondAlgorithm(AlgorithmType.BFS);
    }
  };

  const handleHiddenTargetToggle = (): void => {
    if (isVisualizing) return;
    const newMode = !isHiddenTargetMode;
    setIsHiddenTargetMode(newMode);

    // If enabling hidden target mode and a heuristic algorithm is selected, switch to blind search
    if (newMode) {
      if (isHeuristicAlgorithm(selectedAlgorithm)) {
        setSelectedAlgorithm(AlgorithmType.DIJKSTRA);
      }
      if (secondAlgorithm && isHeuristicAlgorithm(secondAlgorithm)) {
        setSecondAlgorithm(AlgorithmType.BFS);
      }
    }
  };

  const handleRaceModeToggle = (): void => {
    if (isVisualizing) return;
    const newRaceMode = !isRaceMode;
    setIsRaceMode(newRaceMode);
    if (newRaceMode && !secondAlgorithm) {
      const defaultSecond =
        selectedAlgorithm === AlgorithmType.DIJKSTRA
          ? AlgorithmType.ASTAR
          : AlgorithmType.DIJKSTRA;
      setSecondAlgorithm(defaultSecond);
    }
  };

  const handleVisualize = (): void => {
    if (isRaceMode && secondAlgorithm) {
      onVisualizeRace();
    } else {
      onVisualize();
    }
  };

  const handleMazeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as MazeType;
    setSelectedMaze(value);
  };

  const handleGenerateMaze = (): void => {
    onGenerateMaze(selectedMaze);
  };

  const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newRows = parseInt(e.target.value, 10);
    resizeGrid(newRows, colCount);
  };

  const handleColChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newCols = parseInt(e.target.value, 10);
    resizeGrid(rowCount, newCols);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSpeed = parseInt(e.target.value, 10);
    setAnimationSpeed(newSpeed);
  };

  const getSpeedLabel = (): string => {
    if (animationSpeed <= 5) return "Very Fast";
    if (animationSpeed <= 10) return "Fast";
    if (animationSpeed <= 20) return "Normal";
    if (animationSpeed <= 40) return "Slow";
    return "Very Slow";
  };

  return (
    <aside className={styles.panel}>
      {/* Panel Header */}
      <header className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Controls</h2>
        <p className={styles.panelSubtitle}>Configure & Visualize</p>
      </header>

      {/* Accordion Sections */}
      <div className={styles.accordionContainer}>
        {/* === Section 1: Pathfinding Algorithms === */}
        <Accordion title="Pathfinding Algorithms" icon="🤖" defaultOpen={true}>
          {/* Algorithm Selection */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Algorithm</label>
            <select
              value={selectedAlgorithm}
              onChange={handleAlgorithmChange}
              disabled={isVisualizing}
              className={styles.select}
              title="Select pathfinding algorithm"
            >
              {ALGORITHM_OPTIONS.map((option) => {
                // Disable heuristic algorithms in Hidden Target Mode (require known target)
                const isDisabled = isHiddenTargetMode && option.usesHeuristic;
                return (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={isDisabled}
                  >
                    {option.label}
                    {isDisabled ? " (Requires Visible Target)" : ""}
                  </option>
                );
              })}
            </select>
            {isHiddenTargetMode && (
              <p className={styles.hint}>
                💡 Heuristic algorithms disabled in Hidden Mode
              </p>
            )}
          </div>

          {/* Hidden Target Mode Toggle */}
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>🕵️ Hidden Target</span>
            <button
              type="button"
              className={`${styles.toggle} ${
                isHiddenTargetMode ? styles.toggleActive : ""
              }`}
              onClick={handleHiddenTargetToggle}
              disabled={isVisualizing}
              aria-pressed={isHiddenTargetMode}
              title="Hide target node (Fog of War mode)"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Race Mode Toggle */}
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>🏁 Race Mode</span>
            <button
              type="button"
              className={`${styles.toggle} ${
                isRaceMode ? styles.toggleActive : ""
              }`}
              onClick={handleRaceModeToggle}
              disabled={isVisualizing}
              aria-pressed={isRaceMode ? "true" : "false"}
              title="Toggle race mode to compare two algorithms"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Second Algorithm (Race Mode) */}
          {isRaceMode && (
            <div className={styles.controlGroup}>
              <label className={styles.labelSecondary}>Agent 2 Algorithm</label>
              <select
                value={secondAlgorithm || ""}
                onChange={handleSecondAlgorithmChange}
                disabled={isVisualizing}
                className={`${styles.select} ${styles.selectSecondary}`}
                title="Select second algorithm for race mode"
              >
                {ALGORITHM_OPTIONS.map((option) => {
                  const isSameAsAgent1 = option.value === selectedAlgorithm;
                  const isDisabledByHiddenMode =
                    isHiddenTargetMode && option.usesHeuristic;
                  const isDisabled = isSameAsAgent1 || isDisabledByHiddenMode;

                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                    >
                      {option.label}
                      {isSameAsAgent1 ? " (Agent 1)" : ""}
                      {isDisabledByHiddenMode
                        ? " (Requires Visible Target)"
                        : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Primary CTA - Visualize Button */}
          <button
            onClick={handleVisualize}
            disabled={isVisualizing || (isRaceMode && !secondAlgorithm)}
            className={`${styles.buttonPrimary} ${
              isRaceMode ? styles.buttonRace : ""
            }`}
          >
            {isVisualizing ? (
              <>
                <span className={styles.spinner} />
                Visualizing...
              </>
            ) : isRaceMode ? (
              "🏁 Start Race!"
            ) : (
              "▶ Visualize!"
            )}
          </button>
        </Accordion>

        {/* === Section 2: Maze Generation === */}
        <Accordion title="Maze Generation" icon="🧩">
          <div className={styles.controlGroup}>
            <label className={styles.label}>Maze Type</label>
            <select
              value={selectedMaze || "none"}
              onChange={handleMazeChange}
              disabled={isVisualizing}
              className={styles.select}
              title="Select maze generation algorithm"
            >
              {MAZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateMaze}
            disabled={isVisualizing || !selectedMaze}
            className={styles.buttonSecondary}
          >
            🔨 Generate Maze
          </button>

          <button
            onClick={clearAllWalls}
            disabled={isVisualizing}
            className={styles.buttonGhost}
          >
            ✕ Clear All Walls
          </button>
        </Accordion>

        {/* === Section 3: Grid Settings === */}
        <Accordion title="Grid Settings" icon="⚙️">
          {/* Speed Control */}
          <div className={styles.controlGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Animation Speed</label>
              <span className={styles.sliderValue}>{getSpeedLabel()}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={animationSpeed}
              onChange={handleSpeedChange}
              disabled={isVisualizing}
              className={styles.slider}
              title="Adjust animation speed"
            />
            <div className={styles.sliderLabels}>
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>

          {/* Row Count */}
          <div className={styles.controlGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Rows</label>
              <span className={styles.sliderValue}>{rowCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={rowCount}
              onChange={handleRowChange}
              disabled={isVisualizing}
              className={styles.slider}
              title="Adjust number of rows"
            />
          </div>

          {/* Column Count */}
          <div className={styles.controlGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Columns</label>
              <span className={styles.sliderValue}>{colCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={colCount}
              onChange={handleColChange}
              disabled={isVisualizing}
              className={styles.slider}
              title="Adjust number of columns"
            />
          </div>

          {/* Board Actions */}
          <div className={styles.buttonRow}>
            <button
              onClick={onClearPath}
              disabled={isVisualizing}
              className={styles.buttonGhost}
            >
              Clear Path
            </button>
            <button
              onClick={resetBoard}
              disabled={isVisualizing}
              className={styles.buttonGhost}
            >
              Reset Board
            </button>
          </div>
        </Accordion>
      </div>

      {/* Footer Instructions */}
      <footer className={styles.footer}>
        <div className={styles.instructionTitle}>Quick Tips</div>
        <ul className={styles.instructionList}>
          <li>
            <kbd>Click</kbd> + drag to draw walls
          </li>
          <li>
            <kbd>Ctrl</kbd> + click to erase
          </li>
          <li>
            Drag <span className={styles.nodeHint}>🟢</span> or{" "}
            <span className={styles.nodeHint}>🔴</span> to move
          </li>
        </ul>
      </footer>
    </aside>
  );
};

export default ControlPanel;
