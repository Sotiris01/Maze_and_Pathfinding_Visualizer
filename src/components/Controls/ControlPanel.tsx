/**
 * ControlPanel Component
 * Professional sidebar with grouped accordion sections
 *
 * UX-Focused Redesign featuring:
 * - Clear visual hierarchy with prominent Primary CTA
 * - Algorithms grouped by category (Weighted/Unweighted, Standard/Advanced)
 * - Descriptive labels with algorithm characteristics
 * - Mobile auto-close on action for better UX
 * - Increased whitespace and polish
 */

import React, { useEffect, useState } from "react";
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
  onGenerateMaze: (
    mazeType: MazeType,
    terrainConfig?: { frequency: number; intensity?: number }
  ) => void;
  onVisualizeRace: () => void;
  /** Callback to close sidebar on mobile after action */
  onMobileAction?: () => void;
}

// ============================================================================
// Algorithm Configuration - Organized by Category
// ============================================================================

interface AlgorithmOption {
  value: AlgorithmType;
  label: string;
  shortLabel: string;
  usesHeuristic: boolean;
  guaranteesShortestPath: boolean;
  category: "weighted" | "unweighted" | "bidirectional";
  /** Whether this algorithm correctly handles weighted terrain */
  supportsWeights: boolean;
}

/**
 * Algorithms grouped logically:
 * - WEIGHTED: Consider edge weights (Dijkstra, A*, Bidirectional A*)
 * - UNWEIGHTED: Treat all edges equally (BFS, DFS, Greedy, JPS, Bidirectional BFS)
 * - BIDIRECTIONAL: Search from both ends
 */
const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  // === Weighted / Optimal Algorithms ===
  {
    value: AlgorithmType.DIJKSTRA,
    label: "Dijkstra — Guarantees Shortest Path",
    shortLabel: "Dijkstra",
    usesHeuristic: false,
    guaranteesShortestPath: true,
    category: "weighted",
    supportsWeights: true,
  },
  {
    value: AlgorithmType.ASTAR,
    label: "A* Search — Fast & Optimal",
    shortLabel: "A*",
    usesHeuristic: true,
    guaranteesShortestPath: true,
    category: "weighted",
    supportsWeights: true,
  },
  {
    value: AlgorithmType.JUMP_POINT_SEARCH,
    label: "Jump Point Search — Optimized A*",
    shortLabel: "JPS",
    usesHeuristic: true,
    guaranteesShortestPath: true,
    category: "weighted",
    supportsWeights: false, // JPS assumes uniform cost grid
  },

  // === Unweighted / Exploration Algorithms ===
  {
    value: AlgorithmType.BFS,
    label: "BFS — Shortest Path (Unweighted)",
    shortLabel: "BFS",
    usesHeuristic: false,
    guaranteesShortestPath: true,
    category: "unweighted",
    supportsWeights: false,
  },
  {
    value: AlgorithmType.DFS,
    label: "DFS — Explores Deeply (Not Shortest)",
    shortLabel: "DFS",
    usesHeuristic: false,
    guaranteesShortestPath: false,
    category: "unweighted",
    supportsWeights: false,
  },
  {
    value: AlgorithmType.GREEDY_BEST_FIRST,
    label: "Greedy Best-First — Fast but Suboptimal",
    shortLabel: "Greedy",
    usesHeuristic: true,
    guaranteesShortestPath: false,
    category: "unweighted",
    supportsWeights: false,
  },

  // === Bidirectional / Advanced Algorithms ===
  {
    value: AlgorithmType.BIDIRECTIONAL_BFS,
    label: "Bidirectional BFS — Searches Both Ends",
    shortLabel: "Bi-BFS",
    usesHeuristic: true, // Needs target location
    guaranteesShortestPath: true,
    category: "bidirectional",
    supportsWeights: false,
  },
  {
    value: AlgorithmType.BIDIRECTIONAL_ASTAR,
    label: "Bidirectional A* — Advanced Optimal",
    shortLabel: "Bi-A*",
    usesHeuristic: true,
    guaranteesShortestPath: true,
    category: "bidirectional",
    supportsWeights: true,
  },
];

// ============================================================================
// Maze Configuration
// ============================================================================

interface MazeOption {
  value: MazeType;
  label: string;
  description: string;
}

/**
 * Maze generation options with descriptions
 */
