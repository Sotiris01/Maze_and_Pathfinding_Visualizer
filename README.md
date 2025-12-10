# Maze & Pathfinding Visualizer

An interactive web application that visualizes pathfinding and maze generation algorithms. Watch algorithms explore grids and find the shortest path in real-time!

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Pathfinding Algorithms
- **Dijkstra's Algorithm** - Guarantees the shortest path
- *A\* Search* - Coming soon
- *BFS/DFS* - Coming soon

### Maze Generation
- **Recursive Division** - Creates structured mazes with chambers
- **Randomized DFS** - Creates organic, winding mazes (Recursive Backtracker)

### Interactive Grid
- 🖱️ **Draw walls** - Click and drag to create obstacles
- 🧹 **Erase walls** - Ctrl/Cmd + click to remove walls
- 🟢 **Drag Start node** - Reposition the starting point
- 🔴 **Drag Finish node** - Reposition the destination
- 📏 **Resize grid** - Adjust rows (5-40) and columns (5-60)
- ⚡ **Speed control** - Adjust animation speed

## 🚀 Live Demo

Visit: [Coming Soon - Deploy to Vercel/Netlify]

## 📸 Screenshots

*Screenshots coming soon*

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript 5
- **Build Tool:** Vite 5
- **Styling:** CSS Modules with CSS Grid layout
- **State Management:** React Context API
- **Animation:** Direct DOM manipulation for performance (1000+ nodes)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/maze-pathfinding-visualizer.git

# Navigate to project directory
cd maze-pathfinding-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── algorithms/
│   ├── pathfinding/
│   │   └── dijkstra.ts       # Dijkstra's algorithm implementation
│   └── maze/
│       ├── recursiveDivision.ts  # Recursive Division maze
│       └── randomizedDFS.ts      # Randomized DFS maze
├── components/
│   ├── Board/                # Grid renderer with CSS Grid
│   ├── Node/                 # Individual cell component
│   └── Controls/             # Sidebar control panel
├── context/
│   └── GridContext.tsx       # Global state management
├── hooks/
│   └── useVisualization.ts   # Animation system
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    └── gridUtils.ts          # Grid helper functions
```

## 🎮 How to Use

1. **Select an Algorithm** - Choose Dijkstra from the dropdown
2. **Generate a Maze** (optional) - Select a maze type and click "Generate Maze"
3. **Draw Custom Walls** (optional) - Click and drag on the grid
4. **Visualize!** - Click the "Visualize!" button to watch the algorithm
5. **Clear Path** - Reset the visualization to try again

## 🎨 Color Legend

| Color | Meaning |
|-------|---------|
| ⬜ White | Unvisited node |
| 🟢 Green | Start node |
| 🔴 Red | Finish node |
| ⬛ Dark Grey | Wall |
| 🟣 Purple | Visited node |
| 🟡 Yellow | Shortest path |

## 🔧 Performance Optimizations

- **React.memo** with custom comparator prevents unnecessary re-renders
- **Direct DOM manipulation** for animations bypasses React's reconciliation
- **useRef** for animation state prevents stale closures
- **CSS Grid** for efficient grid layout rendering

## 📝 Roadmap

- [x] Phase A: Grid setup with wall drawing
- [x] Phase B: Dijkstra's algorithm with animation
- [x] Phase C: Maze generation algorithms
- [ ] Phase D: A*, BFS, DFS algorithms
- [ ] Phase E: Statistics, legend, deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Clément Mihailescu's Pathfinding Visualizer](https://github.com/clementmihailescu/Pathfinding-Visualizer)
- Built with ❤️ using React and TypeScript
