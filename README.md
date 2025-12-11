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

## ✨ Features

### 🤖 Pathfinding Algorithms

| Algorithm      | Description                                        | Guarantees Shortest Path |
| -------------- | -------------------------------------------------- | :----------------------: |
| **Dijkstra's** | Classic algorithm exploring nodes by distance      |          ✅ Yes          |
| **A\* Search** | Informed search using Manhattan distance heuristic |          ✅ Yes          |
| **BFS**        | Breadth-First Search - layer by layer exploration  |   ✅ Yes (unweighted)    |
| **DFS**        | Depth-First Search - explores deep before wide     |          ❌ No           |

### 🧩 Maze Generation

| Algorithm              | Style      | Description                                      |
| ---------------------- | ---------- | ------------------------------------------------ |
| **Recursive Division** | Structured | Creates chambers with connecting passages        |
| **Randomized DFS**     | Organic    | Recursive Backtracker - winding, cave-like paths |

### 🏁 Race Mode

Compare two algorithms side-by-side! Watch them compete to find the path first with distinct color schemes:

- **Agent 1:** Blue→Purple visited nodes, Yellow path
- **Agent 2:** Orange→Red visited nodes, Cyan path
- **Overlap:** Lime green for shared path segments

### 🎮 Interactive Controls

- 🖱️ **Draw walls** - Click and drag to create obstacles
- 🧹 **Erase walls** - `Ctrl/Cmd` + click to remove walls
- 🟢 **Drag Start node** - Reposition the starting point
- 🔴 **Drag Finish node** - Reposition the destination
- 📏 **Resize grid** - 5-40 rows × 5-60 columns
- ⚡ **Speed control** - Adjust animation speed (1-50ms)

### 📊 Statistics Dashboard

After each visualization, view detailed metrics:

- Execution time (milliseconds)
- Nodes visited count
- Final path length
- Side-by-side comparison in Race Mode
- **Unreachable target detection** - Shows "Unreachable" when no path exists

### ⚠️ Edge Case Handling

- **Toast Notifications** - Slide-up alerts for path failures
- **Graceful Degradation** - Statistics display "Unreachable" with red indicator
- **Race Mode Support** - Handles cases where one or both algorithms fail

### 🎨 Modern UI

- **Accordion-based Control Panel** - Organized, collapsible sections
- **Two-Page Scroll Layout** - CSS Scroll Snap for smooth navigation
- **Auto-scaling Grid** - Dynamic node sizing with ResizeObserver
- **Dark Theme** - Professional glassmorphism design

---

## 🚀 Live Demo

> **Coming Soon** - Deployment to Vercel/Netlify

---

## 📸 Screenshots

_Screenshots coming soon_

---

## 🛠️ Tech Stack

| Technology        | Purpose                                   |
| ----------------- | ----------------------------------------- |
| **React 18**      | Component-based UI with hooks             |
| **TypeScript 5**  | Type safety and better DX                 |
| **Vite 5**        | Lightning-fast HMR and builds             |
| **CSS Modules**   | Scoped styling with CSS Grid              |
| **React Context** | Global state management                   |
| **Direct DOM**    | High-performance animations (1000+ nodes) |

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

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── algorithms/
│   ├── pathfinding/
│   │   ├── dijkstra.ts          # Dijkstra's algorithm
│   │   ├── astar.ts             # A* with Manhattan heuristic
│   │   ├── bfs.ts               # Breadth-First Search
│   │   └── dfs.ts               # Depth-First Search
│   └── maze/
│       ├── recursiveDivision.ts # Recursive Division maze
│       └── randomizedDFS.ts     # Randomized DFS (Backtracker)
├── components/
│   ├── Board/                   # Grid renderer with CSS Grid
│   ├── Node/                    # Individual cell component
│   ├── Controls/                # Accordion-based sidebar
│   │   ├── Accordion.tsx        # Reusable collapsible section
│   │   └── ControlPanel.tsx     # Main control panel
│   ├── Legend/                  # Color legend component
│   └── Statistics/              # Full-page stats dashboard
├── context/
│   └── GridContext.tsx          # Global state management
├── hooks/
│   └── useVisualization.ts      # Animation system + auto-scroll
├── types/
│   └── index.ts                 # TypeScript interfaces
├── styles/
│   └── variables.css            # CSS variables + animations
└── utils/
    └── gridUtils.ts             # Grid helper functions
```

**📊 Codebase Stats:** ~4,700 lines of code across 34 files

---

## 🧮 Algorithms

### Dijkstra's Algorithm

The classic shortest-path algorithm. Explores nodes in order of increasing distance from the start, guaranteeing the optimal path.

```
Time Complexity: O((V + E) log V) with priority queue
Space Complexity: O(V)
```

### A\* Search

An informed search algorithm combining Dijkstra with a heuristic (Manhattan distance) to prioritize nodes closer to the goal.

```
Time Complexity: O(E) - depends on heuristic quality
Space Complexity: O(V)
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

| Element                 | Color       | Description                    |
| ----------------------- | ----------- | ------------------------------ |
| ⬜ Unvisited            | White       | Unexplored nodes               |
| 🟢 Start                | Green       | Starting position              |
| 🔴 Finish               | Red         | Destination                    |
| ⬛ Wall                 | Dark Grey   | Obstacles                      |
| 🔵→🟣 Visited (Agent 1) | Blue→Purple | Explored by first algorithm    |
| 🟠→🔴 Visited (Agent 2) | Orange→Red  | Explored by second algorithm   |
| 🟡 Path (Agent 1)       | Yellow      | Final path of first algorithm  |
| 🩵 Path (Agent 2)        | Cyan        | Final path of second algorithm |
| 💚 Overlap              | Lime Green  | Shared path nodes in Race Mode |

---

## 🔧 Performance Optimizations

- **React.memo** with custom comparator prevents unnecessary re-renders
- **Direct DOM manipulation** for animations bypasses React's reconciliation
- **useRef** for animation state prevents stale closures
- **CSS Grid** for efficient grid layout rendering
- **ResizeObserver** for dynamic, responsive node sizing
- **CSS Scroll Snap** for smooth two-page navigation

---

## 📋 Roadmap

- [x] **Phase A:** Grid setup with wall drawing & drag-drop
- [x] **Phase B:** Dijkstra's algorithm with animation system
- [x] **Phase C:** Maze generation (Recursive Division, Randomized DFS)
- [x] **Phase D:** A\*, BFS, DFS algorithms + Race Mode
- [x] **Phase E:** Statistics dashboard, Legend, Accordion UI
- [ ] **Phase F:** Responsive design, PWA support, deployment

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
