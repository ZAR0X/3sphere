<div align="center">
  <h1>🌐 3Sphere</h1>
  <p><strong>An Interactive, High-Performance 3D Entity Particle Sphere built with React Three Fiber</strong></p>
  
  <img src="https://raw.githubusercontent.com/ZAR0X/resources/refs/heads/main/3sphere/ss1.png" alt="3Sphere Dark Mode Preview" width="800" />
  <br />
  <img src="https://raw.githubusercontent.com/ZAR0X/resources/refs/heads/main/3sphere/ss2.png" alt="3Sphere Light Mode Preview" width="800" />
</div>

<br />

A stunning, highly scalable 3D particle sphere component. Each node in the sphere represents a structural connection or a unique data entity (e.g., team members, social graphs, or network nodes). Hovering over connected entities natively triggers a beautifully animated, glassmorphic data card tracking the specific node in true 3D space!

Live: https://zarox.is-a.dev/3sphere/

## ✨ Features

- **Interactive Node Tracking:** Physically rotating the sphere doesn't break hover effects; custom matrix projections ensure tooltips always lock precisely to their assigned moving particles.
- **Glassmorphic UI Overlay:** Data cards pop up cleanly using `framer-motion` and `@react-three/drei`'s HTML projections.
- **Leva GUI Integration:** Instantly manipulate geometry (particle counts, connection limits), size scalars, colors, and continuous multi-axis rotation speeds in real-time.
- **First-Class Theme Engine:** Natively supports Light & Dark modes. Bi-directional tracking instantly passes Theme overrides down from `App.tsx` directly into the WebGL renderer without dropping frames.
- **Dynamic Scale Guards:** Structurally maps your JSON entities to local indices. If the particle count drops beneath your data pool length, intelligent bounds logic handles the slice safely!


## 🚀 Quick Start

Ensure you have a modern React or Vite environment running.

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

### Core External Libraries
If you're copying `ParticleSphere.tsx` into your own project, ensure you have the required 3D and animation dependencies installed:
```bash
npm install three @react-three/fiber @react-three/drei framer-motion leva lucide-react
```

## 🧩 How to Inject Custom Data

The sphere naturally pulls from `useMockData.ts`. This structure dictates your dataset must follow an array of objects bearing at least a `name` and `role` string formatting (an `id` string is optionally recommended).

### Example Data Integration
Replace the logic in `useMockData.ts` with your API hook, Zustand state, or a standard hardcoded array:

```typescript
export interface Entity {
  id: string;
  name: string;
  role: string;
}

export function useMockData() {
  const customData: Entity[] = [
    { id: "01", name: "System Admin", role: "DevOps Engineer" },
    { id: "02", name: "Network Architect", role: "Infrastructure Manager" }
  ];

  return { 
    entities: customData, 
    json: JSON.stringify(customData, null, 2)
  };
}
```
The internal `ParticleSphere` gracefully accepts the `entities` array and handles random particle assignment and 3D indexing entirely under the hood.


## ⚙️ Tuning and Settings

You have programmatic, runtime control over how the component calculates physical bounds via the `useControls` GUI panel floating in the viewport.

- **`count` (Particles)**: The exact quantity of WebGL `Float32Array` nodes drawn to the buffer.
- **`connectDistance`**: Native WebGL line rendering indices; turning this up establishes significantly denser mesh networks between nearby nodes.
- **`sphereSize` / `particleSize`**: Global scale multipliers directly mapping to the mathematical origins in Local space.
- **`Entity Count`**: Precisely dictate exactly how many of your JSON/Mock Entities represent "hoverable" nodes on the sphere against the raw particle count!

*Note: Custom Hex palettes manually applied inside the Leva UI map directly into the shader without rebuilding geometry instances—saving tons of GPU overhead!*

## TODO
- [ ] Fix Rotation Angle
- [ ] Add more features

## LICENSE
GNU Affero General Public License v3.0