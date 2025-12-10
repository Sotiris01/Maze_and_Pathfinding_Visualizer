# Project Status

## Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | Maze & Pathfinding Visualizer |
| **Type** | Web Application (SPA) |
| **Tech Stack** | React 18, TypeScript 5, Vite 5, CSS Modules |
| **Current Phase** | Phase E: Polish & Deployment (In Progress) |
| **Progress** | Phase A ✅ → Phase B ✅ → Phase C ✅ → Phase D ✅ → Phase E 🔄 |
| **Server** | ✅ Running at http://localhost:3000/ |
| **Default Grid** | 20 rows × 30 columns (600 nodes) |
| **Repository** | https://github.com/Sotiris01/Maze_and_Pathfinding_Visualizer |

---

## Implementation Roadmap

### Phase A: Setup & Grid ✅ COMPLETE
- [x] React App with TypeScript and Vite
- [x] Grid as 2D Array (default 20×30)
- [x] Node component with proper styling
- [x] Click to toggle walls
- [x] Drag to draw walls
- [x] Drag & Drop for Start/Finish nodes
- [x] Dynamic Grid Resizing with slider controls (5-40 rows, 5-60 cols)

### Phase B: Basic Pathfinding ✅ COMPLETE
- [x] Dijkstra algorithm
- [x] Visualization animation system (DOM manipulation)
- [x] Speed control slider
- [x] ControlPanel sidebar component

### Phase C: Maze Generation ✅ COMPLETE
- [x] Recursive Division algorithm
- [x] Randomized DFS algorithm
- [x] Maze wall animation

### Phase D: Advanced Features ✅ COMPLETE
- [x] A* (A-Star) algorithm
- [x] BFS (Breadth-First Search)
- [x] DFS (Depth-First Search)
- [x] Race Mode (dual agent comparison)
- [x] Different colors for each agent

### Phase E: Polish & Deployment 🔄 IN PROGRESS
- [ ] Statistics Modal (execution time, visited nodes, path length)
- [ ] Legend component explaining node colors
- [ ] Responsive adjustments
- [ ] Performance optimization
- [ ] Deployment

---

## Current Features

### ✅ Working Features

**Grid System:**
- Dynamic grid rendering (20×30 default)
- Wall drawing (click/drag)
- Wall erasing (Ctrl/Cmd + click/drag)
- Start/Finish node drag & drop
- Grid resizing via sliders

**Pathfinding Algorithms:**
- Dijkstra''s Algorithm
- A* Search (Manhattan distance heuristic)
- Breadth-First Search (BFS)
- Depth-First Search (DFS)

**Maze Generation:**
- Recursive Division
- Randomized DFS (Recursive Backtracker)

**Race Mode:**
- Dual algorithm comparison
- Agent 1: Blue→Purple (visited), Yellow (path)
- Agent 2: Orange→Red (visited), Cyan (path)
- Overlap: Lime Green (shared path nodes)

**UI Controls:**
- Algorithm selection dropdown
- Maze type selection dropdown
- Speed slider (1-50ms)
- Grid size sliders
- Visualize/Race buttons
- Clear Path, Reset Board, Clear Walls buttons

### ⚠️ Known Limitations

- Race Mode path overlap uses simple lime green color (no direction-aware split visualization)

---

## File Structure

```
src/
├── App.tsx                              (101 lines) - Main application component
├── App.module.css                       (82 lines) - App layout styles
├── main.tsx                             (14 lines) - React entry point
├── vite-env.d.ts                        (27 lines) - Vite type declarations
├── algorithms/
│   ├── maze/
│   │   ├── randomizedDFS.ts             (186 lines) - Randomized DFS maze
│   │   └── recursiveDivision.ts         (209 lines) - Recursive Division maze
│   └── pathfinding/
│       ├── astar.ts                     (190 lines) - A* algorithm
│       ├── bfs.ts                       (142 lines) - Breadth-First Search
│       ├── dfs.ts                       (149 lines) - Depth-First Search
│       └── dijkstra.ts                  (145 lines) - Dijkstra's algorithm
├── components/
│   ├── Board/
│   │   ├── Board.tsx                    (187 lines) - Grid renderer
│   │   ├── Board.module.css             (39 lines) - Grid styles
│   │   └── index.ts                     (2 lines) - Barrel export
│   ├── Controls/
│   │   ├── ControlPanel.tsx             (296 lines) - Sidebar control panel
│   │   ├── ControlPanel.module.css      (374 lines) - Panel styles
│   │   └── index.ts                     (1 line) - Barrel export
│   └── Node/
│       ├── NodeComponent.tsx            (84 lines) - Grid cell component
│       ├── Node.module.css              (242 lines) - Node styles + animations
│       └── index.ts                     (2 lines) - Barrel export
├── context/
│   └── GridContext.tsx                  (179 lines) - Global state management
├── hooks/
│   └── useVisualization.ts              (676 lines) - Animation system
├── styles/
│   └── variables.css                    (383 lines) - CSS variables + global animations
├── types/
│   └── index.ts                         (64 lines) - TypeScript interfaces
└── utils/
    ├── gridUtils.ts                     (291 lines) - Grid helper functions
    └── pathUtils.ts                     (10 lines) - Path utilities (placeholder)
```

**Total: 25 files, 3,718 lines of code**

---

## Implementation Statistics

| Category | Files | Lines of Code |
|----------|-------|---------------|
| App Core | 4 | 224 |
| Components | 9 | 1,227 |
| Algorithms | 6 | 1,021 |
| Context | 1 | 179 |
| Hooks | 1 | 676 |
| Styles | 1 | 383 |
| Types | 1 | 64 |
| Utils | 2 | 301 |
| **Total** | **25** | **3,718** |

---

## Technical Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| Build Tool | Vite 5 | Fast HMR, ESM support |
| UI Library | React 18 | Component-based UI |
| Language | TypeScript 5 | Type safety |
| State | React Context | Global grid state |
| Performance | React.memo | Prevents mass re-renders |
| Layout | CSS Grid | Dynamic grid layout |
| Animation | Direct DOM | getElementById for 1000+ nodes |
| Styling | CSS Modules | Scoped + global classes |

---

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Unvisited | White | #ffffff |
| Wall | Dark Grey | #34495e |
| Start | Green | #4caf50 |
| Finish | Red | #f44336 |
| Visited (Agent 1) | Blue→Purple | #00bcd4→#9c27b0 |
| Visited (Agent 2) | Orange→Red | #ff9800→#f44336 |
| Path (Agent 1) | Yellow | #ffeb3b |
| Path (Agent 2) | Cyan | #00e5ff |
| Path Overlap | Lime Green | #76ff03 |
| Visited Overlap | Purple/Red gradient | #9c27b0/#f44336 |

---

## Dependencies

**Production:**
- react: ^18.2.0
- react-dom: ^18.2.0

**Development:**
- vite: ^5.0.10
- typescript: ^5.3.3
- @vitejs/plugin-react: ^4.2.1
- @types/react: ^18.2.43
- @types/react-dom: ^18.2.17

---

## Notes

- Node size: 25px × 25px (constant)
- Grid bounds: 5-40 rows, 5-60 columns
- Animation: setTimeout-based with DOM classList manipulation
- Race mode uses parallel animation for both agents

---

**Last Updated:** December 10, 2025