const MAZE_OPTIONS: MazeOption[] = [
  {
    value: MazeType.RECURSIVE_DIVISION,
    label: "Recursive Division",
    description: "Creates rooms with passages",
  },
  {
    value: MazeType.RANDOMIZED_DFS,
    label: "Randomized DFS",
    description: "Long, winding corridors",
  },
  {
    value: MazeType.PRIMS,
    label: "Prim's Algorithm",
    description: "Organic, branching paths",
  },
  {
    value: MazeType.CELLULAR_AUTOMATA,
    label: "Cellular Automata",
    description: "Cave-like structures",
  },
  {
    value: MazeType.SPIRAL,
    label: "Spiral Pattern",
    description: "Spiraling maze pattern",
  },
];

// ============================================================================
// Terrain Smoothness Configuration
// ============================================================================

/**
 * Terrain smoothness presets
 * Lower frequency = smoother, larger terrain features
 * Higher frequency = rougher, more detailed terrain
 */
type TerrainSmoothness = "smooth" | "medium" | "rough" | "jagged";

interface TerrainSmoothnessOption {
  value: TerrainSmoothness;
  label: string;
  description: string;
  frequency: number;
}

const TERRAIN_SMOOTHNESS_OPTIONS: TerrainSmoothnessOption[] = [
  {
    value: "smooth",
    label: "Smooth",
    description: "Large, rolling hills",
    frequency: 0.06,
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced terrain",
    frequency: 0.12,
  },
  {
    value: "rough",
    label: "Rough",
    description: "Detailed landscape",
    frequency: 0.2,
  },
  {
    value: "jagged",
    label: "Jagged",
    description: "Extreme variation",
    frequency: 0.35,
  },
];

// ============================================================================
// Mobile Detection Hook
// ============================================================================

const MOBILE_BREAKPOINT = 900;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// ============================================================================
// ControlPanel Component
// ============================================================================

