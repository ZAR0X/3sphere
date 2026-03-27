import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import { useMockData } from '../hooks/useMockData'
import { motion, AnimatePresence } from 'framer-motion'

function HologramScene({ 
   count, connectDist, particleSize, sphereSize,
   rotationSpeedX, rotationSpeedY, 
   baseColor, lineColor, members, isDarkMode 
}: any) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const trackersRef = useRef<Map<number, THREE.Group>>(new Map())

  const circleTexture = useMemo(() => new THREE.TextureLoader().load('/Images/dotTexture.png'), [])


  {console.log(members.length)}
  // ---------- 1. Static Geometry Arrays ----------
  const { positions, originalPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const orig = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = (1 - Math.sqrt(Math.random())) * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1)
      const radius = 120 + (Math.random() - 0.5) * 5
      const x = Math.cos(theta) * Math.cos(phi) * radius
      const y = Math.sin(phi) * radius
      const z = Math.sin(theta) * Math.cos(phi) * radius
      
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      orig[i * 3] = x
      orig[i * 3 + 1] = y
      orig[i * 3 + 2] = z
    }
    return { positions: pos, originalPositions: orig }
  }, [count])

  const targetPositions = useRef<Float32Array>(new Float32Array(count * 3))
  const velocities = useRef<Float32Array>(new Float32Array(count * 3).fill(0))

  useEffect(() => {
    targetPositions.current.set(originalPositions)
    velocities.current.fill(0)
  }, [originalPositions])

  // ---------- 2. Colors ----------
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  
  useEffect(() => {
     const c1 = new THREE.Color(baseColor)
     const c2 = c1.clone().offsetHSL(0.05, 0, 0)
     const c3 = c1.clone().offsetHSL(-0.05, 0, 0)
     const palette = [c1, c2, c3]
     
     for (let i = 0; i < count; i++) {
        palette[Math.floor(Math.random() * palette.length)].toArray(colors, i * 3)
     }
     if (pointsRef.current) {
        pointsRef.current.geometry.attributes.color.needsUpdate = true
     }
  }, [count, baseColor])

  // ---------- 3. Connective Lines ----------
  const { lineIndices, linePositions } = useMemo(() => {
    const indices: number[] = []
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        if (dx * dx + dy * dy + dz * dz < connectDist * connectDist) {
          indices.push(i, j)
        }
      }
    }
    return { 
       lineIndices: indices, 
       linePositions: new Float32Array(indices.length * 3) 
    }
  }, [count, connectDist, positions])

  const lineColors = useMemo(() => new Float32Array(lineIndices.length * 3), [lineIndices])

  useEffect(() => {
     const lCol = new THREE.Color(lineColor)
     for (let i = 0; i < lineColors.length; i += 3) {
        lineColors[i] = lCol.r; lineColors[i + 1] = lCol.g; lineColors[i + 2] = lCol.b
     }
     if (linesRef.current && linesRef.current.geometry.attributes.color) {
        linesRef.current.geometry.attributes.color.needsUpdate = true
     }
  }, [lineIndices.length, lineColor])

  // ---------- Members & Interactions ----------
  const memberIndexMap = useMemo(() => {
    const indices = Array.from({ length: count }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const map: Record<number, any> = {}
    members.forEach((entity: any, idx: number) => {
      const particleIndex = indices[idx]
      map[particleIndex] = entity
    })
    return map
  }, [count, members])

  const [hoveredEntityIndices, setHoveredEntityIndices] = useState<number[]>([])
  const mouse = useRef({ x: 0, y: 0 })
  const hoverRadius = 0.15
  const maxOutward = 20

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const timeX = useRef(0)
  const timeY = useRef(0)

  useFrame(({ camera }) => {
    timeX.current += rotationSpeedX
    timeY.current += rotationSpeedY

    groupRef.current.rotation.x = timeX.current
    groupRef.current.rotation.y = timeY.current

    // Explicitly update matrices so interactions align natively with rotations and scale
    groupRef.current.updateMatrixWorld()

    if (!pointsRef.current || !linesRef.current) return

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const vec = new THREE.Vector3()
    
    let newHoveredIndices: number[] = []

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      
      // Calculate TRUE World Coordinates mapping against the rotating/scaling group matrix
      vec.set(originalPositions[idx], originalPositions[idx + 1], originalPositions[idx + 2])
      vec.applyMatrix4(groupRef.current.matrixWorld)
      vec.project(camera)

      const dx = vec.x - mouse.current.x
      const dy = vec.y - mouse.current.y
      const distSq = dx * dx + dy * dy
      
      const outward = distSq < hoverRadius * hoverRadius ? maxOutward : 0
      
      const dxOrigin = pos[idx] - originalPositions[idx]
      const dyOrigin = pos[idx + 1] - originalPositions[idx + 1]
      const dzOrigin = pos[idx + 2] - originalPositions[idx + 2]
      const distFromOriginSq = dxOrigin * dxOrigin + dyOrigin * dyOrigin + dzOrigin * dzOrigin
      
      if (memberIndexMap[i] && distFromOriginSq > 100.0) {
         newHoveredIndices.push(i)
      }

      const dir = new THREE.Vector3(originalPositions[idx], originalPositions[idx + 1], originalPositions[idx + 2]).normalize()
      const targetX = originalPositions[idx] + dir.x * outward
      const targetY = originalPositions[idx + 1] + dir.y * outward
      const targetZ = originalPositions[idx + 2] + dir.z * outward

      velocities.current[idx] += (targetX - targetPositions.current[idx]) * 0.1
      velocities.current[idx + 1] += (targetY - targetPositions.current[idx + 1]) * 0.1
      velocities.current[idx + 2] += (targetZ - targetPositions.current[idx + 2]) * 0.1

      velocities.current[idx] *= 0.85
      velocities.current[idx + 1] *= 0.85
      velocities.current[idx + 2] *= 0.85

      targetPositions.current[idx] += velocities.current[idx]
      targetPositions.current[idx + 1] += velocities.current[idx + 1]
      targetPositions.current[idx + 2] += velocities.current[idx + 2]

      pos[idx] = targetPositions.current[idx]
      pos[idx + 1] = targetPositions.current[idx + 1]
      pos[idx + 2] = targetPositions.current[idx + 2]
    }
    
    let isChanged = false
    if (newHoveredIndices.length !== hoveredEntityIndices.length) {
       isChanged = true
    } else {
       for (let i = 0; i < newHoveredIndices.length; i++) {
          if (newHoveredIndices[i] !== hoveredEntityIndices[i]) {
             isChanged = true
             break
          }
       }
    }
    
    if (isChanged) {
       setHoveredEntityIndices(newHoveredIndices)
    }

    hoveredEntityIndices.forEach(index => {
       const tracker = trackersRef.current.get(index)
       if (tracker) {
          tracker.position.set(pos[index * 3], pos[index * 3 + 1], pos[index * 3 + 2])
       }
    })

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    
    for (let i = 0, k = 0; i < lineIndices.length; i += 2) {
      const a = lineIndices[i] * 3
      const b = lineIndices[i + 1] * 3
      linePositions[k++] = pos[a]
      linePositions[k++] = pos[a + 1]
      linePositions[k++] = pos[a + 2]
      linePositions[k++] = pos[b]
      linePositions[k++] = pos[b + 1]
      linePositions[k++] = pos[b + 2]
    }

    const attr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute
    attr.array = linePositions
    attr.needsUpdate = true
  })

  return (
    <group ref={groupRef} scale={sphereSize} position-y={0}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={particleSize} vertexColors sizeAttenuation map={circleTexture} transparent alphaTest={0.5} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={lineColors.length / 3} array={lineColors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={isDarkMode ? 0.3 : 0.8} />
      </lineSegments>

      {/* Render Tracked HTML Overlays for all hovered members */}
      {hoveredEntityIndices.map(index => (
         <group 
           key={index} 
           ref={(el) => {
              if (el) trackersRef.current.set(index, el)
              else trackersRef.current.delete(index)
           }}
         >
            <Html
              position={[0, 0, 0]}
              center
              zIndexRange={[100, 0]}
              className="pointer-events-none"
            >
              <AnimatePresence>
                 <motion.div
                   initial={{ opacity: 0, scale: 0.8, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: -25 }}
                   exit={{ opacity: 0, scale: 0.8, y: 0 }}
                   className={`relative px-4 py-2 rounded-lg backdrop-blur-xl border shadow-xl w-max flex items-center justify-center gap-2 ${
                     isDarkMode 
                       ? 'bg-black/40 border-white/10 text-white shadow-cyan-900/20' 
                       : 'bg-white/40 border-black/10 text-black shadow-zinc-300/40'
                   }`}
                   style={{ boxShadow: isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
                 >
                   {/* Triangle Pointer down to particle */}
                   <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b backdrop-blur-xl ${
                     isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/40 border-black/10'
                   }`} />

                   <div className="flex flex-col">
                     <span className="font-semibold text-[13px] leading-tight flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-black'} animate-pulse`}></span>
                        {memberIndexMap[index].name}
                     </span>
                     <span className={`text-[10px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {memberIndexMap[index].role}
                     </span>
                   </div>
                 </motion.div>
              </AnimatePresence>
            </Html>
         </group>
      ))}

    </group>
  )
}

export default function ParticleSphere({ isDarkMode }: { isDarkMode: boolean }) {
  const { entities, json } = useMockData();

  // Define Leva controls
  const [{ 
    count, 
    connectDistance, 
    particleSize, 
    sphereSize,
    rotationSpeedX, 
    rotationSpeedY,
    baseColor,
    lineColor
  }, set] = useControls('Sphere Settings', () => ({
    Geometry: folder({
      count: { value: 600, min: 100, max: 2000, step: 10 },
      connectDistance: { value: 25, min: 10, max: 80, step: 1 },
      particleSize: { value: 2, min: 0.1, max: 20, step: 0.1 },
      sphereSize: { value: 1, min: 0.5, max: 3, step: 0.1 }
    }),
    Motion: folder({
      rotationSpeedX: { value: 0.0005, min: -0.05, max: 0.05, step: 0.0001, label: "Speed X" },
      rotationSpeedY: { value: 0.002, min: -0.05, max: 0.05, step: 0.0001, label: "Speed Y" },
    }),
    Colors: folder({
      baseColor: '#00d2ff',
      lineColor: '#9a9a9a',
    })
  }));

  // Automatically update Leva interface natively when toggling Application Theme
  useEffect(() => {
     set({
        baseColor: isDarkMode ? '#00d2ff' : '#0a0a0a',
        lineColor: isDarkMode ? '#9a9a9a' : '#a0a0a0'
     })
  }, [isDarkMode, set])

  // Display JSON in Leva
  useControls('Mock Data', {
    Entity: folder({
      count: { value: 100, min: 1, max: 2000, step: 1, label: "count" },
    }),
  });

  // if (count < entities.length) {
  //    throw new Error("Particles count must be high then entities count");
  // }
  {console.log(entities.length)}
  {console.log(entities.slice(0, count).length)}

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 350], fov: 50 }}>
        <ambientLight intensity={isDarkMode ? 0.5 : 1.5} />
        <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 2} />
        <HologramScene 
          key={`${count}-${connectDistance}`}
          count={count} 
          connectDist={connectDistance} 
          particleSize={particleSize}
          sphereSize={sphereSize}
          rotationSpeedX={rotationSpeedX}
          rotationSpeedY={rotationSpeedY}
          baseColor={baseColor}
          lineColor={lineColor}
          members={entities.slice(0, count)} 
          isDarkMode={isDarkMode}
        />
      </Canvas>
    </div>
  )
}
