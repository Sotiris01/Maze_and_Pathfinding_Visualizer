# 🧭 Maze & Pathfinding Visualizer

An interactive web application that visualizes pathfinding and maze generation algorithms. Watch algorithms explore grids, compete in race mode, and find the shortest path in real-time!

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-live-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-algorithms">Algorithms</a> •
  <a href="#-how-to-use">How to Use</a>
</p>

---

## 🚀 Live Demo

**👉 [Try it live on GitHub Pages!](https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/)**

<p align="center">
  <img src="QR.png" alt="QR Code - Scan to open live demo" width="200" />
  <br />
  <sub>📱 Scan to open on mobile</sub>
</p>

---

## ✨ Features

### 🤖 Pathfinding Algorithms

| Algorithm             | Description                                      | Weighted | Guarantees Shortest Path |
| --------------------- | ------------------------------------------------ | :------: | :----------------------: |
| **Dijkstra's**        | Classic algorithm exploring nodes by distance    |  ✅ Yes  |          ✅ Yes          |
| **A\* Search**        | Informed search using Manhattan distance         |  ✅ Yes  |          ✅ Yes          |
| **Bidirectional A\*** | Bidirectional search with A\* heuristics         |  ✅ Yes  |          ✅ Yes          |
| **Greedy Best-First** | Heuristic-only (faster, not always optimal)      |  ❌ No   |          ❌ No           |
| **Bidirectional BFS** | Searches from both start & finish simultaneously |  ❌ No   |   ✅ Yes (unweighted)    |
| **Jump Point Search** | Optimized A\* (10-100x faster in open spaces)    |  ❌ No   |          ✅ Yes          |
| **BFS**               | Breadth-First Search - layer by layer            |  ❌ No   |   ✅ Yes (unweighted)    |
| **DFS**               | Depth-First Search - explores deep before wide   |  ❌ No   |          ❌ No           |

### 🧩 Maze Generation

| Algorithm              | Style      | Description                                       |
| ---------------------- | ---------- | ------------------------------------------------- |
| **Recursive Division** | Structured | Creates chambers with connecting passages         |
| **Randomized DFS**     | Organic    | Recursive Backtracker - winding, cave-like        |
| **Prim's Algorithm**   | Organic    | Randomized MST - creates smooth cave patterns     |
| **Spiral Maze**        | Geometric  | Concentric rings from outside to inside           |
| **Cellular Automata**  | Organic    | Game of Life-inspired chaotic cave generation     |
| **Terrain Map**        | Weighted   | Perlin Noise terrain with configurable intensity  |

### 🏁 Race Mode

Compare two algorithms side-by-side! Watch them compete to find the path first with distinct color schemes:

- **Agent 1:** Blue glow on visited nodes, Super-blue path
- **Agent 2:** Yellow glow on visited nodes, Super-yellow path
- **Overlap:** Green glow for shared visited nodes, Super-green path
- **Winner:** Determined by lowest **weighted path cost** (sum of tile weights)

### 🎮 Interactive Controls

- 🖱️ **Draw walls** - Click and drag to create obstacles
- 🧹 **Erase walls** - `Ctrl/Cmd` + click to remove walls
- ⚖️ **Draw weights** - Switch to Weight Mode to paint terrain (1-10)
- 🟢 **Drag Start node** - Reposition the starting point
- 🔴 **Drag Finish node** - Reposition the destination
- 📏 **Resize grid** - 5-40 rows × 5-60 columns
- ⚡ **Speed control** - Adjust animation speed (1-50ms)
- 🏔️ **Generate Terrain** - Create weighted terrain maps with Perlin Noise

### ⚖️ Weighted Terrain (Phase G)

- **10-tier grayscale visualization** - Weight 1 (white) to Weight 10 (dark)
- **Draw Mode toggle** - Switch between Wall 🧱 and Weight ⚖️ modes
- **Click to increase weight** - Cycles 1→2→...→9→10(∞)
- **Ctrl+click to decrease** - Cycles 10→9→...→1
- **Terrain Map generation** - Perlin Noise creates organic hills & valleys
- **Peak Intensity slider** - Control mountain/valley distribution
- **Weighted path length** - Statistics show sum of tile weights, not just tile count
- **Smart algorithm filtering** - Unweighted algorithms disabled when terrain exists

### 📊 Statistics Dashboard

After each visualization, view detailed metrics:

- Execution time (microseconds with scientific precision)
- Nodes visited count
- **Weighted path length** (sum of tile weights, not just tile count)
- Side-by-side comparison in Race Mode
- **Unreachable target detection** - Shows "Unreachable" with warning
- **Web Worker Benchmarking** - Scientific timing isolated from UI thread
- **Industrial-grade precision** - Adaptive sampling with JIT warm-up iterations

### 🧠 Advanced Features

- **🕵️ Hidden Target Mode** - Fog of war: target hidden until discovered by algorithm
- **🔄 Dynamic Algorithm Filtering** - Heuristic algorithms disabled in Hidden Mode
- **📋 Run History (Page 3)** - Persistent record of all past runs with localStorage
  - Displays execution time, path length, visited count
  - Track winners in Race Mode
  - Delete individual records or clear all history
  - Three-page scroll-snap navigation

### ⚠️ Edge Case Handling

- **Toast Notifications** - Slide-up alerts for path failures
- **Graceful Degradation** - Statistics display "Unreachable" with red indicator
- **Race Mode Support** - Handles cases where one or both algorithms fail
- **One-Algorithm Success** - Shows winner by default if only one finds path

### 🎨 Modern UI

- **Accordion-based Control Panel** - Organized, collapsible sections
- **Two-Page Scroll Layout** - CSS Scroll Snap for smooth navigation
- **Auto-scaling Grid** - Dynamic node sizing with ResizeObserver
- **Dark Theme** - Professional glassmorphism design

### 📱 Responsive Design

- **Desktop (>768px)** - Side-by-side layout with fixed sidebar
- **Tablet (769-1000px)** - Stacked layout with collapsible control panel
- **Mobile (≤768px)** - Hamburger menu with slide-over drawer
- **Touch Support** - Draw walls and drag nodes on touchscreens
- **Adaptive Statistics** - Single-column layout on smaller screens

### ⚡ Performance Optimizations

- **React.memo** with custom comparator prevents unnecessary re-renders
- **React.lazy() + Suspense** for code-split lazy loading
- **Vite manual chunk splitting** - vendor-react (141KB), algorithms (5KB), statistics (11KB)
- **esbuild minification** with console/debugger removal in production
- **Direct DOM manipulation** for animations bypasses React's reconciliation
- **useRef** for animation state prevents stale closures
- **ResizeObserver** for dynamic, responsive node sizing

---

## 🚀 Live Demo

**👉 [Try it live on GitHub Pages!](https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/)**

---

## 📸 Screenshots

_Screenshots coming soon_

---

## 🛠️ Tech Stack

| Technology          | Purpose                                   |
| ------------------- | ----------------------------------------- |
| **React 18**        | Component-based UI with hooks             |
| **TypeScript 5**    | Type safety and better DX                 |
| **Vite 5**          | Lightning-fast HMR and builds             |
| **CSS Modules**     | Scoped styling with CSS Grid              |
| **React Context**   | Global state management                   |
| **React.lazy**      | Code splitting for lazy-loaded components |
| **CSS Scroll Snap** | Smooth two-page vertical navigation       |
| **gh-pages**        | Automated deployment to GitHub Pages      |
| **Direct DOM**      | High-performance animations (1000+ nodes) |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Sotiris01/Maze_and_Pathfinding_Visualizer.git

# Navigate to project directory
cd Maze_and_Pathfinding_Visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🏗️ Build for Production

