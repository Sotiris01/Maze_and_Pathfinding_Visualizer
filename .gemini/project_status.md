# Project Status

## Project Overview

| Field             | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| **Project Name**  | Maze & Pathfinding Visualizer                                               |
| **Type**          | Web Application (SPA)                                                       |
| **Tech Stack**    | React 18, TypeScript 5, Vite 5, CSS Modules, Web Workers                    |
| **Current Phase** | **Phase F: Extensions & History** (In Progress)                             |
| **Progress**      | Phase A ✅ → Phase B ✅ → Phase C ✅ → Phase D ✅ → Phase E ✅ → Phase F 🔄 |
| **Server**        | ✅ Live at https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/     |
| **Default Grid**  | 20 rows × 30 columns (600 nodes)                                            |
| **Repository**    | https://github.com/Sotiris01/Maze_and_Pathfinding_Visualizer                |

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

- [x] A\* (A-Star) algorithm
- [x] BFS (Breadth-First Search)
- [x] DFS (Depth-First Search)
- [x] Race Mode (dual agent comparison)
- [x] Different colors for each agent

### Phase E: Polish & Deployment ✅ COMPLETE

- [x] Statistics Modal (execution time, visited nodes, path length)
- [x] Legend component explaining node colors
- [x] Two-Page Scroll Layout (CSS Scroll Snap)
- [x] Statistics Section (full-page dashboard)
- [x] Auto-scroll to stats after visualization
- [x] Sidebar Control Panel (fixed width, full height)
- [x] Auto-Scaling Grid (dynamic node sizing with ResizeObserver)
- [x] Invisible Scrollbar (sidebar scrollable but scrollbar hidden)
- [x] **Accordion-Based Control Panel Redesign**
  - Reusable Accordion component with smooth animations
  - 3 collapsible sections: Pathfinding, Maze Generation, Grid Settings
  - Professional dark theme with gradient accents
  - Primary/Secondary/Ghost button styles
  - Loading spinner for visualization state
- [x] **Professional Analytics Dashboard (Statistics Section)**
  - StatBar component with animated comparison progress bars
  - IntersectionObserver triggers animations when scrolled into view
  - Winner/Loser highlighting (green/red) based on metrics
  - Single mode: Algorithm banner + 4 stat cards (time, visited, path, efficiency)
  - Race mode: Side-by-side StatBar comparisons + details table
  - Verdict banner with algorithm winner declaration
  - Glassmorphism card styling with backdrop-filter
- [x] **Compact High-Density Statistics Layout**
  - Refactored to fit within 100vh without scrolling
  - 3-column grid layout for metric cards (Time, Nodes, Path)
  - Slim 8px progress bars with labels above
  - System Monitor / Stock Ticker density approach
  - Responsive breakpoints: 3→2→1 columns
- [x] **Toast Notification System**
  - Slide-up toast for unreachable target detection
  - Auto-dismiss after 3 seconds with fade-out animation
  - Error/warning/success styling variants
  - Statistics display "Unreachable" with red indicator
- [x] **Responsive Mobile Layout**
  - Mobile (≤768px): Hamburger menu with slide-over drawer
  - Tablet (769-1000px): Stacked layout with collapsible panel
  - Desktop (>768px): Side-by-side fixed sidebar layout
  - Touch support for wall drawing and node dragging
  - Adaptive statistics with single-column mobile layout
- [x] **Performance Optimization**
  - React.memo with custom `arePropsEqual` on NodeComponent (skips function refs)
  - useCallback with refs in Board.tsx to avoid stale closures
  - React.lazy() + Suspense for StatisticsSection (below-fold lazy loading)
  - Vite manual chunk splitting: vendor-react (141KB), algorithms (17KB), statistics (11KB)
  - esbuild minification with console/debugger removal
  - Cache-friendly file naming with content hashes
- [x] **Deployment to GitHub Pages**
  - Configured `base` URL in vite.config.ts for correct asset paths
  - Added `gh-pages` package for automated deployment
  - `npm run deploy` pushes dist folder to gh-pages branch
  - Live at: https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/

### Phase F: Extensions & History 🔄 IN PROGRESS

- [x] **Hidden Target Mode (Fog of War)**
  - Toggle Button "🕵️ Hidden Target" in Control Panel
  - Logic: When active, the Target Node is visually hidden (renders as normal unvisited node)
  - Target reveals itself once visited/discovered by algorithm
  - Prevents dragging finish node in hidden mode (mouse & touch)
