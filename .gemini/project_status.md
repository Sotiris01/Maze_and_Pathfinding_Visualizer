# Project Status

## Project Overview

| Field             | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Project Name**  | Maze & Pathfinding Visualizer                                                            |
| **Type**          | Web Application (SPA)                                                                    |
| **Tech Stack**    | React 18, TypeScript 5, Vite 5, CSS Modules, Web Workers                                 |
| **Current Phase** | **Phase G: Weighted Terrain & Advanced Algorithms** 🔄 IN PROGRESS                       |
| **Progress**      | Phase A ✅ → Phase B ✅ → Phase C ✅ → Phase D ✅ → Phase E ✅ → Phase F ✅ → Phase G 🔄 |
| **Server**        | ✅ Live at https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/                  |
| **Default Grid**  | 20 rows × 30 columns (600 nodes)                                                         |
| **Repository**    | https://github.com/Sotiris01/Maze_and_Pathfinding_Visualizer                             |

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

### Phase F: Extensions & History ✅ COMPLETE

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
- [x] **Run History Section (Page 3)**
  - 3rd Scroll-Snap Section below Statistics
  - `HistorySection` component with glassmorphism design (purple gradient theme)
  - `RunRecord` interface in `types/index.ts` with full run metadata
  - localStorage persistence via GridContext (max 50 records)
  - Records Single mode and Race mode with winner tracking
  - Displays: Date, Mode badge, Algorithm(s), Grid Size, Time, Path, Visited, Result
  - Delete individual records or clear all history
  - Empty state with animated pulse ring
  - Responsive table with horizontal scroll on mobile

### Phase G: Weighted Terrain & Advanced Algorithms 🔄 IN PROGRESS

- [x] **Weighted Grid Architecture:**

  - [x] Update Node state to support a `weight` property (integer 1-10, where 1 = normal, 10 = impassable wall)
  - [x] Implement `DrawMode` state ('WALL' | 'WEIGHT') to track what the user is painting
  - [x] Add `setDrawMode` function to context for switching between wall and weight painting
  - [x] Create utility functions: `getNewGridWithWeightIncremented`, `getNewGridWithWeightDecremented`, `getNewGridWithWeightSet`
  - [x] Constraint: A node cannot be both a Wall and Weighted (mutually exclusive)

- [x] **Draw Tool UI (Segmented Control):**

  - [x] Add "Draw Tool" segmented control in Settings accordion
  - [x] 🧱 Wall mode - Click/drag to draw impassable walls (toggles on/off)
  - [x] ⚖️ Weight mode - Click to increase weight (1→2→...→9→∞), Right-click to decrease (∞→9→...→1)
  - [x] Dynamic hint text based on current mode
  - [x] Professional styling with gradient active state
  - [x] Weight Mode OFF conversion: weights ≤5 → normal, weights >5 → wall

- [x] **Weighted Visualization (Grayscale Map):**

  - [x] Dynamic CSS styling based on weight values (10-tier grayscale)
  - [x] **Visual Scale:**
    - Weight 1 (Normal): **White** `#ffffff`
    - Weight 2-4 (Light): Light gray shades
    - Weight 5-7 (Medium): Mid gray shades
    - Weight 8-9 (Heavy): Dark gray shades
    - Weight 10 (Wall): **Dark** `#2c3e50` with ∞ symbol
  - [x] Smooth transitions when weights change
  - [x] Weight numbers displayed inside nodes (1-9, ∞ for walls)
  - [x] Hover styles for dark tiles (6-10) maintain visibility

- [x] **Weight Drawing Behavior (Bug Fixes):**

  - [x] Fixed stale closure in memoized NodeComponent using `drawModeRef` synced via `useEffect`
  - [x] WEIGHT mode allows continuous weight increase during drag (repeated over same tile)
  - [x] WALL mode uses `processedNodesRef` to prevent toggle flickering during drag
  - [x] Right-click/Ctrl+click decreases weight (∞→9→...→1)

