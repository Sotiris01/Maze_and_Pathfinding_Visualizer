# Copilot Instructions for Maze & Pathfinding Visualizer

This document provides **strict guidelines** for AI agents assisting with this project. Follow these rules exactly.

---

## Project Overview

| Field                  | Value                                       |
| ---------------------- | ------------------------------------------- |
| **Project Name** | Maze & Pathfinding Visualizer               |
| **Type**         | Single Page Application (SPA)               |
| **Tech Stack**   | React 18, TypeScript 5, Vite 5, CSS Modules |
| **Default Grid** | 20 rows × 30 columns (600 nodes)           |
| **Node Size**    | 25px × 25px (constant)                     |

---

## 🚨 CRITICAL: Agent Working Patterns

### 1. Before Making Changes

**ALWAYS read existing code first:**

```
1. Read the file you're about to modify
2. Understand the existing patterns
3. Match the existing code style exactly
4. Use the same import patterns, naming conventions, and structure
```

### 2. State Management Pattern (IMPLEMENTED)

This project uses **React Context + useRef** for state management:

```typescript
// ✅ CORRECT - Use functional updates for grid state
setGrid((currentGrid) => getNewGridWithWallSet(currentGrid, row, col));

// ❌ WRONG - Direct state reference causes stale closures
setGrid(getNewGridWithWallSet(grid, row, col));
```

**Why:** Mouse event handlers create closures. Using `setGrid(currentGrid => ...)` ensures you always have the latest state.

### 3. useRef Pattern for Mouse State (IMPLEMENTED)

Mouse interactions MUST use `useRef` to avoid stale closure bugs:

```typescript
// ✅ CORRECT - Implemented pattern in Board.tsx
const isMousePressedRef = useRef<boolean>(false);
const isEraserModeRef = useRef<boolean>(false);
const isDraggingStartRef = useRef<boolean>(false);
const isDraggingFinishRef = useRef<boolean>(false);

// In handlers, check the ref:
if (!isMousePressedRef.current) return;

// On mousedown, set the ref:
isMousePressedRef.current = true;

// On mouseup, reset all refs:
isMousePressedRef.current = false;
isEraserModeRef.current = false;
isDraggingStartRef.current = false;
isDraggingFinishRef.current = false;
```

### 4. Grid Update Functions (IMPLEMENTED)

Grid manipulation functions are in `src/utils/gridUtils.ts`. **Use these, don't create new ones:**

| Function                                      | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `getInitialGrid(rows, cols)`                | Create new grid with safe Start/Finish positions |
| `getNewGridWithWallSet(grid, row, col)`     | Add wall (draw mode)                             |
| `getNewGridWithWallRemoved(grid, row, col)` | Remove wall (eraser mode)                        |
| `getNewGridWithStartMoved(grid, row, col)`  | Move Start node (auto-finds current)             |
| `getNewGridWithFinishMoved(grid, row, col)` | Move Finish node (auto-finds current)            |
| `resetGridForPathfinding(grid)`             | Clear visited/path, keep walls                   |
| `clearWalls(grid)`                          | Remove all walls                                 |
| `getSafeNodePositions(rows, cols)`          | Calculate safe Start/Finish positions            |

### 5. Event Handler Priority (IMPLEMENTED)

Mouse events in `handleMouseDown` follow this priority:

```typescript
// Priority 1: Start node drag
if (node.isStart) {
  isDraggingStartRef.current = true;
  return;
}

// Priority 2: Finish node drag
if (node.isFinish) {
  isDraggingFinishRef.current = true;
  return;
}

// Priority 3: Wall draw/erase
const isEraserMode = event.ctrlKey || event.metaKey;
// ... wall logic
```

---

## 🛡️ Bug Prevention Rules

### Stale Closure Prevention

```typescript
// ❌ BUG: This will use stale grid value
const handleMouseEnter = useCallback((row, col) => {
  if (!isMousePressed) return; // ← isMousePressed is stale!
  setGrid(getNewGridWithWallSet(grid, row, col)); // ← grid is stale!
}, [grid, isMousePressed]);

// ✅ CORRECT: Use refs for checks, functional updates for state
const handleMouseEnter = useCallback((row, col) => {
  if (!isMousePressedRef.current) return; // ← ref is always current
  setGrid((currentGrid) => getNewGridWithWallSet(currentGrid, row, col));
}, [setGrid]);
```

### Global MouseUp Listener (IMPLEMENTED)

Always add a global mouseup listener to handle edge cases:

```typescript
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

  document.addEventListener('mouseup', handleGlobalMouseUp);
  return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
}, [setIsMousePressed]);
```

### Prevent Browser Defaults

```typescript
// Prevent Ctrl+Click text selection on Windows
event.preventDefault();

// Prevent context menu on Ctrl+Click
onContextMenu={(e) => e.preventDefault()}

// Prevent drag ghost images
onDragStart={(e) => e.preventDefault()}
```

---

## 📁 File Structure & Imports

### Import Order Convention

```typescript
// 1. React imports
import React, { useCallback, useRef, useEffect } from 'react';

// 2. Context imports
import { useGridContext } from '../../context/GridContext';

// 3. Component imports
import NodeComponent from '../Node';

// 4. Utility imports
import { getNewGridWithWallSet, getNewGridWithWallRemoved } from '../../utils/gridUtils';

// 5. Style imports (always last)
import styles from './Board.module.css';
```

### Component File Structure

```
ComponentName/
├── ComponentName.tsx      // Main component
├── ComponentName.module.css  // Styles
└── index.ts               // Re-export: export { default } from './ComponentName';
```

---

## 🎨 Styling Patterns (CSS Modules)

### CSS Class Naming

```css
/* Base class */
.node { }

/* State modifiers with hyphen */
.node-start { }
.node-finish { }
.node-wall { }
.node-visited { }
.node-path { }
```