- [x] **Dynamic Algorithm Filtering**
  - UI Logic: A\* algorithm is disabled (grayed out) when Hidden Target is active
  - Auto-switch to Dijkstra/BFS if A\* was selected when enabling hidden mode
  - Only allows "Blind Search" algorithms (BFS, DFS, Dijkstra)
  - Hint message displays: "💡 Heuristic algorithms disabled in Hidden Mode"
  - Race Mode: Both agents follow the same filtering rules
- [x] **New Algorithms**
  - [x] **Greedy Best-First Search** - Heuristic-only pathfinding (fScore = hScore, no gScore)
    - Uses Manhattan distance heuristic
    - Faster than A\* but does NOT guarantee shortest path
    - Disabled in Hidden Target Mode (requires target coordinates)
  - [x] **Prim's Maze Algorithm** - Randomized minimum spanning tree
    - Starts with all walls, carves passages using frontier list
    - Creates organic, cave-like mazes (different from Recursive Division)
    - Random wall selection for interesting animation
  - [x] **Bidirectional BFS (Swarm)** - Searches from both start and finish simultaneously
    - Two queues expand alternately from both ends
    - Meeting point detection when frontiers intersect
    - Path reconstruction combines both halves through meeting node
    - Explores roughly half the search space of unidirectional BFS
  - [x] **Bidirectional A\*** - Combines A\* heuristics with bidirectional search
    - Two priority queues sorted by fScore (one from each end)
    - Start side heuristic: distance to finish; Finish side heuristic: distance to start
    - Meeting point detection with optimal path cost tracking
    - Early termination when remaining nodes cannot improve best path
    - Disabled in Hidden Target Mode (requires target coordinates)
  - [x] **Spiral Maze** - Creates walls in spiral pattern from outside to inside
    - Concentric rectangular rings of walls
    - Gaps at ring transitions allow traversal to inner layers
    - Internal barriers for additional complexity
    - Visually distinctive deterministic pattern
  - [x] **Jump Point Search (JPS)** - Optimized A\* for uniform-cost grids
    - "Jumps" over intermediate nodes in straight lines
    - Only examines jump points (forced neighbors, corners)
    - 10-100x faster than A\* in open spaces
    - Guarantees shortest path like A\*
    - Disabled in Hidden Target Mode (uses heuristic)
  - [x] **Cellular Automata Maze** - Game of Life-inspired wall generation
    - Random initial state with configurable wall density
    - Birth/death rules create organic cave-like patterns
    - Automatic path carving ensures solvability
    - Produces unique, non-deterministic maze every time
- [x] **Industrial-Grade Web Worker Benchmarking System**
  - Complete thread isolation for scientific timing precision
  - `benchmark.worker.ts` - Dedicated worker for timing (zero UI interference)
  - `useBenchmarking.ts` - React hook bridge with Promise-based API
  - Adaptive sampling: runs algorithm until 1 second elapsed, calculates average
  - 3x warm-up iterations for JIT optimization before measurement
  - Request ID system for concurrent benchmark support (Race Mode)
  - Graceful fallback to main-thread timing if worker fails
- [x] **Race Mode Statistics Improvements**
  - Fixed checkmark display when one algorithm fails to find target
  - Unreachable algorithm shows ⚠️ warning icon (not compared)
  - Reachable algorithm shows ✓ checkmark (wins by default)
  - All metrics (Time, Nodes, Path) now pass unreachable flags
- [x] **First Paint Experience Improvement**
  - Maze dropdown now always shows a valid maze type (no placeholder)
  - Random maze type selected on app initialization
  - Auto-generates maze on mount with 300ms delay (ensures DOM ready)
  - Creates engaging first impression with pre-filled maze
- [x] **Start/Finish Node Positioning**
  - Start Node: Top-left corner (row 1, col 1)
  - Finish Node: Exact center of grid (rows/2, cols/2)
  - Positions reset automatically when grid dimensions change via resizeGrid
  - Safe bounds checking for edge cases (small grids)
- [ ] **Run History Section (Page 3)**
  - Create a 3rd Scroll-Snap Section below Statistics
  - Implement `HistorySection` component with glassmorphism design
  - Store past runs (Algorithm, Time, Cost, Result, Timestamp) in `localStorage`
  - Display history in a sortable table with filters
  - "Replay" button to restore and re-run previous configurations
  - "Export" functionality to save history as JSON
  - "Clear History" with confirmation modal

---

## Current Features

### ✅ Working Features

**Grid System:**

- Dynamic grid rendering (20×30 default)
- **Auto-scaling nodes** (ResizeObserver calculates optimal size)
- Wall drawing (click/drag)
- Wall erasing (Ctrl/Cmd + click/drag)
- Start/Finish node drag & drop
- Grid resizing via sliders

**Pathfinding Algorithms:**