```bash
# Build the project
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 📁 Project Structure

```
src/
├── algorithms/
│   ├── pathfinding/
│   │   ├── dijkstra.ts              # Dijkstra's algorithm (weighted)
│   │   ├── astar.ts                 # A* with Manhattan heuristic (weighted)
│   │   ├── greedyBestFirst.ts       # Greedy Best-First (heuristic-only)
│   │   ├── bidirectionalBFS.ts      # Bidirectional BFS (Swarm)
│   │   ├── bidirectionalAStar.ts    # Bidirectional A* (weighted)
│   │   ├── jumpPointSearch.ts       # Jump Point Search (JPS)
│   │   ├── bfs.ts                   # Breadth-First Search
│   │   └── dfs.ts                   # Depth-First Search
│   └── maze/
│       ├── recursiveDivision.ts     # Recursive Division maze
│       ├── randomizedDFS.ts         # Randomized DFS (Backtracker)
│       ├── prims.ts                 # Prim's algorithm (MST-based)
│       ├── spiralMaze.ts            # Spiral pattern maze
│       ├── cellularAutomata.ts      # Game of Life-inspired maze
│       └── terrainMap.ts            # Perlin Noise terrain generator
├── components/
│   ├── Board/                       # Grid renderer with CSS Grid + touch support
│   ├── Node/                        # Individual cell with weight display
│   ├── Controls/                    # Accordion-based sidebar
│   │   ├── Accordion.tsx            # Reusable collapsible section
│   │   └── ControlPanel.tsx         # Main control panel with terrain controls
│   ├── Legend/                      # Color legend component
│   ├── History/                     # Run history page (Phase F)
│   │   ├── HistorySection.tsx       # Run history table
│   │   └── HistorySection.module.css# History styling
│   ├── Statistics/                  # Full-page analytics dashboard
│   │   ├── StatBar.tsx              # Animated comparison progress bars
│   │   └── StatisticsSection.tsx    # Metrics grid with IntersectionObserver
│   └── UI/
│       └── Toast.tsx                # Slide-up notification component
├── context/
│   └── GridContext.tsx              # Global state + DrawMode + history
├── hooks/
│   ├── useBenchmarking.ts           # Web Worker benchmarking hook
│   ├── useHistory.ts                # History localStorage hook
│   └── useVisualization.ts          # Animation system + weighted path length
├── types/
│   └── index.ts                     # TypeScript interfaces + DrawMode + RunRecord
├── styles/
│   └── variables.css                # CSS variables + blue/yellow/green animations
├── utils/
│   ├── gridUtils.ts                 # Grid helper functions + weight utilities
│   ├── pathUtils.ts                 # Weighted path length calculation
│   └── perlinNoise.ts               # Perlin Noise implementation for terrain
└── workers/
    └── benchmark.worker.ts          # Isolated timing Web Worker