- [x] **Weighted Algorithm Support:**

  - [x] Updated Dijkstra to use `neighbor.weight` as traversal cost
  - [x] Updated A\* to use `neighbor.weight` in gScore calculation
  - [x] Updated Bidirectional A\* to use `neighbor.weight` for both search directions
  - [x] Cost = node.weight (1 = normal, higher = heavier terrain)

- [x] **Smart Algorithm Filtering (UI Logic):**

  - [x] Added `supportsWeights` property to AlgorithmOption interface
  - [x] Algorithms supporting weights: Dijkstra, A\*, Bidirectional A\*
  - [x] Algorithms NOT supporting weights: BFS, DFS, Greedy Best-First, JPS, Bidirectional BFS
  - [x] When Weight Mode ON: Unweighted algorithms disabled/grayed out with "(Unweighted)" label
  - [x] Helper text: "⚖️ Unweighted algorithms disabled due to terrain"
  - [x] Auto-switch to Dijkstra when enabling Weight Mode if current algorithm is unweighted
  - [x] Race Mode: Both agents follow the same filtering rules

- [x] **Weighted Maze Generation (Terrain Gen):**

  - [x] Implemented pure TypeScript **Perlin Noise** utility (`src/utils/perlinNoise.ts`)
    - 2D Perlin Noise with standard permutation table
    - Fractal Brownian Motion (fBm) for multi-octave terrain
    - Seeded random for reproducible results
    - Zero external dependencies
  - [x] Created terrain map generator (`src/algorithms/maze/terrainMap.ts`)
    - Uses fBm noise for organic terrain features
    - Non-linear weight mapping (plains common, mountains rare)
    - Radial animation from center for visual effect
    - Configurable frequency, octaves, persistence, intensity
  - [x] Added `MazeType.TERRAIN_MAP` to enum
  - [x] Added "Terrain (Perlin Noise)" option to Maze Dropdown
  - [x] Integrated terrain animation in `useVisualization.ts`
    - Batch processing for smooth animation
    - DOM class updates for weight visualization
    - React state sync on completion

- [x] **Terrain Generation UI Controls:**

  - [x] Terrain Smoothness dropdown (smooth/medium/rough/jagged)
  - [x] Peak Intensity slider (0.3-1.2 range)
    - Lower values = more peaks (weight 10 tiles)
    - Higher values = more valleys (weight 1 tiles)
    - Displays percentage label "Peak Intensity: X%"
    - Power curve bias controls weight distribution

- [x] **Weighted Path Length Calculation:**

  - [x] Path length now sums tile weights (not just tile count)
  - [x] Added `calculateWeightedPathLength()` utility in `pathUtils.ts`
  - [x] Race mode winner determined by lowest weighted path cost
  - [x] Statistics display weighted path length

- [x] **New Visualization Color Scheme:**

  - [x] Agent 1 (A1): Blue theme
    - Visited: Blue glow (`#2196F3`)
    - Path: Super-blue fill (`#1565C0`) with dark border
  - [x] Agent 2 (A2): Yellow theme
    - Visited: Yellow glow (`#FFEB3B`)
    - Path: Super-yellow fill (`#fdd835`) with amber border
  - [x] Overlap: Green theme
    - Visited: Green glow (`#4CAF50`)
    - Path: Super-green fill (`#43a047`) with dark green border
  - [x] Brightness/glow approach preserves terrain visibility
  - [x] Weight labels change color based on path overlay

- [x] **Clear Board Button:**

  - [x] Combined "Clear Walls" and "Clear Weights" into single "Clear Board" button
  - [x] Removes all walls and resets all weights to 1

- [ ] **New Advanced Algorithms:**
  - **Pathfinding:**
    - [ ] **Bellman-Ford Algorithm** - Handles weighted graphs (and negative edges)
      - Relaxes all edges V-1 times
      - Can detect negative cycles
      - Works with weighted terrain
    - [ ] **IDA\* (Iterative Deepening A\*)** - Memory-efficient A\* variant
      - Combines DFS memory efficiency with A\* optimality
      - Uses f-cost threshold that increases each iteration
      - Better for large search spaces
  - **Maze/Terrain Generation:**
    - [ ] **Binary Tree Maze** - Simple, fast maze generation
      - Each cell chooses to carve north or east
      - Creates characteristic diagonal bias
      - Very fast O(n) generation
    - [ ] **Random Terrain Generator** - Procedural weighted terrain
      - Combines multiple noise octaves
      - Creates realistic elevation maps
      - Configurable roughness/smoothness

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