- Dijkstra's Algorithm
- A\* Search (Manhattan distance heuristic)
- Greedy Best-First Search (heuristic-only, no shortest path guarantee)
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Bidirectional BFS (Swarm) - searches from both ends
- Bidirectional A\* - combines heuristics with bidirectional search
- Jump Point Search (JPS) - optimized A\* that skips intermediate nodes

**Maze Generation:**

- Recursive Division
- Randomized DFS (Recursive Backtracker)
- Prim's Algorithm (randomized MST)
- Spiral Pattern (concentric rings)
- Cellular Automata (cave-like organic patterns)

**Race Mode:**

- Dual algorithm comparison
- Agent 1: Blue→Purple (visited), Yellow (path)
- Agent 2: Orange→Red (visited), Cyan (path)
- Overlap: Lime Green (shared path nodes)
- **Improved statistics when one algorithm fails**

**UI Controls:**

- Algorithm selection dropdown
- Algorithm selection dropdown (with dynamic filtering in Hidden Target Mode)
- Maze type selection dropdown
- Speed slider (1-50ms)
- Grid size sliders
- Visualize/Race buttons
- Clear Path, Reset Board, Clear Walls buttons
- Mobile hamburger menu with slide-over drawer
- Toast notifications for edge cases
- Hidden Target Mode toggle (🕵️ Fog of War)

**Benchmarking System:**

- Web Worker isolation for scientific timing precision
- Adaptive sampling (1 second minimum duration)
- JIT warm-up (3 iterations before measurement)
- Concurrent benchmark support via request IDs
- Automatic fallback to main-thread timing

### ⚠️ Known Limitations

- Race Mode path overlap uses simple lime green color (no direction-aware split visualization)

---

## File Structure

```
src/
├── App.tsx                              (223 lines) - Main app with lazy loading + Suspense
├── App.module.css                       (301 lines) - Responsive layout + stats loading fallback
├── main.tsx                             (14 lines) - React entry point
├── vite-env.d.ts                        (27 lines) - Vite type declarations
vite.config.ts                           (60 lines) - Build config with manual chunk splitting
├── algorithms/
│   ├── maze/
│   │   ├── cellularAutomata.ts          (403 lines) - Cellular automata maze (Game of Life)
│   │   ├── prims.ts                     (285 lines) - Prim's maze (randomized MST)
│   │   ├── randomizedDFS.ts             (186 lines) - Randomized DFS maze
│   │   ├── recursiveDivision.ts         (209 lines) - Recursive Division maze
│   │   └── spiralMaze.ts                (265 lines) - Spiral pattern maze
│   └── pathfinding/
│       ├── astar.ts                     (190 lines) - A* algorithm
│       ├── bfs.ts                       (142 lines) - Breadth-First Search
│       ├── bidirectionalAStar.ts        (342 lines) - Bidirectional A* search
│       ├── bidirectionalBFS.ts          (186 lines) - Bidirectional BFS (Swarm)
│       ├── dfs.ts                       (149 lines) - Depth-First Search
│       ├── dijkstra.ts                  (145 lines) - Dijkstra's algorithm
│       ├── greedyBestFirst.ts           (184 lines) - Greedy Best-First Search
│       └── jumpPointSearch.ts           (342 lines) - Jump Point Search (JPS)
├── components/
│   ├── Board/
│   │   ├── Board.tsx                    (336 lines) - Grid renderer with touch support
│   │   ├── Board.module.css             (44 lines) - Grid styles
│   │   └── index.ts                     (2 lines) - Barrel export
│   ├── Controls/
│   │   ├── Accordion.tsx                (87 lines) - Reusable collapsible section
│   │   ├── Accordion.module.css         (105 lines) - Accordion animations/styles
│   │   ├── ControlPanel.tsx             (458 lines) - Sidebar with accordion groups
│   │   ├── ControlPanel.module.css      (413 lines) - Professional dark theme styles
│   │   └── index.ts                     (1 line) - Barrel export
│   ├── Legend/
│   │   ├── Legend.tsx                   (67 lines) - Color legend component
│   │   ├── Legend.module.css            (97 lines) - Legend styles
│   │   └── index.ts                     (1 line) - Barrel export
│   ├── Modals/
│   │   └── StatsModal/
│   │       ├── StatsModal.tsx           (130 lines) - Statistics modal (legacy)
│   │       ├── StatsModal.module.css    (182 lines) - Modal styles
│   │       └── index.ts                 (2 lines) - Barrel export
│   ├── Statistics/
│   │   ├── StatBar.tsx                  (263 lines) - Comparison bars with tie/unreachable states
│   │   ├── StatBar.module.css           (156 lines) - Progress bars + error/tie styling
│   │   ├── StatisticsSection.tsx        (297 lines) - Analytics Dashboard with failure handling
│   │   ├── StatisticsSection.module.css (488 lines) - Responsive 3→1 column layout
│   │   └── index.ts                     (1 line) - Barrel export
│   ├── Node/
│   │   ├── NodeComponent.tsx            (104 lines) - Grid cell with touch support
│   │   ├── Node.module.css              (265 lines) - Node styles + animations
│   │   └── index.ts                     (2 lines) - Barrel export
│   └── UI/
│       ├── Toast.tsx                    (80 lines) - Toast notification component
│       └── Toast.module.css             (71 lines) - Slide-up animation styles
├── context/
│   └── GridContext.tsx                  (255 lines) - Global state + toast management
├── hooks/
│   ├── useBenchmarking.ts               (196 lines) - Web Worker benchmark hook
│   └── useVisualization.ts              (929 lines) - Animation system + auto-scroll
├── styles/
│   └── variables.css                    (383 lines) - CSS variables + global animations
├── types/
│   └── index.ts                         (73 lines) - TypeScript interfaces
├── utils/
│   ├── gridUtils.ts                     (305 lines) - Grid helper functions
│   └── pathUtils.ts                     (10 lines) - Path utilities (placeholder)
└── workers/
    └── benchmark.worker.ts              (200 lines) - Isolated timing Web Worker
```

