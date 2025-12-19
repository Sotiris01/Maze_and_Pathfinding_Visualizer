/**
 * Legend Component
 * Displays color legend for grid node types
 *
 * Shows all possible node states with their corresponding colors
 */

import React from "react";
import styles from "./Legend.module.css";

interface LegendItem {
  label: string;
  color?: string;
  gradient?: string;
  border?: string;
  glow?: "a1" | "a2" | "overlap";
  text?: string;
}

const legendItems: LegendItem[] = [
  // Basic nodes
  { label: "Start", color: "#4caf50", border: "2px solid #2e7d32" },
  { label: "Target", color: "#f44336", border: "2px solid #c62828" },
  { label: "Wall", color: "#34495e", border: "2px solid #2c3e50" },

  // Agent 1 (default) - blue
  { label: "Visited (A1)", color: "#b8c6db", glow: "a1" },
  { label: "Path (A1)", color: "#1565c0", border: "3px solid #0d47a1" },

  // Agent 2 (race mode) - yellow
  { label: "Visited (A2)", color: "#b8c6db", glow: "a2" },
  { label: "Path (A2)", color: "#fdd835", border: "3px solid #f9a825" },

  // Overlap - green
  { label: "Visited Overlap", color: "#b8c6db", glow: "overlap" },
  { label: "Path Overlap", color: "#43a047", border: "3px solid #2e7d32" },

  // Terrain weights
  { label: "Weight 1", color: "#f5f0e6", text: "1" },
  { label: "Weight 5", color: "#b8c6db", text: "5" },
  { label: "Weight 10", color: "#64748b", text: "10" },
];

interface LegendProps {
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
}

const Legend: React.FC<LegendProps> = ({
  orientation = "horizontal",
  compact = false,
}) => {
  return (
    <div
      className={`${styles.legend} ${styles[orientation]} ${
        compact ? styles.compact : ""
      }`}
      role="region"
      aria-label="Color Legend"
    >
      <span className={styles.title}>Legend:</span>
      <div className={styles.items}>
        {legendItems.map((item) => (
          <div key={item.label} className={styles.item}>
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className={`${styles.colorBox} ${
                item.glow === "a1" ? styles.glowingA1 : ""
              } ${item.glow === "a2" ? styles.glowingA2 : ""} ${
                item.glow === "overlap" ? styles.glowingOverlap : ""
              }`}
              style={{
                background: item.gradient || item.color,
                border: item.border || "none",
              }}
              aria-hidden="true"
            >
              {item.text && (
                <span className={styles.weightText}>{item.text}</span>
              )}
            </div>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
