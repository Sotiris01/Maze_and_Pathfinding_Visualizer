import React, { memo } from "react";
import { useGridContext } from "../../context/GridContext";
import styles from "./Node.module.css";

/**
 * Props for the NodeComponent
 * Extends Node properties with event handlers
 */
export interface NodeComponentProps {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  isPath?: boolean; // For shortest path highlighting
  weight?: number; // Terrain weight: 1 = normal, 5 = light, 10 = heavy
  onMouseDown: (row: number, col: number, event: React.MouseEvent) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
  onTouchStart?: (row: number, col: number, event: React.TouchEvent) => void;
}

/**
 * NodeComponent - Represents a single cell in the grid
 *
 * Wrapped in React.memo to prevent unnecessary re-renders
 * of all 1500 nodes during visualization updates.
 * Only re-renders when its own props change.
 */
const NodeComponent: React.FC<NodeComponentProps> = memo(
  ({
    row,
    col,
    isStart,
    isFinish,
    isWall,
    isVisited,
    isPath = false,
    weight = 1,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onTouchStart,
  }) => {
    const { isHiddenTargetMode } = useGridContext();

    /**
     * Compute the dynamic class name based on node state
     * Priority order: Start > Finish > Path > Wall > Visited > Weight > Default
     *
     * Hidden Target Mode: If finish node is hidden and not yet visited,
     * show it with a blinking animation (visible to user, hidden from algorithm)
     */
    const getNodeClassName = (): string => {
      const classNames = [styles.node];

      if (isStart) {
        classNames.push(styles["node-start"]);
      } else if (isFinish) {
        // Hidden Target Mode: Show blinking animation until discovered by algorithm
        if (isHiddenTargetMode && !isVisited) {
          classNames.push(styles["node-finish-hidden"]);
        } else {
          classNames.push(styles["node-finish"]);
        }
      } else if (isPath) {
        classNames.push(styles["node-path"]);
      } else if (isWall) {
        classNames.push(styles["node-wall"]);
      } else if (isVisited) {
        classNames.push(styles["node-visited"]);
      } else if (weight >= 2 && weight <= 10) {
        // Weight terrain - use specific class for each weight level
        classNames.push(styles[`node-weight-${weight}`]);
      }

      return classNames.join(" ");
    };

    /**
     * Get the weight label to display on the node
     * Normal tiles (weight=1): "1"
     * Weighted tiles (weight>1): the weight value
     * Wall tiles: "∞"
     */
    const getWeightLabel = (): string => {
      if (isStart || isFinish) return "";
      if (isWall) return "∞";
      return weight.toString();
    };

    /**
     * Build aria-label including weight information
     */
    const getAriaLabel = (): string => {
      let label = `Node at row ${row}, column ${col}`;
      if (isStart) label += " (Start)";
      if (isFinish) label += " (Finish)";
      if (isWall) label += " (Wall)";
      if (weight > 1 && !isWall) label += ` (Weight: ${weight})`;
      return label;
    };

    return (
      <div
        id={`node-${row}-${col}`}
        className={getNodeClassName()}
        data-row={row}
        data-col={col}
        onMouseDown={(e) => onMouseDown(row, col, e)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={onMouseUp}
        onTouchStart={
          onTouchStart ? (e) => onTouchStart(row, col, e) : undefined
        }
        role="button"
        tabIndex={-1}
        aria-label={getAriaLabel()}
      >
        <span className={styles.weightLabel}>{getWeightLabel()}</span>
      </div>
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    return (
      prevProps.isStart === nextProps.isStart &&
      prevProps.isFinish === nextProps.isFinish &&
      prevProps.isWall === nextProps.isWall &&
      prevProps.isVisited === nextProps.isVisited &&
      prevProps.isPath === nextProps.isPath &&
      prevProps.weight === nextProps.weight &&
      prevProps.row === nextProps.row &&
      prevProps.col === nextProps.col
    );
  }
);

NodeComponent.displayName = "NodeComponent";

export default NodeComponent;