**Total: 49 files, ~9,596 lines of code**

---

## Implementation Statistics

| Category   | Files  | Lines of Code |
| ---------- | ------ | ------------- |
| App Core   | 4      | 565           |
| Config     | 1      | 60            |
| Components | 22     | 3,123         |
| Algorithms | 13     | 2,493         |
| Context    | 1      | 255           |
| Hooks      | 2      | 1,125         |
| Styles     | 1      | 383           |
| Types      | 1      | 73            |
| Utils      | 2      | 315           |
| Workers    | 1      | 200           |
| **Total**  | **49** | **~9,596**    |

---

## Technical Architecture

| Component        | Technology      | Purpose                            |
| ---------------- | --------------- | ---------------------------------- |
| Build Tool       | Vite 5          | Fast HMR, ESM support              |
| UI Library       | React 18        | Component-based UI                 |
| Language         | TypeScript 5    | Type safety                        |
| State            | React Context   | Global grid state                  |
| Performance      | React.memo      | Custom comparison, skips fn refs   |
| Code Split       | React.lazy      | Lazy load StatisticsSection        |
| Bundling         | Rollup chunks   | vendor-react/algorithms/statistics |
| **Benchmarking** | **Web Workers** | **Isolated timing (zero UI jank)** |
| Layout           | CSS Scroll Snap | Two-page vertical scroll           |
| Grid             | CSS Grid        | Dynamic grid layout                |
| Responsive       | CSS Media Query | Mobile drawer + adaptive grids     |
| Animation        | Direct DOM      | getElementById for 1000+ nodes     |
| Styling          | CSS Modules     | Scoped + global classes            |

---

## Color Palette

| Element           | Color               | Hex             |
| ----------------- | ------------------- | --------------- |
| Unvisited         | White               | #ffffff         |
| Wall              | Dark Grey           | #34495e         |
| Start             | Green               | #4caf50         |
| Finish            | Red                 | #f44336         |
| Visited (Agent 1) | Blue→Purple         | #00bcd4→#9c27b0 |
| Visited (Agent 2) | Orange→Red          | #ff9800→#f44336 |
| Path (Agent 1)    | Yellow              | #ffeb3b         |
| Path (Agent 2)    | Cyan                | #00e5ff         |
| Path Overlap      | Lime Green          | #76ff03         |
| Visited Overlap   | Purple/Red gradient | #9c27b0/#f44336 |

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

## Build Output

```
dist/
├── index.html                      (0.92 kB)
├── benchmark.worker-*.js           (10.63 kB) - Web Worker bundle
├── statistics-*.css                (9.45 kB)
├── index-*.css                     (28.14 kB)
├── statistics-*.js                 (11.25 kB) - Lazy-loaded stats
├── algorithms-*.js                 (16.93 kB) - Pathfinding algorithms
├── index-*.js                      (33.89 kB) - Main bundle
└── vendor-react-*.js               (141.69 kB) - React runtime
```

---

## Notes

- Node size: 25px × 25px (constant)
- Grid bounds: 5-40 rows, 5-60 columns
- Animation: setTimeout-based with DOM classList manipulation
- Race mode uses parallel animation for both agents
- **Web Worker benchmarking** provides rock-solid stable timing metrics
- **Phase F** focuses on advanced simulation scenarios (hidden target/fog of war), algorithm expansion, and data persistence (run history with replay capability)

---

**Last Updated:** December 12, 2025
