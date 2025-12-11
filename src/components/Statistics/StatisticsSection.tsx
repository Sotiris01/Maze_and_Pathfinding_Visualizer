/**
 * StatisticsSection Component
 * Full-page statistics dashboard for the second scroll section
 * 
 * Features:
 * - Large stylish cards for algorithm metrics
 * - Support for both single and race mode stats
 * - Responsive grid layout
 */

import React from 'react';
import { AlgorithmStats, RaceStats } from '../Modals/StatsModal';
import styles from './StatisticsSection.module.css';

interface StatisticsSectionProps {
  stats: AlgorithmStats | RaceStats | null;
  isRaceMode: boolean;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ stats, isRaceMode }) => {
  // Type guard for race mode
  const isRaceStats = (s: AlgorithmStats | RaceStats): s is RaceStats => {
    return 'agent1' in s && 'agent2' in s;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const renderStatCard = (
    label: string,
    value: string | number,
    icon: string,
    highlight?: boolean
  ) => (
    <div className={`${styles.statCard} ${highlight ? styles.highlight : ''}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );

  const renderAgentStats = (
    stat: AlgorithmStats,
    agentLabel: string,
    agentClass: string,
    isWinner: boolean
  ) => (
    <div className={`${styles.agentColumn} ${styles[agentClass]}`}>
      <div className={styles.agentHeader}>
        <h3 className={styles.agentTitle}>
          {agentLabel}
          {isWinner && <span className={styles.winnerBadge}>🏆 Winner</span>}
        </h3>
        <span className={styles.algorithmName}>{stat.algorithm}</span>
      </div>
      <div className={styles.agentCards}>
        {renderStatCard('Execution Time', formatTime(stat.executionTime), '⏱️')}
        {renderStatCard('Nodes Visited', stat.visitedCount.toLocaleString(), '🔍')}
        {renderStatCard(
          'Path Length',
          stat.pathLength > 0 ? stat.pathLength.toString() : 'No path',
          '📏',
          stat.pathLength > 0
        )}
      </div>
    </div>
  );

  // Empty state when no stats available
  if (!stats) {
    return (
      <div className={styles.section}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📊</span>
          <h2 className={styles.emptyTitle}>No Statistics Yet</h2>
          <p className={styles.emptyText}>
            Run a pathfinding visualization to see algorithm statistics here.
          </p>
          <div className={styles.scrollHint}>
            <span>↑</span>
            <span>Scroll up to visualize</span>
          </div>
        </div>
      </div>
    );
  }

  // Single algorithm mode
  if (!isRaceMode || !isRaceStats(stats)) {
    const singleStats = stats as AlgorithmStats;
    return (
      <div className={styles.section}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h2 className={styles.title}>📊 Algorithm Statistics</h2>
            <p className={styles.subtitle}>Results from your pathfinding visualization</p>
          </header>

          <div className={styles.singleAlgorithm}>
            <div className={styles.algorithmBanner}>
              <span className={styles.algorithmIcon}>🧭</span>
              <h3 className={styles.algorithmTitle}>{singleStats.algorithm}</h3>
            </div>

            <div className={styles.statsGrid}>
              {renderStatCard('Execution Time', formatTime(singleStats.executionTime), '⏱️')}
              {renderStatCard('Nodes Visited', singleStats.visitedCount.toLocaleString(), '🔍')}
              {renderStatCard(
                'Path Length',
                singleStats.pathLength > 0 ? `${singleStats.pathLength} nodes` : 'No path found',
                '📏',
                singleStats.pathLength > 0
              )}
              {renderStatCard(
                'Efficiency',
                singleStats.pathLength > 0
                  ? `${((singleStats.pathLength / singleStats.visitedCount) * 100).toFixed(1)}%`
                  : 'N/A',
                '📈'
              )}
            </div>
          </div>

          <div className={styles.scrollHint}>
            <span>↑</span>
            <span>Scroll up to continue</span>
          </div>
        </div>
      </div>
    );
  }

  // Race mode
  const raceStats = stats as RaceStats;
  return (
    <div className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>🏁 Race Results</h2>
          <p className={styles.subtitle}>Algorithm comparison complete</p>
        </header>

        {/* Winner Banner */}
        <div className={styles.winnerBanner}>
          {raceStats.winner === 'tie' ? (
            <span className={styles.winnerText}>🤝 It's a Tie!</span>
          ) : (
            <span className={styles.winnerText}>
              🏆 Winner: {raceStats.winner === 'agent1' ? raceStats.agent1.algorithm : raceStats.agent2.algorithm}
            </span>
          )}
        </div>

        {/* Race Comparison */}
        <div className={styles.raceComparison}>
          {renderAgentStats(
            raceStats.agent1,
            '🟡 Agent 1',
            'agent1',
            raceStats.winner === 'agent1'
          )}
          
          <div className={styles.vsDivider}>
            <span>VS</span>
          </div>
          
          {renderAgentStats(
            raceStats.agent2,
            '🔵 Agent 2',
            'agent2',
            raceStats.winner === 'agent2'
          )}
        </div>

        <div className={styles.scrollHint}>
          <span>↑</span>
          <span>Scroll up to continue</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