- Dijkstra's Algorithm (supports weighted terrain)
- A\* Search (Manhattan distance heuristic, supports weighted terrain)
- Greedy Best-First Search (heuristic-only, no shortest path guarantee)
- Breadth-First Search (BFS) - unweighted only
- Depth-First Search (DFS) - unweighted only
- Bidirectional BFS (Swarm) - unweighted only, searches from both ends
- Bidirectional A\* - supports weighted terrain, combines heuristics with bidirectional search
- Jump Point Search (JPS) - unweighted only, optimized A\* that skips intermediate nodes

**Maze Generation:**

- Recursive Division
- Randomized DFS (Recursive Backtracker)
- Prim's Algorithm (randomized MST)
- Spiral Pattern (concentric rings)
- Cellular Automata (cave-like organic patterns)
- Terrain Map (Perlin Noise weighted terrain)

**Race Mode:**

- Dual algorithm comparison
- Agent 1: Blue glow (visited), Super-blue fill (path)
- Agent 2: Yellow glow (visited), Super-yellow fill (path)
- Overlap: Green glow (visited), Super-green fill (path)
- Weighted path length comparison (sum of tile weights)
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
├── App.tsx                              (253 lines) - Main app with 3 scroll-snap sections
├── App.module.css                       (301 lines) - Responsive layout + stats loading fallback
├── main.tsx                             (14 lines) - React entry point
├── vite-env.d.ts                        (27 lines) - Vite type declarations
vite.config.ts                           (60 lines) - Build config with manual chunk splitting
├── algorithms/
│   ├── maze/
│   │   ├── cellularAutomata.ts          (403 lines) - Cellular automata maze (Game of Life)
│   │   ├── prims.ts                     (285 lines) - Prim's maze (randomized MST)
│   │   ├── randomizedDFS.ts             (228 lines) - Randomized DFS maze
│   │   ├── recursiveDivision.ts         (209 lines) - Recursive Division maze
│   │   ├── spiralMaze.ts                (330 lines) - Spiral pattern maze
│   │   └── terrainMap.ts                (194 lines) - Perlin Noise terrain generator with intensity
│   └── pathfinding/
│       ├── astar.ts                     (295 lines) - A* algorithm (weighted)
│       ├── bfs.ts                       (171 lines) - Breadth-First Search
│       ├── bidirectionalAStar.ts        (393 lines) - Bidirectional A* search (weighted)
│       ├── bidirectionalBFS.ts          (210 lines) - Bidirectional BFS (Swarm)
│       ├── dfs.ts                       (149 lines) - Depth-First Search
│       ├── dijkstra.ts                  (236 lines) - Dijkstra's algorithm (weighted)
│       ├── greedyBestFirst.ts           (278 lines) - Greedy Best-First Search
│       └── jumpPointSearch.ts           (415 lines) - Jump Point Search (JPS)
├── components/
│   ├── Board/
│   │   ├── Board.tsx                    (415 lines) - Grid renderer with weight mode + touch support
│   │   ├── Board.module.css             (44 lines) - Grid styles
│   │   └── index.ts                     (2 lines) - Barrel export
│   ├── Controls/
│   │   ├── Accordion.tsx                (102 lines) - Reusable collapsible section
│   │   ├── Accordion.module.css         (105 lines) - Accordion animations/styles
│   │   ├── ControlPanel.tsx             (980 lines) - Sidebar with terrain intensity slider
│   │   ├── ControlPanel.module.css      (589 lines) - Professional dark theme + slider styling
│   │   └── index.ts                     (1 line) - Barrel export
│   ├── History/
│   │   ├── HistorySection.tsx           (210 lines) - Run history page component
│   │   └── HistorySection.module.css    (306 lines) - Glassmorphism table styling
│   ├── Legend/
│   │   ├── Legend.tsx                   (80 lines) - Color legend with glow styles
│   │   ├── Legend.module.css            (114 lines) - Legend styles + glow animations
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
│   │   ├── NodeComponent.tsx            (132 lines) - Grid cell with weight display + touch
│   │   ├── Node.module.css              (564 lines) - Node styles + blue/yellow/green color scheme
│   │   └── index.ts                     (2 lines) - Barrel export
│   └── UI/
│       ├── Toast.tsx                    (80 lines) - Toast notification component
│       └── Toast.module.css             (71 lines) - Slide-up animation styles
├── context/
│   └── GridContext.tsx                  (339 lines) - Global state + DrawMode + history
├── hooks/
│   ├── useBenchmarking.ts               (196 lines) - Web Worker benchmark hook
│   ├── useHistory.ts                    (83 lines) - History localStorage hook (deprecated)
│   └── useVisualization.ts              (1161 lines) - Animation system + weighted path length
├── styles/
│   └── variables.css                    (437 lines) - CSS variables + blue/yellow/green animations
├── types/
│   └── index.ts                         (111 lines) - TypeScript interfaces + DrawMode + RunRecord
├── utils/
│   ├── gridUtils.ts                     (427 lines) - Grid helpers + weight functions
│   ├── pathUtils.ts                     (21 lines) - Weighted path length calculation
│   └── perlinNoise.ts                   (183 lines) - Perlin Noise implementation for terrain
└── workers/
    └── benchmark.worker.ts              (201 lines) - Isolated timing Web Worker