### Dynamic Inline Styles for Grid

```typescript
// Grid dimensions are set via inline style, not CSS
const boardStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${colCount}, 25px)`,
  gridTemplateRows: `repeat(${rowCount}, 25px)`,
};
```

### Color Palette (Mandatory)

```css
:root {
  --color-unvisited: #ffffff;
  --color-wall: #34495e;
  --color-start: #4caf50;
  --color-finish: #f44336;
  --color-visited-start: #00bcd4;
  --color-visited-end: #9c27b0;
  --color-path: #ffeb3b;
  --node-size: 25px;
  --node-border: #b8c6db;
}
```

---

## 📝 Type Definitions

### Node Interface (FINALIZED)

```typescript
interface Node {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  distance: number;        // Infinity by default
  previousNode: Node | null;
}
```

### GridContext Interface (CURRENT)

```typescript
interface GridContextType {
  // Grid State
  grid: Grid;
  setGrid: React.Dispatch<React.SetStateAction<Grid>>;

  // Grid Dimensions
  rowCount: number;
  colCount: number;
  resizeGrid: (newRows: number, newCols: number) => void;

  // Mouse State
  isMousePressed: boolean;
  setIsMousePressed: React.Dispatch<React.SetStateAction<boolean>>;

  // Visualization State
  isVisualizing: boolean;
  setIsVisualizing: React.Dispatch<React.SetStateAction<boolean>>;

  // Algorithm Selection
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<AlgorithmType>>;

  // Maze Selection
  selectedMaze: MazeType | null;
  setSelectedMaze: React.Dispatch<React.SetStateAction<MazeType | null>>;

  // Speed Control
  animationSpeed: number;
  setAnimationSpeed: React.Dispatch<React.SetStateAction<number>>;

  // Helper Functions
  resetBoard: () => void;
  clearPath: () => void;
  clearAllWalls: () => void;
}
```

---

## ⚡ Performance Optimization

### React.memo with Custom Comparator (IMPLEMENTED)

```typescript
const NodeComponent: React.FC<NodeComponentProps> = memo(
  ({ row, col, isStart, isFinish, isWall, isVisited, isPath, ...handlers }) => {
    // ... render
  },
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
    // Note: handlers are NOT compared - they're stable via useCallback
  }
);
```

### useCallback for Event Handlers

```typescript
const handleMouseDown = useCallback(
  (row: number, col: number, event: React.MouseEvent): void => {
    // handler logic
  },
  [grid, setGrid, setIsMousePressed, isVisualizing] // dependencies
);
```

---

## 🔧 Visualization Engine Rules (Phase B)

### ❌ FORBIDDEN: Synchronous Blocking

```typescript
// ❌ NEVER DO THIS - Freezes UI
function sleep(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}
```

### ✅ REQUIRED: Async Animation Pattern

```typescript
// Algorithm runs synchronously, returns array
const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);

// Animation runs asynchronously
function animateVisitedNodes(nodes: Node[], delay: number): void {
  nodes.forEach((node, index) => {
    setTimeout(() => {
      const element = document.getElementById(`node-${node.row}-${node.col}`);
      if (element) element.classList.add('node-visited');
    }, delay * index);
  });
}
```

---

## 📋 Interaction Modes Summary

| Mode        | Trigger                 | Action                          |
| ----------- | ----------------------- | ------------------------------- |
| Draw Walls  | Click + Drag            | `getNewGridWithWallSet()`     |
| Erase Walls | Ctrl/Cmd + Click + Drag | `getNewGridWithWallRemoved()` |
| Move Start  | Drag green node         | `getNewGridWithStartMoved()`  |
| Move Finish | Drag red node           | `getNewGridWithFinishMoved()` |
| Resize Grid | Slider controls         | `resizeGrid(rows, cols)`      |
| Reset Board | Button                  | `resetBoard()`                |
| Clear Walls | Button                  | `clearAllWalls()`             |

---

## 🚀 Implementation Checklist for New Features

When implementing new features:

1. [ ] Check if similar pattern exists in codebase
2. [ ] Use existing utility functions from `gridUtils.ts`
3. [ ] Use `useRef` for values checked in event handlers
4. [ ] Use functional updates for `setGrid`
5. [ ] Add `useCallback` wrapper with correct dependencies
6. [ ] Respect `isVisualizing` flag (disable interactions during visualization)
7. [ ] Update `project_status.md` after completing feature

---

## 📚 Key Files Reference

| File                                      | Purpose                                | Lines |
| ----------------------------------------- | -------------------------------------- | ----- |
| `src/types/index.ts`                    | All type definitions, enums, constants | 71    |
| `src/context/GridContext.tsx`           | Global state provider                  | 176   |
| `src/utils/gridUtils.ts`                | Grid manipulation functions            | 340   |
| `src/components/Board/Board.tsx`        | Grid renderer + mouse handlers         | 197   |
| `src/components/Node/NodeComponent.tsx` | Single cell renderer                   | 87    |
| `src/App.tsx`                           | Main app + Controls component          | 103   |

---

## 🛠️ Constants (Current Values)

```typescript
// Grid defaults
export const GRID_ROWS = 20;
export const GRID_COLS = 30;

// Start/Finish defaults
export const DEFAULT_START_ROW = 10;
export const DEFAULT_START_COL = 5;
export const DEFAULT_FINISH_ROW = 10;
export const DEFAULT_FINISH_COL = 25;

// Slider bounds (in Controls)
// Rows: 5-40
// Cols: 5-60

// Node size
// 25px × 25px (set in CSS and inline styles)
```

---

**Last Updated:** December 9, 2025
**Phase:** A Complete ✅ | Phase B: Pathfinding Next
