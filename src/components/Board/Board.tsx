import React, { useCallback, useRef, useEffect, useState } from "react";
import { useGridContext } from "../../context/GridContext";
import NodeComponent from "../Node";
import {
  getNewGridWithWallSet,
  getNewGridWithWallRemoved,
  getNewGridWithStartMoved,
  getNewGridWithFinishMoved,
} from "../../utils/gridUtils";
import styles from "./Board.module.css";

/**
 * Board Component - Renders the 2D grid of nodes
 *
 * Uses GridContext for state management and handles
 * mouse events for wall drawing functionality.
 *
 * Features:
 * - Dynamic node sizing based on container dimensions
 * - Standard Click/Drag: Draw walls
 * - Ctrl/Cmd + Click/Drag: Erase walls (Eraser mode)
 */
const Board: React.FC = () => {
  const {
    grid,
    setGrid,
    setIsMousePressed,
    isVisualizing,
    colCount,
    rowCount,
  } = useGridContext();

  // Ref for the board container to measure available space
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic node size state
  const [nodeSize, setNodeSize] = useState<number>(25);

  // Track eraser mode - persists throughout the drag operation
  const isEraserModeRef = useRef<boolean>(false);
  // Track mouse pressed state with ref to avoid stale closure issues
  const isMousePressedRef = useRef<boolean>(false);
  // Track dragging Start node
  const isDraggingStartRef = useRef<boolean>(false);
  // Track dragging Finish node
  const isDraggingFinishRef = useRef<boolean>(false);

  /**
   * Calculate and set the optimal node size based on container dimensions
   * Ensures the entire grid fits without scrollbars
   */
  const calculateNodeSize = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Account for border (2px on each side = 4px total)
    const availableWidth = containerWidth - 4;
    const availableHeight = containerHeight - 4;

    // Calculate max size that fits both dimensions
    const maxSizeByWidth = availableWidth / colCount;
    const maxSizeByHeight = availableHeight / rowCount;

    // Use the smaller value to ensure grid fits in both dimensions
    // Floor to avoid sub-pixel rendering issues, min 10px for usability
    const calculatedSize = Math.max(
      10,
      Math.floor(Math.min(maxSizeByWidth, maxSizeByHeight))
    );

    setNodeSize(calculatedSize);
  }, [colCount, rowCount]);

  /**
   * ResizeObserver to recalculate node size when container changes
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial calculation
    calculateNodeSize();

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateNodeSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateNodeSize]);

  /**
   * Recalculate when grid dimensions change
   */
  useEffect(() => {
    calculateNodeSize();
  }, [rowCount, colCount, calculateNodeSize]);

  /**
   * Handle mouse down on a node - starts wall drawing/erasing or Start/Finish dragging
   * Priority: Start node drag > Finish node drag > Wall drawing/erasing
   * Ctrl/Cmd + Click activates eraser mode (for walls only)
   */
  const handleMouseDown = useCallback(
    (row: number, col: number, event: React.MouseEvent): void => {
      // Prevent default browser behavior (e.g., Ctrl+Click selection on Windows)
      event.preventDefault();

      if (isVisualizing) return;

      const node = grid[row][col];
      isMousePressedRef.current = true;
      setIsMousePressed(true);

      // Priority 1: Start node - begin dragging
      if (node.isStart) {
        isDraggingStartRef.current = true;
        return;
      }

      // Priority 2: Finish node - begin dragging
      if (node.isFinish) {
        isDraggingFinishRef.current = true;
        return;
      }

      // Priority 3: Wall drawing/erasing
      const isEraserMode = event.ctrlKey || event.metaKey;
      isEraserModeRef.current = isEraserMode;

      // Use functional update to always get latest grid state
      setGrid((currentGrid) => {
        if (isEraserMode) {
          return getNewGridWithWallRemoved(currentGrid, row, col);
        } else {
          return getNewGridWithWallSet(currentGrid, row, col);
        }
      });
    },
    [grid, setGrid, setIsMousePressed, isVisualizing]
  );

  /**
   * Handle mouse enter on a node - continues wall drawing/erasing or Start/Finish dragging
   * Maintains the mode (draw/erase/drag) that was set on mouse down
   */
  const handleMouseEnter = useCallback(
    (row: number, col: number): void => {
      // Use ref to check mouse state to avoid stale closure
      if (!isMousePressedRef.current || isVisualizing) return;

      // Handle Start node dragging
      if (isDraggingStartRef.current) {
        setGrid((currentGrid) =>
          getNewGridWithStartMoved(currentGrid, row, col)
        );
        return;
      }

      // Handle Finish node dragging
      if (isDraggingFinishRef.current) {
        setGrid((currentGrid) =>
          getNewGridWithFinishMoved(currentGrid, row, col)
        );
        return;
      }

      // Handle wall drawing/erasing
      setGrid((currentGrid) => {
        if (isEraserModeRef.current) {
          return getNewGridWithWallRemoved(currentGrid, row, col);
        } else {
          return getNewGridWithWallSet(currentGrid, row, col);
        }
      });
    },
    [setGrid, isVisualizing]
  );

  /**
   * Handle mouse up - stops all interactions (wall drawing/erasing, Start/Finish dragging)
   * Resets all mode refs for the next interaction
   */
  const handleMouseUp = useCallback((): void => {
    isMousePressedRef.current = false;
    isEraserModeRef.current = false;
    isDraggingStartRef.current = false;
    isDraggingFinishRef.current = false;
    setIsMousePressed(false);
  }, [setIsMousePressed]);

  /**
   * Global mouseup listener to handle edge cases where mouseup
   * fires outside of any node (e.g., clicking on tile edges)
   */
  useEffect(() => {
    const handleGlobalMouseUp = (): void => {
      if (isMousePressedRef.current) {
        isMousePressedRef.current = false;
        isEraserModeRef.current = false;
        isDraggingStartRef.current = false;
        isDraggingFinishRef.current = false;
        setIsMousePressed(false);
      }
    };

    // Listen to mouseup on the entire document
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [setIsMousePressed]);

  /**
   * Prevent default drag behavior on the board
   */
  const handleDragStart = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  /**
   * Prevent context menu on right-click or Ctrl+click
   */
  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
  };

  // Dynamic grid styling with calculated node size
  const boardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${colCount}, ${nodeSize}px)`,
    gridTemplateRows: `repeat(${rowCount}, ${nodeSize}px)`,
    // Set CSS variable for node components to use
    ["--node-size" as string]: `${nodeSize}px`,
  };

  return (
    <div
      ref={containerRef}
      className={styles.boardContainer}
      onMouseLeave={handleMouseUp}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
    >
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <div
        className={styles.board}
        style={boardStyle}
        role="presentation"
        aria-label="Pathfinding Grid"
      >
        {grid.map((row) =>
          row.map((node) => (
            <NodeComponent
              key={`${node.row}-${node.col}`}
              row={node.row}
              col={node.col}
              isStart={node.isStart}
              isFinish={node.isFinish}
              isWall={node.isWall}
              isVisited={node.isVisited}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