```

**Total: 54 files, ~12,867 lines of code**

---

## Implementation Statistics

| Category   | Files  | Lines of Code |
| ---------- | ------ | ------------- |
| App Core   | 4      | 595           |
| Config     | 1      | 60            |
| Components | 24     | 4,721         |
| Algorithms | 14     | 3,171         |
| Context    | 1      | 339           |
| Hooks      | 3      | 1,440         |
| Styles     | 1      | 437           |
| Types      | 1      | 111           |
| Utils      | 3      | 631           |
| Workers    | 1      | 201           |
| **Total**  | **54** | **~12,867**   |

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

| Element           | Color           | Hex     |
| ----------------- | --------------- | ------- |
| Unvisited         | White           | #ffffff |
| Wall              | Dark Grey       | #2c3e50 |
| Weight 1          | Light Cream     | #f5f0e6 |
| Weight 2          | Very Light Gray | #f0f0f0 |
| Weight 3          | Light Gray      | #e0e0e0 |
| Weight 4          | Light-Mid Gray  | #d0d0d0 |
| Weight 5          | Mid Gray        | #b8c6db |
| Weight 6          | Mid-Dark Gray   | #909090 |
| Weight 7          | Dark Gray       | #707070 |
| Weight 8          | Darker Gray     | #505050 |
| Weight 9          | Very Dark Gray  | #383838 |
| Weight 10 (∞)     | Wall Dark       | #64748b |
| Start             | Green           | #4caf50 |
| Finish            | Red             | #f44336 |
| Visited (Agent 1) | Blue Glow       | #2196F3 |
| Visited (Agent 2) | Yellow Glow     | #FFEB3B |
| Path (Agent 1)    | Super-Blue      | #1565C0 |
| Path (Agent 2)    | Super-Yellow    | #fdd835 |
| Path Overlap      | Super-Green     | #43a047 |
| Visited Overlap   | Green Glow      | #4CAF50 |

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
- **Phase G** adds weighted terrain with 10-tier grayscale visualization
- **Weight Mode** uses ref-based state sync to avoid stale closures in memoized components
- MIN_WEIGHT = 1 (normal), MAX_WEIGHT = 10 (displayed as ∞, treated as wall)
- **Path Length** = sum of tile weights (not just tile count)
- **New Color Scheme:** A1=Blue, A2=Yellow, Overlap=Green (brightness/glow approach)
- **Terrain Intensity** slider controls peak frequency (0.3-1.2 power curve)

---

**Last Updated:** December 19, 2025
