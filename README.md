# Magic Cube - Interactive 3D Rubik's Cube Tutor

[English](./README.md) | [中文](./README_CN.md)

An interactive web application for learning Rubik's Cube solving methods with real-time 3D visualization. From beginner to advanced, master cube solving through step-by-step animated tutorials.

<p align="center">
  <a href="https://magic-cube-learn.973554752.workers.dev/">🔗 Live Demo</a>
</p>

<p align="center">
  <img src="./screenshots/home.png" alt="Magic Cube Home" width="720" />
</p>
<p align="center">
  <img src="./screenshots/learn.png" alt="Learn Page" width="720" />
</p>

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000.svg)

## ✨ Features

- **3D Visualization** — Real-time WebGL-rendered 3D Rubik's Cube with smooth rotation animations, powered by Three.js and React Three Fiber
- **Multiple Solving Methods** — Three complete methods from beginner to advanced:
  - **Layer-by-Layer** — The most beginner-friendly method, solve the cube one layer at a time
  - **CFOP** — The most popular speedcubing method (Cross → F2L → OLL → PLL)
  - **Roux** — An advanced method using bridges and LSE for fewer moves
- **Step-by-Step Learning** — Each formula includes:
  - Pre-configured initial cube state for accurate demonstration
  - Animated playback with move-by-move highlighting
  - Written explanations and tips for each step
  - Formula search for quick lookup in large step groups
- **Playback Controls** — Play/pause, step forward/backward, speed control (0.5x / 1x / 2x), and replay
- **Free Practice Mode** — Scramble, reset, and practice moves with an operation queue that supports rapid input
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| 3D Engine | Three.js + @react-three/fiber + @react-three/drei |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| State Management | Zustand |
| Routing | Wouter |
| Linting | Oxlint |
| Testing | Vitest |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/dgqi/magic-cube-learn-web.git
cd magic-cube

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run tests
npx vitest
```

## 📖 Usage

1. **Home Page** — Browse available solving methods and select one that matches your skill level
2. **Learn Mode** — Navigate through step groups and individual formulas:
   - Click a step group in the sidebar to expand it
   - Select a formula to see the cube set to its initial state
   - Click **Play** to watch the animated solution
   - Use **Forward/Back** buttons for step-by-step review
   - Adjust animation speed with the speed control
3. **Free Practice** — Experiment freely:
   - Click **Scramble** to randomize the cube
   - Use the move buttons (U, U', U2, D, D', etc.) to manipulate the cube
   - Rapid clicks are queued and executed in order
   - Drag to rotate the viewing angle

## 🧩 Architecture

```
src/
├── components/cube/    # 3D cube rendering components
│   ├── Cube3D.tsx      # Core 3D cube model
│   ├── CubeScene.tsx   # Scene wrapper with camera & controls
│   └── Cubie.tsx       # Individual cubie with face colors
├── engine/             # Cube logic engine
│   ├── cube.ts         # State management & move application
│   ├── moveSpec.ts     # Move operation specifications
│   ├── normalize.ts    # Move notation normalization
│   └── setupBuilder.ts # Initial state generation from inverse algorithms
├── methods/            # Solving method definitions
│   ├── layerByLayer.ts # Layer-by-Layer method (beginner)
│   ├── cfop.ts         # CFOP method (intermediate)
│   └── roux.ts         # Roux method (advanced)
├── pages/              # Application pages
│   ├── HomePage.tsx    # Method selection & landing page
│   ├── LearnPage.tsx   # Interactive tutorial page
│   └── PlayPage.tsx    # Free practice mode
├── store/              # Global state (Zustand)
└── types/              # TypeScript type definitions
```

## 🎨 Color Scheme

The cube follows the standard WCA color scheme with **Yellow on top (UP)** and **White on bottom (DOWN)**:

| Face | Color |
|------|-------|
| Up (U) | Yellow |
| Down (D) | White |
| Front (F) | Green |
| Back (B) | Blue |
| Right (R) | Red |
| Left (L) | Orange |

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs via [Issues](https://github.com/your-username/magic-cube/issues)
- Submit pull requests for new features or bug fixes
- Add new solving methods or formulas
- Improve translations

### Development Guidelines

- Follow the existing TypeScript types and naming conventions
- All new formulas must include correct `setupState` (generated via inverse algorithm)
- Run `npx vitest` to verify all tests pass before submitting
- Ensure responsive design works across screen sizes

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Cube solving methods referenced from established speedcubing community resources
- Built with [React Three Fiber](https://github.com/pmndrs/react-three-fiber) for declarative 3D
- Icons by [Lucide](https://lucide.dev/)

---

<p align="center">
  <b>Magic Cube</b> — Making cube solving accessible to everyone 🧊
</p>
