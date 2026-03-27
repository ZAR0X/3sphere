import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import { useMockData } from '../hooks/useMockData'
import { motion, AnimatePresence } from 'framer-motion'

function HologramScene({ 
   count, connectDist, particleSize, 
   initialRotationX, initialRotationY, rotationSpeedX, rotationSpeedY, 
   baseColor, lineColor, members, isDarkMode 
}: any) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  
  // Create a separate Group Ref just to perfectly track the hovered particle
  const trackerRef = useRef<THREE.Group>(null!)

  const circleTexture = useMemo(() => new THREE.TextureLoader().load('/Images/dotTexture.png'), [])

  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  const originalPositions = useMemo(() => new Float32Array(count * 3), [count])
  const targetPositions = useRef<Float32Array>(new Float32Array(count * 3))
  const velocities = useRef<Float32Array>(new Float32Array(count * 3).fill(0))

  const [hoveredEntityIndex, setHoveredEntityIndex] = useState<number | null>(null)

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

  const { lineIndices, lineColors } = useMemo(() => {
    // Default fallback colors based on theme if the default is left untouched
    const defaultParticleColor = isDarkMode ? baseColor : (baseColor === '#00d2ff' ? '#111111' : baseColor)
    const defaultLineColor = isDarkMode ? lineColor : (lineColor === '#535353' ? '#c0c0c0' : lineColor)

    const c1 = new THREE.Color(defaultParticleColor)
    const c2 = c1.clone().offsetHSL(0.05, 0, 0)
    const c3 = c1.clone().offsetHSL(-0.05, 0, 0)
    const palette = [c1, c2, c3]

    const indices: number[] = []
    const lineColorsArr: number[] = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = (1 - Math.sqrt(Math.random())) * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1)
      const radius = 120 + (Math.random() - 0.5) * 5
      const x = Math.cos(theta) * Math.cos(phi) * radius
      const y = Math.sin(phi) * radius
      const z = Math.sin(theta) * Math.cos(phi) * radius

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z
      targetPositions.current[i * 3] = x
      targetPositions.current[i * 3 + 1] = y
      targetPositions.current[i * 3 + 2] = z

      palette[Math.floor(Math.random() * palette.length)].toArray(colors, i * 3)
    }

    const colLine = new THREE.Color(defaultLineColor)
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        if (dx * dx + dy * dy + dz * dz < connectDist * connectDist) {
          indices.push(i, j)
          lineColorsArr.push(
            colLine.r, colLine.g, colLine.b,
            colLine.r, colLine.g, colLine.b
          )
        }
      }
    }

    return { lineIndices: indices, lineColors: new Float32Array(lineColorsArr) }
  }, [count, connectDist, baseColor, lineColor, isDarkMode])

  const linePositions = useMemo(() => new Float32Array(lineIndices.length * 3), [lineIndices])

  // Assign members
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

  // Track elapsed rotation over time
  const timeX = useRef(0)
  const timeY = useRef(0)

  useFrame(({ camera }) => {
    timeX.current += rotationSpeedX
    timeY.current += rotationSpeedY

    // Apply strict combinations of initial configurable degree rotation + continual time rotation
    groupRef.current.rotation.x = (initialRotationX * Math.PI / 180) + timeX.current
    groupRef.current.rotation.y = (initialRotationY * Math.PI / 180) + timeY.current

    if (!pointsRef.current || !linesRef.current) return

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const vec = new THREE.Vector3()
    
    let closestMemberIndex: number | null = null
    let closestDistSq = Infinity

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      vec.set(originalPositions[idx], originalPositions[idx + 1], originalPositions[idx + 2]).project(camera)
      const dx = vec.x - mouse.current.x
      const dy = vec.y - mouse.current.y
      const distSq = dx * dx + dy * dy
      
      const outward = distSq < hoverRadius * hoverRadius ? maxOutward : 0
      
      // If it's a member and within tight hover radius, track it for HTML popup
      if (memberIndexMap[i] && distSq < 0.005) {
         if (distSq < closestDistSq) {
            closestDistSq = distSq
            closestMemberIndex = i
         }
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
    
    if (closestMemberIndex !== hoveredEntityIndex) {
       setHoveredEntityIndex(closestMemberIndex)
    }

    // Explicitly update our tracker group so the HTML dialog accurately sticks to the particle 
    if (hoveredEntityIndex !== null && trackerRef.current) {
       trackerRef.current.position.set(
          pos[hoveredEntityIndex * 3],
          pos[hoveredEntityIndex * 3 + 1],
          pos[hoveredEntityIndex * 3 + 2]
       )
    }

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

  // Set the precise PointsMaterial property: `size` mapped to the destructured `particleSize`
  return (
    <group ref={groupRef} scale={1} position-y={0}>
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

      {/* Tracked HTML Overlay for hovering */}
      <group ref={trackerRef}>
         {hoveredEntityIndex !== null && (
            <Html
              position={[0, 0, 0]}
              center
              zIndexRange={[100, 0]}
              className="pointer-events-none"
            >
              <AnimatePresence>
                 {hoveredEntityIndex !== null && (
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
                           {memberIndexMap[hoveredEntityIndex].name}
                        </span>
                        <span className={`text-[10px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                           {memberIndexMap[hoveredEntityIndex].role}
                        </span>
                      </div>
                    </motion.div>
                 )}
              </AnimatePresence>
            </Html>
         )}
      </group>

    </group>
  )
}

export default function ParticleSphere({ isDarkMode }: { isDarkMode: boolean }) {
  const { entities, json } = useMockData();

  // Define Leva controls
  const { 
    count, 
    connectDistance, 
    particleSize, 
    initialRotationX,
    initialRotationY,
    rotationSpeedX, 
    rotationSpeedY,
    baseColor,
    lineColor
  } = useControls('Sphere Settings', {
    Geometry: folder({
      count: { value: 600, min: 100, max: 2000, step: 10 },
      connectDistance: { value: 25, min: 10, max: 80, step: 1 },
      particleSize: { value: 1.5, min: 0.1, max: 20, step: 0.1 },
    }),
    Motion: folder({
      initialRotationX: { value: 0, min: 0, max: 360, step: 1, label: "Initial Angle X°" },
      initialRotationY: { value: 0, min: 0, max: 360, step: 1, label: "Initial Angle Y°" },
      rotationSpeedX: { value: 0.0005, min: -0.05, max: 0.05, step: 0.0001, label: "Speed X" },
      rotationSpeedY: { value: 0.002, min: -0.05, max: 0.05, step: 0.0001, label: "Speed Y" },
    }),
    Colors: folder({
      baseColor: '#00d2ff',
      lineColor: '#535353',
    })
  });

  // Display JSON in Leva
  useControls('Mock Data Source', {
     data: {
        value: json,
        editable: false,
        label: "JSON",
        rows: 15
     }
  });

  // Scale guard boundary overlay
  if (count < entities.length) {
     throw new Error("Particles count must be high then entities count");
  }

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 350], fov: 50 }}>
        <ambientLight intensity={isDarkMode ? 0.5 : 1.5} />
        <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 2} />
        {/* Pass complex key so altering connection limits forcefully rebuilds WebGL buffers */}
        <HologramScene 
          key={`${count}-${connectDistance}`}
          count={count} 
          connectDist={connectDistance} 
          particleSize={particleSize} 
          initialRotationX={initialRotationX}
          initialRotationY={initialRotationY}
          rotationSpeedX={rotationSpeedX}
          rotationSpeedY={rotationSpeedY}
          baseColor={baseColor}
          lineColor={lineColor}
          members={entities} 
          isDarkMode={isDarkMode}
        />
      </Canvas>
    </div>
  )
}
