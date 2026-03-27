# 3Sphere: Interactive Entity Particle Sphere

A stunning, interactive 3D particle sphere built with React Three Fiber. Each particle in the sphere represents a connection or an entity, making it perfect for visualizing networks, teams, social graphs, or displaying team members in a highly engaging 3D space.

## Features

- **Entity Visualization**: Automatically maps data objects (entities with a name, role, description, and color) to particles in the sphere.
- **Interactive Hover Effects**: Hovering near a mapped particle reveals a beautiful, glassmorphic card showing the entity's data.
- **Dynamic Controls**: Includes a built-in `Leva` GUI to tweak the scene in real-time:
  - Particle count
  - Particle size
  - Connection distance
  - Base colors for particles and connection lines
  - Rotation speeds
- **Themes**: Full Light and Dark mode support that updates the background, HTML overlays, and scene lighting.

## Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## How it works

The core of the logic resides in `src/three/ParticleSphere.tsx`.

1. **Data Source**: Look at `src/hooks/useMockData.ts`. It provides an array of `Entity` objects. The `ParticleSphere` component takes this array and randomly assigns each entity to a specific particle vertex in the 3D space.
2. **Customization**: The styling of the popup card is handled inside `HologramScene` using `@react-three/drei`'s `Html` block mixed with `framer-motion` for smooth enter/exit animations. Data for the hovered entity is parsed and styled with Tailwind.

## Using in your own project

To integrate this into another React application, simply copy the `ParticleSphere.tsx` and the `useMockData.ts` (or provide your own data source). Ensure you have `@react-three/fiber`, `@react-three/drei`, `three`, `leva`, and `framer-motion` installed.

\`\`\`tsx
import ParticleSphere from './three/ParticleSphere';

function MyDashboard() {
const isDarkMode = true; // or whatever your logic is
return (
<div style={{ width: '100vw', height: '100vh' }}>
<ParticleSphere isDarkMode={isDarkMode} />
</div>
);
}
\`\`\`
