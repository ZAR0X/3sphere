import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import { useMockData } from '../hooks/useMockData'
import { motion, AnimatePresence } from 'framer-motion'

function HologramScene({ count, connectDist, size, rotationSpeedX, rotationSpeedY, baseColor, lineColor, members, isDarkMode }: any) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const circleTexture = useMemo(() => new THREE.TextureLoader().load('/Images/dotTexture.png'), [])

  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  const originalPositions = useMemo(() => new Float32Array(count * 3), [count])
  const targetPositions = useRef<Float32Array>(new Float32Array(count * 3))
  const velocities = useRef<Float32Array>(new Float32Array(count * 3).fill(0))

  const [hoveredEntityIndex, setHoveredEntityIndex] = useState<number | null>(null)

  const meshRef = useRef<Record<number, THREE.Group | null>>({})
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
    // Determine color palette based on baseColor or create some variations
    const c1 = new THREE.Color(baseColor)
    const c2 = c1.clone().offsetHSL(0.1, 0, 0)
    const c3 = c1.clone().offsetHSL(-0.1, 0, 0)
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

    const colLine = new THREE.Color(lineColor)
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
  }, [count, connectDist, baseColor, lineColor, positions, colors])

  const linePositions = useMemo(() => new Float32Array(lineIndices.length * 3), [lineIndices])

  // Assign members randomly to some particles
  const memberIndexMap = useMemo(() => {
    const indices = Array.from({ length: count }, (_, i) => i)
    // Shuffle indices
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

  useFrame(({ camera }) => {
    groupRef.current.rotation.y += rotationSpeedY
    groupRef.current.rotation.x += rotationSpeedX

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

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    
    // Update line positions
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
    <group ref={groupRef} scale={1} position-y={0}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={size} vertexColors sizeAttenuation map={circleTexture} transparent alphaTest={0.5} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={lineColors.length / 3} array={lineColors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={isDarkMode ? 0.3 : 0.6} />
      </lineSegments>

      {/* Render HTML overlays for Entities */}
      {hoveredEntityIndex !== null && (
         <Html
           position={[
              targetPositions.current[hoveredEntityIndex * 3],
              targetPositions.current[hoveredEntityIndex * 3 + 1] + 10,
              targetPositions.current[hoveredEntityIndex * 3 + 2]
           ]}
           center
           zIndexRange={[100, 0]}
         >
           <AnimatePresence>
              {hoveredEntityIndex !== null && (
                 <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.9 }}
                   className={`w-64 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 select-none ${isDarkMode ? 'bg-black/60 text-white' : 'bg-white/80 text-black'}`}
                   style={{
                     boxShadow: `0 0 20px ${memberIndexMap[hoveredEntityIndex].color}40`,
                     border: `1px solid ${memberIndexMap[hoveredEntityIndex].color}60`
                   }}
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <div 
                       className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                       style={{ backgroundColor: memberIndexMap[hoveredEntityIndex].color, color: '#fff' }}
                     >
                        {memberIndexMap[hoveredEntityIndex].name.charAt(0)}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg leading-tight">{memberIndexMap[hoveredEntityIndex].name}</h3>
                       <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                         {memberIndexMap[hoveredEntityIndex].role}
                       </p>
                     </div>
                   </div>
                   <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                     {memberIndexMap[hoveredEntityIndex].description}
                   </p>
                 </motion.div>
              )}
           </AnimatePresence>
         </Html>
      )}

    </group>
  )
}

export default function ParticleSphere({ isDarkMode }: { isDarkMode: boolean }) {
  const { entities } = useMockData();

  // Define Leva controls
  const { 
    count, 
    connectDistance, 
    particleSize, 
    rotationSpeedX, 
    rotationSpeedY,
    baseColor,
    lineColor
  } = useControls('Sphere Settings', {
    Geometry: folder({
      count: { value: 600, min: 100, max: 2000, step: 50 },
      connectDistance: { value: 25, min: 10, max: 80, step: 1 },
      particleSize: { value: 3, min: 1, max: 10, step: 0.5 },
    }),
    Motion: folder({
      rotationSpeedX: { value: 0.0005, min: 0, max: 0.01, step: 0.0001 },
      rotationSpeedY: { value: 0.002, min: 0, max: 0.01, step: 0.0001 },
    }),
    Colors: folder({
      baseColor: '#11dddd',
      lineColor: '#535353',
    })
  });

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <Canvas camera={{ position: [0, 0, 350], fov: 50 }}>
        <ambientLight intensity={isDarkMode ? 0.5 : 1.5} />
        <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1 : 2} />
        <HologramScene 
          count={count} 
          connectDist={connectDistance} 
          particleSize={particleSize} 
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
