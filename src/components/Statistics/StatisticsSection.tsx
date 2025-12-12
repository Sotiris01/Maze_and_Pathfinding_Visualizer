/**
 * StatisticsSection Component
 * Compact High-Density Analytics Dashboard
 *
 * Designed to fit within 100vh without scrolling.
 * System Monitor / Stock Ticker density approach.
 */

import React, { useMemo } from "react";
import { AlgorithmStats, RaceStats } from "../Modals/StatsModal";
import StatBar from "./StatBar";
import styles from "./StatisticsSection.module.css";

interface StatisticsSectionProps {
  stats: AlgorithmStats | RaceStats | null;
  isRaceMode: boolean;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  stats,
  isRaceMode: _isRaceMode, // Kept for API compatibility, rendering is based on stats type
}) => {
  // Type guard for race mode
  const isRaceStats = (s: AlgorithmStats | RaceStats): s is RaceStats => {
    return "agent1" in s && "agent2" in s;
  };

  // Format time for display
  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(1)}µs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Calculate verdict for race mode
  const verdict = useMemo(() => {
    if (!stats || !isRaceStats(stats)) return null;

    const { agent1, agent2, winner } = stats;

    // Check if both algorithms failed to find a path
    const agent1Failed = agent1.pathLength < 0;
    const agent2Failed = agent2.pathLength < 0;

    if (agent1Failed && agent2Failed) {
      return {
        title: "⚠️ Target Unreachable!",
        subtitle: "Neither algorithm could find a path",
        details: null,
      };
    }

    if (winner === "tie") {
      return {
        title: "🤝 It's a Tie!",
        subtitle: "Both algorithms performed equally",
        details: null,
      };
    }

    const winnerStats = winner === "agent1" ? agent1 : agent2;
    const loserStats = winner === "agent1" ? agent2 : agent1;

    // Check if the loser failed to find a path
    const loserFailed = loserStats.pathLength < 0;
    if (loserFailed) {
      return {
        title: `🏆 ${winnerStats.algorithm} Wins!`,
        subtitle: `${loserStats.algorithm} couldn't find a path`,
        details: null,
      };
    }

    const timeRatio = loserStats.executionTime / winnerStats.executionTime;

    let performanceNote = "";
    if (timeRatio >= 2) {
      performanceNote = `${timeRatio.toFixed(1)}× faster`;
    } else if (timeRatio >= 1.5) {
      performanceNote = `${((timeRatio - 1) * 100).toFixed(0)}% faster`;
    } else {
      performanceNote = "marginally faster";
    }

    return {
      title: `🏆 ${winnerStats.algorithm} Wins!`,
      subtitle: performanceNote,
      details: null,
    };
  }, [stats]);

  // Empty state when no stats available
  if (!stats) {
    return (
      <div className={styles.section}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <span className={styles.chartIcon}>📊</span>
            <div className={styles.pulseRing}></div>
          </div>
          <h2 className={styles.emptyTitle}>Analytics Dashboard</h2>
          <p className={styles.emptyText}>
            Run a pathfinding visualization to see performance metrics.
          </p>
          <div className={styles.emptyHints}>
            <span className={styles.hint}>⏱️ Time</span>
            <span className={styles.hint}>🔍 Nodes</span>
            <span className={styles.hint}>📏 Path</span>
          </div>
          <div className={styles.scrollHint}>
            <span className={styles.scrollArrow}>↑</span>
            <span>Scroll up to visualize</span>
          </div>
        </div>
      </div>
    );
  }

  // Determine rendering mode based on actual stats type, not isRaceMode prop
  // This handles the case where user toggles off race mode but stats still contain race data
  const shouldRenderAsRace = isRaceStats(stats);

  // Single algorithm mode - Compact 3-column grid
  if (!shouldRenderAsRace) {
    const singleStats = stats as AlgorithmStats;

    return (
      <div className={styles.section}>
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerBadge}>ANALYSIS COMPLETE</div>
            <h1 className={styles.title}>Algorithm Performance</h1>
          </header>

          {/* Algorithm Banner */}
          <div className={styles.algorithmBanner}>
            <span className={styles.algorithmIcon}>🧭</span>
            <div className={styles.algorithmInfo}>
              <span className={styles.algorithmLabel}>Algorithm</span>
              <h2 className={styles.algorithmName}>{singleStats.algorithm}</h2>
            </div>
            {singleStats.pathLength > 0 ? (
              <div className={styles.pathStatus}>
                <span className={styles.statusIcon}>✓</span>
                <span>Path Found</span>
              </div>
            ) : (
              <div className={`${styles.pathStatus} ${styles.noPath}`}>
                <span className={styles.statusIcon}>⚠️</span>
                <span>Unreachable</span>
              </div>
            )}
          </div>

          {/* Stats Cards - 3 Column Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.cardIcon}>⏱️</div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Time</span>
                <span className={styles.cardValue}>
                  {formatTime(singleStats.executionTime)}
                </span>
              </div>
              <div className={styles.cardBar}>
                <div
                  className={styles.cardBarFill}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                  }}
                />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.cardIcon}>🔍</div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Nodes Visited</span>
                <span className={styles.cardValue}>
                  {singleStats.visitedCount.toLocaleString()}
                </span>
              </div>
              <div className={styles.cardBar}>
                <div
                  className={styles.cardBarFill}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #00bcd4, #9c27b0)",
                  }}
                />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.cardIcon}>📏</div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Path Length</span>
                <span
                  className={`${styles.cardValue} ${
                    singleStats.pathLength < 0 ? styles.unreachable : ""
                  }`}
                >
                  {singleStats.pathLength > 0
                    ? `${singleStats.pathLength}`
                    : "Unreachable"}
                </span>
              </div>
              <div className={styles.cardBar}>
                <div
                  className={`${styles.cardBarFill} ${
                    singleStats.pathLength < 0 ? styles.errorBar : ""
                  }`}
                  style={{
                    width: singleStats.pathLength > 0 ? "100%" : "100%",
                    background:
                      singleStats.pathLength > 0
                        ? "linear-gradient(90deg, #ffeb3b, #ff9800)"
                        : "linear-gradient(90deg, #ef5350, #d32f2f)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scroll Hint */}
          <div className={styles.scrollHint}>
            <span className={styles.scrollArrow}>↑</span>
            <span>Scroll up to continue</span>
          </div>
        </div>
      </div>
    );
  }

  // Race mode - Compact 3-column comparison
  const raceStats = stats as RaceStats;

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerBadge}>RACE COMPLETE</div>
          <h1 className={styles.title}>
            {raceStats.agent1.algorithm} vs {raceStats.agent2.algorithm}
          </h1>
        </header>

        {/* Comparison Bars - 3 Column Grid */}
        <div className={styles.comparisonSection}>
          <StatBar
            label="Execution Time"
            value1={raceStats.agent1.executionTime}
            value2={raceStats.agent2.executionTime}
            label1={raceStats.agent1.algorithm}
            label2={raceStats.agent2.algorithm}
            unit="ms"
            icon="⏱️"
            color1="#667eea"
            color2="#f97316"
            lowerIsBetter={true}
            formatValue={formatTime}
            unreachable1={raceStats.agent1.pathLength < 0}
            unreachable2={raceStats.agent2.pathLength < 0}
          />

          <StatBar
            label="Nodes Visited"
            value1={raceStats.agent1.visitedCount}
            value2={raceStats.agent2.visitedCount}
            label1={raceStats.agent1.algorithm}
            label2={raceStats.agent2.algorithm}
            unit="nodes"
            icon="🔍"
            color1="#667eea"
            color2="#f97316"
            lowerIsBetter={true}
            unreachable1={raceStats.agent1.pathLength < 0}
            unreachable2={raceStats.agent2.pathLength < 0}
          />

          <StatBar
            label="Path Length"
            value1={
              raceStats.agent1.pathLength > 0 ? raceStats.agent1.pathLength : 0
            }
            value2={
              raceStats.agent2.pathLength > 0 ? raceStats.agent2.pathLength : 0
            }
            label1={raceStats.agent1.algorithm}
            label2={raceStats.agent2.algorithm}
            unit="steps"
            icon="📏"
            color1="#667eea"
            color2="#f97316"
            lowerIsBetter={true}
            unreachable1={raceStats.agent1.pathLength < 0}
            unreachable2={raceStats.agent2.pathLength < 0}
          />
        </div>

        {/* Verdict Banner - Full Width */}
        {verdict && (
          <div
            className={`${styles.verdictBanner} ${
              raceStats.winner === "tie" ? styles.tie : ""
            }`}
          >
            <div className={styles.verdictContent}>
              <h2 className={styles.verdictTitle}>{verdict.title}</h2>
              <p className={styles.verdictSubtitle}>{verdict.subtitle}</p>
            </div>
          </div>
        )}

        {/* Scroll Hint */}
        <div className={styles.scrollHint}>
          <span className={styles.scrollArrow}>↑</span>
          <span>Scroll up to continue</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
