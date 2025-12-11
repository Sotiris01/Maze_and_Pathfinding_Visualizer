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
}

const legendItems: LegendItem[] = [
  { label: "Start", color: "#4caf50", border: "2px solid #2e7d32" },
  { label: "Target", color: "#f44336", border: "2px solid #c62828" },
  { label: "Wall", color: "#34495e", border: "2px solid #2c3e50" },
  {
    label: "Visited (A1)",
    gradient: "linear-gradient(135deg, #00bcd4 0%, #9c27b0 100%)",
  },
  {
    label: "Visited (A2)",
    gradient: "linear-gradient(135deg, #ff9800 0%, #f44336 100%)",
  },
  { label: "Path (A1)", color: "#ffeb3b", border: "2px solid #f9a825" },
  { label: "Path (A2)", color: "#00e5ff", border: "2px solid #00acc1" },
  { label: "Overlap", color: "#76ff03", border: "2px solid #64dd17" },
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
              className={styles.colorBox}
              style={{
                background: item.gradient || item.color,
                border: item.border || "none",
              }}
              aria-hidden="true"
            />
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