/**
 * ControlPanel - UX-focused sidebar with clear hierarchy
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  onVisualize,
  onClearPath,
  onGenerateMaze,
  onVisualizeRace,
  onMobileAction,
}) => {
  const isMobile = useIsMobile();
  const {
    setGrid,
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
    drawMode,
    setDrawMode,
  } = useGridContext();

  // === Local State ===
  const [terrainSmoothness, setTerrainSmoothness] =
    useState<TerrainSmoothness>("medium");
  const [terrainIntensity, setTerrainIntensity] = useState<number>(0.7);

  // Track which generation section is open (mutually exclusive)
  // "maze" = Maze Generator open, "terrain" = Terrain Generation open
  const [activeGenSection, setActiveGenSection] = useState<"maze" | "terrain">(
    "maze"
  );

  // === Effects ===

  /**
   * Sync Weight Mode with active section:
   * - Terrain section open → Weight Mode ON
   * - Maze section open → Weight Mode OFF (and convert weights)
   */
  useEffect(() => {
    if (activeGenSection === "terrain" && drawMode !== "WEIGHT") {
      // Switching to Weight Mode - auto-switch algorithms if needed
      if (!algorithmSupportsWeights(selectedAlgorithm)) {
        setSelectedAlgorithm(AlgorithmType.DIJKSTRA);
      }
      if (secondAlgorithm && !algorithmSupportsWeights(secondAlgorithm)) {
        setSecondAlgorithm(AlgorithmType.ASTAR);
      }
      setDrawMode("WEIGHT");
    } else if (activeGenSection === "maze" && drawMode !== "WALL") {
      // Switching to Wall Mode - convert weighted tiles
      setGrid((currentGrid) => {
        return currentGrid.map((row) =>
          row.map((node) => {
            // Skip start, finish, and already-wall nodes
            if (node.isStart || node.isFinish || node.isWall) {
              return node;
            }
            // Weight > 5: convert to wall
            if (node.weight > 5) {
              return { ...node, isWall: true, weight: 1 };
            }
            // Weight > 1: convert to normal tile (weight 1)
            if (node.weight > 1) {
              return { ...node, weight: 1 };
            }
            return node;
          })
        );
      });
      setDrawMode("WALL");
    }
  }, [activeGenSection]); // Only run when section changes

  // === Handlers ===

  /**
   * Helper to check if an algorithm needs visible target
   */
  const isHeuristicAlgorithm = (alg: AlgorithmType): boolean => {
    const option = ALGORITHM_OPTIONS.find((o) => o.value === alg);
    return option?.usesHeuristic ?? false;
  };

  /**
   * Helper to check if an algorithm supports weighted terrain
   */
  const algorithmSupportsWeights = (alg: AlgorithmType): boolean => {
    const option = ALGORITHM_OPTIONS.find((o) => o.value === alg);
    return option?.supportsWeights ?? false;
  };

  /**
   * Check if an algorithm is disabled due to current mode/terrain
   */
  const isAlgorithmDisabled = (alg: AlgorithmType): boolean => {
    // Disabled if hidden target mode + uses heuristic
    if (isHiddenTargetMode && isHeuristicAlgorithm(alg)) {
      return true;
    }
    // Disabled if weight mode ON + doesn't support weights
    if (drawMode === "WEIGHT" && !algorithmSupportsWeights(alg)) {
      return true;
    }
    return false;
  };

  const handleAlgorithmChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newAlgorithm = e.target.value as AlgorithmType;

    // If hidden target mode is on and user selects a heuristic algorithm, switch to Dijkstra
    if (isHiddenTargetMode && isHeuristicAlgorithm(newAlgorithm)) {
      setSelectedAlgorithm(AlgorithmType.DIJKSTRA);
      return;
    }

    // If weight mode ON and algorithm doesn't support weights, switch to Dijkstra
    if (drawMode === "WEIGHT" && !algorithmSupportsWeights(newAlgorithm)) {
      setSelectedAlgorithm(AlgorithmType.DIJKSTRA);
      return;
    }

    setSelectedAlgorithm(newAlgorithm);
  };

  const handleSecondAlgorithmChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newAlgorithm = e.target.value as AlgorithmType;

    // If hidden target mode is on and user selects a heuristic algorithm, switch to BFS
    if (isHiddenTargetMode && isHeuristicAlgorithm(newAlgorithm)) {
      setSecondAlgorithm(AlgorithmType.BFS);
      return;
    }

    // If weight mode ON and algorithm doesn't support weights, switch to Dijkstra
    if (drawMode === "WEIGHT" && !algorithmSupportsWeights(newAlgorithm)) {
      setSecondAlgorithm(AlgorithmType.DIJKSTRA);
      return;
    }

    setSecondAlgorithm(newAlgorithm);
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
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
  };

  const handleMazeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedMaze(e.target.value as MazeType);
  };

  const handleTerrainSmoothnessChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setTerrainSmoothness(e.target.value as TerrainSmoothness);
  };

  const handleGenerateMaze = (): void => {
    onGenerateMaze(selectedMaze);
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
  };

  const handleClearPath = (): void => {
    onClearPath();
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
  };

  const handleResetBoard = (): void => {
    resetBoard();
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
  };

  const handleClearBoard = (): void => {
    // Clear both walls and weights
    clearAllWalls();
    setGrid((currentGrid) =>
      currentGrid.map((row) =>
        row.map((node) => ({
          ...node,
          weight: 1,
        }))
      )
    );
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
  };

  const handleGenerateTerrain = (): void => {
    const smoothnessOption = TERRAIN_SMOOTHNESS_OPTIONS.find(
      (o) => o.value === terrainSmoothness
    );
    onGenerateMaze(MazeType.TERRAIN_MAP, {
      frequency: smoothnessOption?.frequency ?? 0.12,
      intensity: terrainIntensity,
    });
    // Auto-close on mobile
    if (isMobile && onMobileAction) {
      setTimeout(() => onMobileAction(), 150);
    }
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

  // Get selected algorithm details for display
  const selectedAlgoOption = ALGORITHM_OPTIONS.find(
    (o) => o.value === selectedAlgorithm
  );

  // Group algorithms by category for organized display
  const weightedAlgos = ALGORITHM_OPTIONS.filter(
    (o) => o.category === "weighted"
  );
  const unweightedAlgos = ALGORITHM_OPTIONS.filter(
    (o) => o.category === "unweighted"
  );
  const bidirectionalAlgos = ALGORITHM_OPTIONS.filter(
    (o) => o.category === "bidirectional"
  );

  return (
    <aside className={styles.panel}>
      {/* Panel Header */}
      <header className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Controls</h2>
        <p className={styles.panelSubtitle}>Configure & Visualize</p>
      </header>

      {/* ================================================================
          PRIMARY ACTION SECTION - Most Prominent
          ================================================================ */}
      <div className={styles.primarySection}>
        {/* Main CTA - Always Visible at Top */}
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
            "▶ Visualize Path"
          )}
        </button>

        {/* Quick Action Buttons */}
        <div className={styles.quickActions}>
          <button
            onClick={handleClearPath}
            disabled={isVisualizing}
            className={styles.buttonQuick}
            title="Clear visualized path"
          >
            🔄 Clear Path
          </button>
          <button
            onClick={handleResetBoard}
            disabled={isVisualizing}
            className={styles.buttonQuick}
            title="Reset entire board"
          >
            🗑️ Reset
          </button>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className={styles.accordionContainer}>
        {/* === Section 1: Algorithm Selection === */}
        <Accordion title="Algorithm" icon="🤖" defaultOpen={true}>
          {/* Current Selection Display */}
          {selectedAlgoOption && (
            <div className={styles.currentSelection}>
              <span className={styles.currentLabel}>Selected:</span>
              <span className={styles.currentValue}>
                {selectedAlgoOption.shortLabel}
              </span>
              {selectedAlgoOption.guaranteesShortestPath ? (
                <span className={styles.badgeOptimal}>✓ Optimal</span>
              ) : (
                <span className={styles.badgeSuboptimal}>Not Shortest</span>
              )}
            </div>
          )}

          {/* Algorithm Selection with Categories */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Choose Algorithm</label>
            <select
              value={selectedAlgorithm}
              onChange={handleAlgorithmChange}
              disabled={isVisualizing}
              className={styles.select}
              title="Select pathfinding algorithm"
            >
              {/* Weighted / Optimal Group */}
              <optgroup label="⭐ Optimal Algorithms">
                {weightedAlgos.map((option) => {
                  const isDisabled = isAlgorithmDisabled(option.value);
                  const disabledReason =
                    isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden Mode)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                    >
                      {option.label}
                      {disabledReason}
                    </option>
                  );
                })}
              </optgroup>

              {/* Unweighted / Exploration Group */}
              <optgroup label="🔍 Exploration Algorithms">
                {unweightedAlgos.map((option) => {
                  const isDisabled = isAlgorithmDisabled(option.value);
                  const disabledReason =
                    isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden Mode)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                    >
                      {option.label}
                      {disabledReason}
                    </option>
                  );
                })}
              </optgroup>

              {/* Bidirectional / Advanced Group */}
              <optgroup label="🚀 Advanced (Bidirectional)">
                {bidirectionalAlgos.map((option) => {
                  const isDisabled = isAlgorithmDisabled(option.value);
                  const disabledReason =
                    isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden Mode)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                    >
                      {option.label}
                      {disabledReason}
                    </option>
                  );
                })}
              </optgroup>
            </select>
            {isHiddenTargetMode && (
              <p className={styles.hint}>
                ⚠️ Heuristic algorithms disabled in Hidden Mode
              </p>
            )}
            {drawMode === "WEIGHT" && (
              <p className={styles.hint}>
                ⚖️ Unweighted algorithms disabled due to terrain
              </p>
            )}
          </div>

          {/* Mode Toggles - Visually Separated */}
          <div className={styles.modeSection}>
            <div className={styles.modeSectionTitle}>Game Modes</div>

            {/* Hidden Target Mode Toggle */}
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>🕵️ Hidden Target</span>
                <span className={styles.toggleDesc}>Fog of War mode</span>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${
                  isHiddenTargetMode ? styles.toggleActive : ""
                }`}
                onClick={handleHiddenTargetToggle}
                disabled={isVisualizing}
                aria-pressed={isHiddenTargetMode ? "true" : "false"}
                title="Hide target node (Fog of War mode)"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            {/* Race Mode Toggle */}
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>🏁 Race Mode</span>
                <span className={styles.toggleDesc}>Compare algorithms</span>
              </div>
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
          </div>

          {/* Second Algorithm (Race Mode) */}
          {isRaceMode && (
            <div className={styles.controlGroup}>
              <label className={styles.labelSecondary}>
                🟠 Agent 2 Algorithm
              </label>
              <select
                value={secondAlgorithm || ""}
                onChange={handleSecondAlgorithmChange}
                disabled={isVisualizing}
                className={`${styles.select} ${styles.selectSecondary}`}
                title="Select second algorithm for race mode"
              >
                <optgroup label="⭐ Optimal">
                  {weightedAlgos.map((option) => {
                    const isSameAsAgent1 = option.value === selectedAlgorithm;
                    const isDisabledByMode = isAlgorithmDisabled(option.value);
                    const isDisabled = isSameAsAgent1 || isDisabledByMode;
                    const disabledReason = isSameAsAgent1
                      ? " (Agent 1)"
                      : isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                    return (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={isDisabled}
                      >
                        {option.shortLabel}
                        {disabledReason}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="🔍 Exploration">
                  {unweightedAlgos.map((option) => {
                    const isSameAsAgent1 = option.value === selectedAlgorithm;
                    const isDisabledByMode = isAlgorithmDisabled(option.value);
                    const isDisabled = isSameAsAgent1 || isDisabledByMode;
                    const disabledReason = isSameAsAgent1
                      ? " (Agent 1)"
                      : isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                    return (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={isDisabled}
                      >
                        {option.shortLabel}
                        {disabledReason}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="🚀 Advanced">
                  {bidirectionalAlgos.map((option) => {
                    const isSameAsAgent1 = option.value === selectedAlgorithm;
                    const isDisabledByMode = isAlgorithmDisabled(option.value);
                    const isDisabled = isSameAsAgent1 || isDisabledByMode;
                    const disabledReason = isSameAsAgent1
                      ? " (Agent 1)"
                      : isHiddenTargetMode && option.usesHeuristic
                      ? " (Hidden)"
                      : drawMode === "WEIGHT" && !option.supportsWeights
                      ? " (Unweighted)"
                      : "";
                    return (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={isDisabled}
                      >
                        {option.shortLabel}
                        {disabledReason}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>
          )}
        </Accordion>

        {/* === Section 2: Maze Generation === */}
        <Accordion
          title="Maze Generator"
          icon="🧩"
          isOpen={activeGenSection === "maze"}
          onToggle={() =>
            setActiveGenSection(
              activeGenSection === "maze" ? "terrain" : "maze"
            )
          }
        >
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
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.mazeActions}>
            <button
              onClick={handleGenerateMaze}
              disabled={isVisualizing || !selectedMaze}
              className={styles.buttonSecondary}
            >
              🔨 Generate
            </button>
            <button
              onClick={handleClearBoard}
              disabled={isVisualizing}
              className={styles.buttonGhost}
            >
              ✕ Clear Board
            </button>
          </div>

          <p className={styles.hint}>Click: wall, Ctrl+click: remove</p>
        </Accordion>

        {/* === Section 3: Terrain Generation === */}
        <Accordion
          title="Terrain Generation"
          icon="🏔️"
          isOpen={activeGenSection === "terrain"}
          onToggle={() =>
            setActiveGenSection(
              activeGenSection === "terrain" ? "maze" : "terrain"
            )
          }
        >
          <p className={styles.hint}>
            Click: 1→2→...→10→∞, Ctrl+click: decrement
          </p>

          <div className={styles.controlGroup}>
            <label className={styles.label}>Terrain Smoothness</label>
            <select
              value={terrainSmoothness}
              onChange={handleTerrainSmoothnessChange}
              disabled={isVisualizing}
              className={styles.select}
              title="Adjust terrain feature scale"
            >
              {TERRAIN_SMOOTHNESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Peak Intensity: {Math.round((1 - terrainIntensity) * 100)}%
            </label>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.05"
              value={terrainIntensity}
              onChange={(e) => setTerrainIntensity(parseFloat(e.target.value))}
              disabled={isVisualizing}
              className={styles.slider}
              title="Lower = more high-weight peaks, Higher = more low-weight valleys"
            />
            <div className={styles.sliderLabels}>
              <span>More Peaks</span>
              <span>More Valleys</span>
            </div>
          </div>

          <div className={styles.mazeActions}>
            <button
              onClick={handleGenerateTerrain}
              disabled={isVisualizing}
              className={styles.buttonSecondary}
              title="Generate terrain map"
            >
              🏔️ Generate Terrain
            </button>
            <button
              onClick={handleClearBoard}
              disabled={isVisualizing}
              className={styles.buttonGhost}
            >
              ✕ Clear Board
            </button>
          </div>
        </Accordion>

        {/* === Section 4: Grid Settings === */}
        <Accordion title="Settings" icon="⚙️">
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

          {/* Grid Size Controls */}
          <div className={styles.gridSizeSection}>
            <div className={styles.modeSectionTitle}>Grid Size</div>

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