```

**📊 Codebase Stats:** ~12,867 lines of code across 54 files

---

## 🧮 Algorithms

### Dijkstra's Algorithm

The classic shortest-path algorithm. Explores nodes in order of increasing distance from the start, guaranteeing the optimal path. **Supports weighted terrain.**

```
Time Complexity: O((V + E) log V) with priority queue
Space Complexity: O(V)
Weighted: Yes - uses node.weight as traversal cost
```

### A\* Search

An informed search algorithm combining Dijkstra with a heuristic (Manhattan distance) to prioritize nodes closer to the goal. **Supports weighted terrain.**

```
Time Complexity: O(E) - depends on heuristic quality
Space Complexity: O(V)
Weighted: Yes - gScore includes node weights
```

### Greedy Best-First Search

Heuristic-only search using only Manhattan distance (no actual cost). Faster than A\* but **does not** guarantee shortest path.

```
Time Complexity: O(V + E)
Space Complexity: O(V)
Note: May not find optimal path, explores fewer nodes
```

### Bidirectional BFS

Searches simultaneously from both start and finish, meeting in the middle. Explores roughly half the search space.

```
Time Complexity: O(V + E)
Space Complexity: O(V)
Advantage: ~2x faster than unidirectional BFS
```

### Bidirectional A\*

Combines A\* heuristics with bidirectional search. Each direction uses heuristic pointing to opposite end. **Supports weighted terrain.**

```
Time Complexity: O(E) - depends on heuristic quality
Space Complexity: O(V)
Weighted: Yes - both directions use node weights
Advantage: ~2x faster than unidirectional A\*
```

### Jump Point Search (JPS)

Optimized A\* for uniform-cost grids. "Jumps" over intermediate nodes by examining only forced neighbors.

```
Time Complexity: O(E) - typically 10-100x faster in open spaces
Space Complexity: O(V)
Guarantee: Shortest path like A\*, not faster on dense mazes
```

### Breadth-First Search (BFS)

Explores all nodes at the current depth before moving deeper. Guarantees shortest path in unweighted graphs.

```
Time Complexity: O(V + E)
Space Complexity: O(V)
```

### Depth-First Search (DFS)

Explores as far as possible along each branch before backtracking. Fast but does **not** guarantee shortest path.

```
Time Complexity: O(V + E)
Space Complexity: O(V)
```

---

## 🎮 How to Use

1. **Select an Algorithm** - Choose from the Pathfinding dropdown
2. **Generate a Maze** _(optional)_ - Select a maze type and click "Generate Maze"
3. **Draw Custom Walls** _(optional)_ - Click and drag on the grid
4. **Visualize!** - Click the primary button to watch the algorithm
5. **Enable Race Mode** _(optional)_ - Toggle to compare two algorithms
6. **View Statistics** - Scroll down to see the results dashboard

---

## 🎨 Color Legend

| Element                 | Color        | Description                    |
| ----------------------- | ------------ | ------------------------------ |
| ⬜ Unvisited            | White        | Unexplored nodes               |
| 🟢 Start                | Green        | Starting position              |
| 🔴 Finish               | Red          | Destination                    |
| ⬛ Wall                 | Dark Grey    | Obstacles                      |
| 🔵 Visited (Agent 1)    | Blue Glow    | Explored by first algorithm    |
| 🟡 Visited (Agent 2)    | Yellow Glow  | Explored by second algorithm   |
| 🟢 Visited Overlap      | Green Glow   | Explored by both algorithms    |
| 🔷 Path (Agent 1)       | Super-Blue   | Final path of first algorithm  |
| 🟨 Path (Agent 2)       | Super-Yellow | Final path of second algorithm |
| 💚 Path Overlap         | Super-Green  | Shared path nodes in Race Mode |
| ⬜→⬛ Weight 1-10       | Grayscale    | Terrain difficulty (light=easy)|

---

## 🔧 Performance Optimizations

- **React.memo** with custom `arePropsEqual` comparator skips function reference checks
- **React.lazy() + Suspense** for below-fold StatisticsSection & HistorySection lazy loading
- **Vite manual chunk splitting:**
  - `vendor-react` (141KB gzip: 45KB) - React core, cached separately
  - `algorithms` (17KB gzip: 5KB) - All 13 pathfinding/maze algorithms
  - `statistics` (11KB gzip: 3.4KB) - Lazy-loaded analytics dashboard
  - `history` (5.5KB gzip: 2KB) - Lazy-loaded history page
- **esbuild minification** with automatic console/debugger removal
- **Web Worker Benchmarking** - Scientific timing isolated from UI thread with JIT warm-up
- **Direct DOM manipulation** for animations bypasses React's reconciliation
- **useRef** for animation state prevents stale closures in callbacks
- **CSS Grid** for efficient grid layout rendering
- **ResizeObserver** for dynamic, responsive node sizing
- **CSS Scroll Snap** for smooth three-page navigation

---

## 📋 Roadmap

- [x] **Phase A:** Grid setup with wall drawing & drag-drop
- [x] **Phase B:** Dijkstra's algorithm with animation system
- [x] **Phase C:** Maze generation (Recursive Division, Randomized DFS)
- [x] **Phase D:** A\*, BFS, DFS algorithms + Race Mode
- [x] **Phase E:** Statistics dashboard, Legend, Accordion UI, Toast notifications, Responsive mobile
- [x] **Phase F:** 6 new algorithms, Hidden Target Mode, Web Worker Benchmarking, Run History, GitHub Pages deployment
- [x] **Phase G:** Weighted Terrain System
  - ⚖️ 10-tier weighted nodes with grayscale visualization
  - 🏔️ Perlin Noise terrain map generation
  - 📊 Peak Intensity slider for terrain distribution control
  - 🔢 Weighted path length calculation (sum of tile weights)
  - 🎨 New color scheme: Blue/Yellow/Green for A1/A2/Overlap
  - 🧮 Smart algorithm filtering (disable unweighted algorithms on terrain)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Σωτήρης Μπαλατσιάς / Sotiris Mpalatsias**

- 📧 Email: [sotiris.mp@gmail.com](mailto:sotiris.mp@gmail.com)
- 🐙 GitHub: [@Sotiris01](https://github.com/Sotiris01)

---

## 🙏 Acknowledgments

- Inspired by [Clément Mihailescu's Pathfinding Visualizer](https://github.com/clementmihailescu/Pathfinding-Visualizer)
- Algorithm references from [Wikipedia](https://en.wikipedia.org/wiki/Pathfinding) and academic sources
- Built with ❤️ using React and TypeScript

---

<p align="center">
  <sub>⭐ Star this repo if you found it useful!</sub>
</p>

<p align="center">
  <a href="https://sotiris01.github.io/Maze_and_Pathfinding_Visualizer/">
    <img src="https://img.shields.io/badge/🧭_Try_Live_Demo-GitHub_Pages-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>
