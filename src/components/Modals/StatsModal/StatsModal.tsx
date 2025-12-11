/**
 * StatsModal Component
 * Displays algorithm statistics after visualization completes
 * 
 * Features:
 * - Glassmorphism effect overlay
 * - Clean grid layout for metrics
 * - Support for both single and race mode stats
 */

import React, { useEffect, useCallback } from 'react';
import styles from './StatsModal.module.css';

export interface AlgorithmStats {
  algorithm: string;
  executionTime: number;
  visitedCount: number;
  pathLength: number;
}

export interface RaceStats {
  agent1: AlgorithmStats;
  agent2: AlgorithmStats;
  winner: 'agent1' | 'agent2' | 'tie';
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AlgorithmStats | RaceStats | null;
  isRaceMode?: boolean;
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  isRaceMode = false,
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !stats) return null;

  // Type guard for race mode
  const isRaceStats = (s: AlgorithmStats | RaceStats): s is RaceStats => {
    return 'agent1' in s && 'agent2' in s;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const renderSingleStats = (stat: AlgorithmStats, label?: string) => (
    <div className={styles.statsCard}>
      {label && <h3 className={styles.agentLabel}>{label}</h3>}
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Algorithm</span>
          <span className={styles.statValue}>{stat.algorithm}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Execution Time</span>
          <span className={styles.statValue}>{formatTime(stat.executionTime)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Nodes Visited</span>
          <span className={styles.statValue}>{stat.visitedCount.toLocaleString()}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Path Length</span>
          <span className={styles.statValue}>
            {stat.pathLength > 0 ? stat.pathLength : 'No path found'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isRaceMode ? '🏁 Race Results' : '📊 Algorithm Statistics'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {isRaceMode && isRaceStats(stats) ? (
            <>
              <div className={styles.winnerBanner}>
                {stats.winner === 'tie' ? (
                  <span>🤝 It's a Tie!</span>
                ) : (
                  <span>
                    🏆 Winner: {stats.winner === 'agent1' ? stats.agent1.algorithm : stats.agent2.algorithm}
                  </span>
                )}
              </div>
              <div className={styles.raceGrid}>
                <div className={styles.agent1}>
                  {renderSingleStats(stats.agent1, `🟡 Agent 1`)}
                </div>
                <div className={styles.agent2}>
                  {renderSingleStats(stats.agent2, `🔵 Agent 2`)}
                </div>
              </div>
            </>
          ) : (
            !isRaceStats(stats) && renderSingleStats(stats)
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
