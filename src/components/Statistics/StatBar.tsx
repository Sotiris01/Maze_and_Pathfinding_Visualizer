/**
 * StatBar Component
 * Animated horizontal progress bar for comparing algorithm metrics
 *
 * Features:
 * - Smooth width animation on mount
 * - Single or dual bar comparison
 * - Winner/loser color coding
 * - Normalized scale based on max values
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "./StatBar.module.css";

interface StatBarProps {
  label: string;
  value1: number;
  value2?: number;
  label1?: string;
  label2?: string;
  unit: string;
  icon: string;
  color1?: string;
  color2?: string;
  lowerIsBetter?: boolean;
  formatValue?: (value: number) => string;
  unreachable1?: boolean;
  unreachable2?: boolean;
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value1,
  value2,
  label1 = "Agent 1",
  label2 = "Agent 2",
  unit,
  icon,
  color1 = "#667eea",
  color2 = "#f97316",
  lowerIsBetter = true,
  formatValue,
  unreachable1 = false,
  unreachable2 = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animated, setAnimated] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Trigger animation after visibility
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Format value with custom formatter or default
  const format = (val: number, isUnreachable: boolean = false): string => {
    if (isUnreachable) return "Unreachable";
    if (formatValue) return formatValue(val);
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  // Calculate percentage widths (normalized)
  const maxValue = Math.max(value1, value2 ?? 0) || 1;
  const percentage1 = (value1 / maxValue) * 100;
  const percentage2 = value2 !== undefined ? (value2 / maxValue) * 100 : 0;

  // Determine winner (for dual mode)
  const isDualMode = value2 !== undefined;
  let winner1 = false;
  let winner2 = false;
  let isTie = false;

  // Special case: when one side is unreachable
  // - The reachable algorithm "wins" path length (it found a path, the other didn't)
  // - For time/nodes: the unreachable one gets a checkmark (not a fair comparison)
  const oneUnreachable =
    (unreachable1 && !unreachable2) || (!unreachable1 && unreachable2);

  if (isDualMode) {
    if (oneUnreachable) {
      // When one is unreachable, the other one automatically "wins" for display purposes
      // This gives checkmarks to both (unreachable gets pass, reachable gets win)
      winner1 = true;
      winner2 = true;
      isTie = false; // Not a tie, but both get checkmarks
    } else if (value1 === value2) {
      isTie = true;
      winner1 = true; // Both get "winner" styling for ties
      winner2 = true;
    } else if (lowerIsBetter) {
      winner1 = value1 < value2!;
      winner2 = value2! < value1;
    } else {
      winner1 = value1 > value2!;
      winner2 = value2! > value1;
    }
  }

  // Get status colors
  const getBarColor = (
    isWinner: boolean,
    defaultColor: string,
    isUnreachable: boolean = false,
    isTied: boolean = false
  ): string => {
    if (isUnreachable) return "#d32f2f"; // Red for unreachable
    if (!isDualMode) return defaultColor;
    if (isTied) return "#2196f3"; // Blue for tie
    // When one is unreachable, show green for the reachable one (no competition)
    if (oneUnreachable && !isUnreachable) return "#4caf50";
    return isWinner ? "#4caf50" : "#f44336";
  };

  const getStatusIcon = (
    isWinner: boolean,
    isUnreachable: boolean = false,
    isTied: boolean = false
  ): string => {
    if (isUnreachable) return "⚠️";
    if (!isDualMode) return "";
    if (isTied) return "="; // Equal sign for ties
    // When one is unreachable, show checkmark for the reachable one
    if (oneUnreachable && !isUnreachable) return "✓";
    return isWinner ? "✓" : "✗";
  };

  return (
    <div className={styles.statBar} ref={barRef}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
        <span className={styles.unit}>{unit}</span>
      </div>

      {/* Bar Container */}
      <div className={styles.barContainer}>
        {/* Bar 1 */}
        <div className={styles.barRow}>
          <div className={styles.barMeta}>
            <span className={styles.barLabel}>{label1}</span>
            <span
              className={`${styles.barValue} ${
                unreachable1 ? styles.unreachable : ""
              }`}
            >
              {format(value1, unreachable1)}
              {isDualMode && (
                <span
                  className={`${styles.status} ${
                    unreachable1
                      ? styles.error
                      : isTie
                      ? styles.tie
                      : winner1
                      ? styles.winner
                      : styles.loser
                  }`}
                >
                  {getStatusIcon(winner1, unreachable1, isTie)}
                </span>
              )}
            </span>
          </div>
          <div className={styles.barTrack}>
            <div
              className={`${styles.barFill} ${
                animated ? styles.animated : ""
              } ${unreachable1 ? styles.errorBar : ""}`}
              style={{
                width: animated
                  ? unreachable1
                    ? "100%"
                    : `${percentage1}%`
                  : "0%",
                background: getBarColor(winner1, color1, unreachable1, isTie),
              }}
            />
          </div>
        </div>

        {/* Bar 2 (Dual Mode Only) */}
        {isDualMode && (
          <div className={styles.barRow}>
            <div className={styles.barMeta}>
              <span className={styles.barLabel}>{label2}</span>
              <span
                className={`${styles.barValue} ${
                  unreachable2 ? styles.unreachable : ""
                }`}
              >
                {format(value2!, unreachable2)}
                <span
                  className={`${styles.status} ${
                    unreachable2
                      ? styles.error
                      : isTie
                      ? styles.tie
                      : winner2
                      ? styles.winner
                      : styles.loser
                  }`}
                >
                  {getStatusIcon(winner2, unreachable2, isTie)}
                </span>
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  animated ? styles.animated : ""
                } ${unreachable2 ? styles.errorBar : ""}`}
                style={{
                  width: animated
                    ? unreachable2
                      ? "100%"
                      : `${percentage2}%`
                    : "0%",
                  background: getBarColor(winner2, color2, unreachable2, isTie),
                  animationDelay: "0.1s",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Comparison Summary (Dual Mode) */}
      {isDualMode && value1 !== value2 && !unreachable1 && !unreachable2 && (
        <div className={styles.comparison}>
          {(() => {
            const winnerName = winner1 ? label1 : label2;
            const ratio = Math.max(value1, value2!) / Math.min(value1, value2!);
            const diff = Math.abs(value1 - value2!);

            if (ratio >= 2) {
              return (
                <span className={styles.comparisonText}>
                  <span className={styles.highlight}>{winnerName}</span> was{" "}
                  <span className={styles.highlight}>{ratio.toFixed(1)}×</span>{" "}
                  better
                </span>
              );
            } else {
              return (
                <span className={styles.comparisonText}>
                  <span className={styles.highlight}>{winnerName}</span> saved{" "}
                  <span className={styles.highlight}>{format(diff)}</span>{" "}
                  {unit.toLowerCase()}
                </span>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default StatBar;
