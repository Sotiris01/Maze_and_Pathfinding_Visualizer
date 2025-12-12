import React, { useMemo, useCallback } from "react";
import { RunRecord } from "../../types";
import styles from "./HistorySection.module.css";

interface HistorySectionProps {
  history: RunRecord[];
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

/**
 * Format date for display
 */
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format execution time for display with exact precision
 * Shows microseconds (μs) for sub-millisecond times
 */
const formatTime = (ms: number): string => {
  if (ms < 0.001) return `${(ms * 1000000).toFixed(1)} ns`;
  if (ms < 1) return `${(ms * 1000).toFixed(1)} μs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
};

/**
 * HistorySection Component
 * Displays persistent run history with glassmorphism styling
 */
const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onClearHistory,
  onDeleteRecord,
}) => {
  // Memoize sorted history (newest first)
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  // Handle clear with confirmation
  const handleClear = useCallback(() => {
    if (history.length === 0) return;
    if (window.confirm("Clear all run history? This cannot be undone.")) {
      onClearHistory();
    }
  }, [history.length, onClearHistory]);

  // Render empty state
  if (history.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.headerBadge}>HISTORY</span>
            <h2 className={styles.title}>Run History</h2>
            <p className={styles.subtitle}>
              Track your pathfinding experiments
            </p>
          </header>

          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <span className={styles.historyIcon}>📋</span>
              <div className={styles.pulseRing} />
            </div>
            <h3 className={styles.emptyTitle}>No History Yet</h3>
            <p className={styles.emptyText}>
              Run a pathfinding algorithm to start tracking your experiments.
              <br />
              History is saved locally and persists across sessions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.headerBadge}>HISTORY</span>
          <h2 className={styles.title}>Run History</h2>
          <p className={styles.subtitle}>
            {history.length} run{history.length !== 1 ? "s" : ""} recorded
          </p>
        </header>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <button
            className={styles.clearButton}
            onClick={handleClear}
            title="Clear all history"
          >
            🗑️ Clear History
          </button>
        </div>

        {/* History Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Algorithm(s)</th>
                <th>Grid</th>
                <th>Time</th>
                <th>Path</th>
                <th>Visited</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((record) => (
                <tr key={record.id} className={styles.row}>
                  <td className={styles.dateCell}>{formatDate(record.date)}</td>
                  <td>
                    <span
                      className={`${styles.modeBadge} ${
                        record.mode === "Race"
                          ? styles.raceBadge
                          : styles.singleBadge
                      }`}
                    >
                      {record.mode}
                    </span>
                  </td>
                  <td className={styles.algoCell}>
                    <span className={styles.algo1}>{record.algorithm1}</span>
                    {record.algorithm2 && (
                      <>
                        <span className={styles.vs}>vs</span>
                        <span className={styles.algo2}>
                          {record.algorithm2}
                        </span>
                      </>
                    )}
                  </td>
                  <td className={styles.gridCell}>{record.gridSize}</td>
                  <td className={styles.timeCell}>
                    <span>{formatTime(record.time1)}</span>
                    {record.time2 !== undefined && (
                      <span className={styles.secondTime}>
                        / {formatTime(record.time2)}
                      </span>
                    )}
                  </td>
                  <td className={styles.pathCell}>
                    <span>{record.pathLength1}</span>
                    {record.pathLength2 !== undefined && (
                      <span className={styles.secondPath}>
                        / {record.pathLength2}
                      </span>
                    )}
                  </td>
                  <td className={styles.visitedCell}>
                    <span>{record.visitedCount1}</span>
                    {record.visitedCount2 !== undefined && (
                      <span className={styles.secondVisited}>
                        / {record.visitedCount2}
                      </span>
                    )}
                  </td>
                  <td className={styles.resultCell}>
                    {record.mode === "Race" && record.winner ? (
                      <span
                        className={`${styles.winner} ${
                          record.winner === "Tie"
                            ? styles.tie
                            : record.winner === "Both Failed"
                            ? styles.failed
                            : ""
                        }`}
                      >
                        {record.winner === record.algorithm1 ? "🏆 " : ""}
                        {record.winner === record.algorithm2 ? "🏆 " : ""}
                        {record.winner}
                      </span>
                    ) : record.pathLength1 > 0 ? (
                      <span className={styles.success}>✓ Found</span>
                    ) : (
                      <span className={styles.noPath}>✗ No Path</span>
                    )}
                  </td>
                  <td className={styles.deleteCell}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDeleteRecord(record.id)}
                      title="Delete this record"
                      aria-label="Delete record"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scroll hint for mobile */}
        <div className={styles.scrollHint}>
          ← Scroll horizontally to see all columns →
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
