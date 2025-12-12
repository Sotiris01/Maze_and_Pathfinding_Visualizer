import React, { memo } from "react";
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
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onTouchStart,
  }) => {
    /**
     * Compute the dynamic class name based on node state
     * Priority order: Start > Finish > Path > Wall > Visited > Default
     */
    const getNodeClassName = (): string => {
      const classNames = [styles.node];

      if (isStart) {
        classNames.push(styles["node-start"]);
      } else if (isFinish) {
        classNames.push(styles["node-finish"]);
      } else if (isPath) {
        classNames.push(styles["node-path"]);
      } else if (isWall) {
        classNames.push(styles["node-wall"]);
      } else if (isVisited) {
        classNames.push(styles["node-visited"]);
      }

      return classNames.join(" ");
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
        aria-label={`Node at row ${row}, column ${col}${
          isStart ? " (Start)" : ""
        }${isFinish ? " (Finish)" : ""}${isWall ? " (Wall)" : ""}`}
      />
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
      prevProps.row === nextProps.row &&
      prevProps.col === nextProps.col
    );
  }
);

NodeComponent.displayName = "NodeComponent";

export default NodeComponent;
