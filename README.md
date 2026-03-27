# 3Sphere

An interactive, highly scalable 3D particle sphere component designed for React environments. This project generates connected networks of data-mapped entities, enabling real-time visual adjustments, smooth WebGL interactions, and robust performance via React Three Fiber.

## Features

- **Interactive Nodes:** Hovering over the mapped node clusters reveals dynamic, glassmorphic data tooltips populated natively from your data sources.
- **Leva Integration:** Features a comprehensive GUI to instantly modify physics geometries (particle counts, line distances), colors, scale, and multi-axis rotation speeds.
- **Theme Engine:** Fully supports Light and Dark modes with automatic palette transitions mapping directly into the WebGL renderer.
- **Data Scaling Bounds:** Protected by an inherent error-layer guaranteeing smooth data associations without phantom nodes or exceptions.

## Installation

Ensure you have a React or Vite environment natively running, alongside standard dependencies:

```bash
npm install
npm run dev
```

If you plan to extract the component into another project, you must ensure the following core libraries are installed:

```bash
npm install three @react-three/fiber @react-three/drei framer-motion leva lucide-react
```

## How to Input Custom Data

The repository utilizes a mock data system within `src/hooks/useMockData.ts`. This structure strictly requires your dataset to follow an array consisting of objects bearing at least a `name` and `role` string formatting (an `id` string is optionally recommended).

### Example Data Integration
Replace the local output in `useMockData.ts` with your API hook, state, or standard array data. 

```typescript
export interface Entity {
  id: string;
  name: string;
  role: string;
}

// Ensure the array of Entities matches your Particle count requirement.
export function useMockData() {
  const customData: Entity[] = [
    { id: "01", name: "System Admin", role: "DevOps" },
    { id: "02", name: "Network Architect", role: "Infrastructure" }
  ];

  return { 
    entities: customData, 
    json: JSON.stringify(customData, null, 2)
  };
}
```

The underlying `ParticleSphere` will naturally map the length of `entities` against local indices, distributing them procedurally across the sphere's surface based on standard seeded randomization.

## Tuning and Settings

You have programmatic control over how the component handles variables via the `useControls` definitions inside `<ParticleSphere />`.

- **count**: Sets the exact WebGL Buffer counts. The system intentionally throws an exception boundary if `count` falls beneath the length of external `entities`. 
- **connectDistance**: Operates WebGL line rendering indices natively; modifying establishes tighter node networks. 
- **sphereSize / particleSize**: Independent scalars mapping to mathematical origins in Local space.
- **Theme Adjustments**: The Leva UI connects bi-directionally to the App's Theme, dynamically adjusting the colors.

*Note: Custom palettes applied inside `App.tsx` via the Leva UI are overridden by manual Theme manipulation.*
