import React, { useCallback, useRef, useEffect, useState } from "react";
import { useGridContext } from "../../context/GridContext";
import NodeComponent from "../Node";
import {
  getNewGridWithWallSet,
  getNewGridWithWallRemoved,
  getNewGridWithStartMoved,
  getNewGridWithFinishMoved,
  getNewGridWithWeightIncremented,
  getNewGridWithWeightDecremented,
} from "../../utils/gridUtils";
import styles from "./Board.module.css";

/**
 * Board Component - Renders the 2D grid of nodes
 *
 * Uses GridContext for state management and handles
 * mouse events for wall/weight painting functionality.
 *
 * All tiles have weight from 1-10 or are walls (∞)
 * - WALL mode: Click = wall (∞), Ctrl+Click = remove wall (1)
 * - WEIGHT mode: Click = increment (1→2→...→10→∞), Ctrl+Click = decrement
 */
const Board: React.FC = () => {
  const {
    grid,
    setGrid,
    setIsMousePressed,
    isVisualizing,
    colCount,
    rowCount,
    isHiddenTargetMode,
    drawMode,
  } = useGridContext();

  // Ref for the board container to measure available space
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic node size state
  const [nodeSize, setNodeSize] = useState<number>(25);

  // Track if Ctrl/Cmd was held at start of drag (decrement/erase mode)
  const isCtrlModeRef = useRef<boolean>(false);
  // Track mouse pressed state with ref to avoid stale closure issues
  const isMousePressedRef = useRef<boolean>(false);
  // Track dragging Start node
  const isDraggingStartRef = useRef<boolean>(false);
  // Track dragging Finish node
  const isDraggingFinishRef = useRef<boolean>(false);
  // Track draw mode at start of drag operation (WALL or WEIGHT)
  const drawModeRef = useRef<"WALL" | "WEIGHT">(drawMode);
  // Track all nodes processed during current drag to prevent double-processing
  const processedNodesRef = useRef<Set<string>>(new Set());

  // Keep drawModeRef always in sync with drawMode state
  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

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
   * Handle mouse down on a node - starts wall/weight painting or Start/Finish dragging
   * Priority: Start node drag > Finish node drag > Wall/Weight interaction
   *
   * WALL mode: Click = set wall (∞), Ctrl+Click = remove wall (→1)
   * WEIGHT mode: Click = increment (1→2→...→10→∞), Ctrl+Click = decrement (∞→10→...→1)
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
        // Hidden Target Mode: Prevent dragging the finish node when it's hidden
        if (isHiddenTargetMode) {
          return; // Do nothing - user shouldn't move invisible target
        }
        isDraggingFinishRef.current = true;
        return;
      }

      // Priority 3: Wall or Weight interaction based on drawMode
      // Read from ref to get latest value (avoids stale closure in memoized components)
      const currentDrawMode = drawModeRef.current;
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      // Store in refs for drag continuity
      isCtrlModeRef.current = isCtrlPressed;

      // Clear and track this node to prevent double-processing during drag
      processedNodesRef.current.clear();
      processedNodesRef.current.add(`${row}-${col}`);

      // Apply the appropriate transformation
      setGrid((currentGrid) => {
        if (currentDrawMode === "WALL") {
          // WALL mode: Click = wall, Ctrl+Click = remove wall
          if (isCtrlPressed) {
            return getNewGridWithWallRemoved(currentGrid, row, col);
          } else {
            return getNewGridWithWallSet(currentGrid, row, col);
          }
        } else {
          // WEIGHT mode: Click = increment, Ctrl+Click = decrement
          if (isCtrlPressed) {
            return getNewGridWithWeightDecremented(currentGrid, row, col);
          } else {
            return getNewGridWithWeightIncremented(currentGrid, row, col);
          }
        }
      });
    },
    [grid, setGrid, setIsMousePressed, isVisualizing, isHiddenTargetMode]
  );

  /**
   * Handle touch start on a node - mobile equivalent of mousedown
   * Touch always increments/sets wall (no Ctrl key on mobile)
   */
  const handleTouchStart = useCallback(
    (row: number, col: number, event: React.TouchEvent): void => {
      event.preventDefault(); // Prevent scrolling while drawing

      if (isVisualizing) return;

      const node = grid[row][col];
      isMousePressedRef.current = true;
      setIsMousePressed(true);
      isCtrlModeRef.current = false; // No Ctrl mode on touch

      // Priority 1: Start node - begin dragging
      if (node.isStart) {
        isDraggingStartRef.current = true;
        return;
      }

      // Priority 2: Finish node - begin dragging
      if (node.isFinish) {
        if (isHiddenTargetMode) {
          return; // Do nothing - user shouldn't move invisible target
        }
        isDraggingFinishRef.current = true;
        return;
      }

      // Priority 3: Wall or Weight interaction based on drawMode
      // Read from ref to get latest value (avoids stale closure in memoized components)
      const currentDrawMode = drawModeRef.current;
      processedNodesRef.current.clear();
      processedNodesRef.current.add(`${row}-${col}`);

      setGrid((currentGrid) => {
        if (currentDrawMode === "WALL") {
          // WALL mode on touch: set wall
          return getNewGridWithWallSet(currentGrid, row, col);
        } else {
          // WEIGHT mode on touch: increment
          return getNewGridWithWeightIncremented(currentGrid, row, col);
        }
      });
    },
    [grid, setGrid, setIsMousePressed, isVisualizing, isHiddenTargetMode]
  );

  /**
   * Handle mouse enter on a node - continues wall/weight painting or Start/Finish dragging
   * Uses the mode (draw/decrement) that was set on mouse down
   *
   * WALL mode: Only process each node once during drag (prevents toggle flickering)
   * WEIGHT mode: Process each time mouse enters (allows continuous weight increase)
   */
  const handleMouseEnter = useCallback(
    (row: number, col: number): void => {
      // Use ref to check mouse state to avoid stale closure
      if (!isMousePressedRef.current || isVisualizing) return;

      const nodeKey = `${row}-${col}`;

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

      // In WALL mode, skip if this node was already processed during this drag
      // (prevents rapid wall toggle on/off when hovering)
      if (
        drawModeRef.current === "WALL" &&
        processedNodesRef.current.has(nodeKey)
      ) {
        return;
      }

      // Mark this node as processed (for WALL mode tracking)
      processedNodesRef.current.add(nodeKey);

      // Apply transformation based on mode set at drag start
      setGrid((currentGrid) => {
        if (drawModeRef.current === "WALL") {
          // WALL mode: Click = wall, Ctrl+Click = remove wall
          if (isCtrlModeRef.current) {
            return getNewGridWithWallRemoved(currentGrid, row, col);
          } else {
            return getNewGridWithWallSet(currentGrid, row, col);
          }
        } else {
          // WEIGHT mode: Click = increment, Ctrl+Click = decrement
          if (isCtrlModeRef.current) {
            return getNewGridWithWeightDecremented(currentGrid, row, col);
          } else {
            return getNewGridWithWeightIncremented(currentGrid, row, col);
          }
        }
      });
    },
    [setGrid, isVisualizing]
  );

  /**
   * Handle touch move - mobile equivalent of mouseenter
   * Uses document.elementFromPoint to find which node is under the finger
   *
   * WALL mode: Only process each node once during drag
   * WEIGHT mode: Process each time finger moves over node
   */
  const handleTouchMove = useCallback(
    (event: React.TouchEvent): void => {
      if (!isMousePressedRef.current || isVisualizing) return;

      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (!element) return;

      // Find the node element (may be the element or a parent)
      const nodeElement = element.closest("[data-row][data-col]");
      if (!nodeElement) return;

      const row = parseInt(nodeElement.getAttribute("data-row") || "-1", 10);
      const col = parseInt(nodeElement.getAttribute("data-col") || "-1", 10);

      if (row < 0 || col < 0 || row >= rowCount || col >= colCount) return;

      const nodeKey = `${row}-${col}`;

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

      // In WALL mode, skip if this node was already processed during this drag
      if (
        drawModeRef.current === "WALL" &&
        processedNodesRef.current.has(nodeKey)
      ) {
        return;
      }

      // Mark this node as processed (for WALL mode tracking)
      processedNodesRef.current.add(nodeKey);

      // Touch always uses "increment" mode (no Ctrl on mobile)
      setGrid((currentGrid) => {
        if (drawModeRef.current === "WALL") {
          return getNewGridWithWallSet(currentGrid, row, col);
        } else {
          return getNewGridWithWeightIncremented(currentGrid, row, col);
        }
      });
    },
    [setGrid, isVisualizing, rowCount, colCount]
  );

  /**
   * Handle touch end - mobile equivalent of mouseup
   */
  const handleTouchEnd = useCallback((): void => {
    isMousePressedRef.current = false;
    isCtrlModeRef.current = false;
    isDraggingStartRef.current = false;
    isDraggingFinishRef.current = false;
    processedNodesRef.current.clear();
    setIsMousePressed(false);
  }, [setIsMousePressed]);

  /**
   * Handle mouse up - stops all interactions
   * Resets all mode refs for the next interaction
   */
  const handleMouseUp = useCallback((): void => {
    isMousePressedRef.current = false;
    isCtrlModeRef.current = false;
    isDraggingStartRef.current = false;
    isDraggingFinishRef.current = false;
    processedNodesRef.current.clear();
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
        isCtrlModeRef.current = false;
        isDraggingStartRef.current = false;
        isDraggingFinishRef.current = false;
        processedNodesRef.current.clear();
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
              weight={node.weight}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
