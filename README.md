# FlowCraft

A production-grade with clean architecture and specialized node types for data flow visualization.

## Features

- **Infinite Canvas**: Pan, zoom, and navigate a large workspace
- **Node Types**: Specialized nodes with connection rules
  - **Initial Node**: No inputs, multiple outputs (starting point)
  - **Transform Node**: One input, one output (data transformation)
  - **Branch Node**: One input, multiple outputs (data splitting)
  - **Join Node**: Multiple inputs, one output (data merging)
  - **Output Node**: Multiple inputs, no outputs (end point)
- **Interactive Edges**: Animated connections with labels
- **Smart Connections**: Automatic validation based on node types
- **Proximity Snapping**: Visual feedback when connecting nodes
- **Copy/Paste**: Duplicate selected nodes and their connections
- **Mini Map**: Overview of the entire flow
- **Controls**: Zoom, fit view, and navigation controls

## Project Structure

```
src/
├── components/
│   ├── Canvas/          # Main canvas component with event handling
│   ├── Controls/        # Toolbar, controls, and status bar
│   ├── Edge/            # Edge rendering and connection logic
│   ├── Handle/          # Connection points on nodes
│   ├── MiniMap/         # Overview minimap
│   └── Node/            # Node rendering and interaction
├── hooks/
│   ├── useConnect.jsx   # Connection state management
│   ├── useDrag.jsx      # Node dragging logic
│   └── useViewport.jsx  # Pan and zoom functionality
├── store/
│   └── flowStore.jsx    # Zustand-style state management with reducer
└── utils/
    └── utils.jsx        # Utility functions and node rules
```

## Architecture

- **State Management**: Custom reducer-based store with React Context
- **Modular Components**: Separated concerns for maintainability
- **TypeScript**: Type-safe development with modern React patterns
- **Vite**: Fast development and optimized builds

## Node Connection Rules

| Node Type   | Max Inputs | Max Outputs | Description |
|-------------|------------|-------------|-------------|
| Initial     | 0          | ∞           | Starting point, no incoming connections |
| Transform   | 1          | 1           | Single data transformation step |
| Branch      | 1          | ∞           | Split data into multiple paths |
| Join        | ∞          | 1           | Merge multiple data streams |
| Output      | ∞          | 0           | End point, no outgoing connections |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Usage

```jsx
import { FlowProvider } from './src/store/flowStore';
import { Canvas } from './src/components/Canvas/Canvas';

function App() {
  return (
    <FlowProvider>
      <div style={{ width: '100%', height: '600px' }}>
        <Canvas />
      </div>
    </FlowProvider>
  );
}
```

## Keyboard Shortcuts

- **Delete/Backspace**: Delete selected nodes/edges
- **Ctrl+C/Cmd+C**: Copy selected nodes
- **Ctrl+V/Cmd+V**: Paste copied nodes
- **Ctrl+D/Cmd+D**: Duplicate selected nodes
- **Double-click canvas**: Add new node
- **Double-click node**: Rename node
- **Scroll wheel**: Zoom in/out
- **Drag canvas**: Pan view

## Screenshots

<img width="1512" height="828" alt="Screenshot 2026-04-19 at 1 42 57 AM" src="https://github.com/user-attachments/assets/6348f41d-df06-4fc0-80e7-d58556940710" />

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
