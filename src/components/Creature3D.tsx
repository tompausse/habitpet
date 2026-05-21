import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { StageConfig } from '../game/creatures';
import { CreatureErrorBoundary } from './CreatureErrorBoundary';

// ---------- Individual mesh parts ----------

function GlowSphere({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale * 1.55, scale * 1.55, scale * 1.55]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
    </mesh>
  );
}

function Body({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale, scale * 1.05, scale]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial color={color} shininess={25} specular="#ffffff" />
    </mesh>
  );
}

function Belly({ color, bodyScale }: { color: string; bodyScale: number }) {
  return (
    <mesh position={[0, -0.22 * bodyScale, 0.75 * bodyScale]} scale={[bodyScale * 0.6, bodyScale * 0.48, bodyScale * 0.15]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshPhongMaterial color={color} shininess={5} />
    </mesh>
  );
}

function Eye({ x, bodyScale }: { x: number; bodyScale: number }) {
  const s = bodyScale;
  return (
    <group position={[x * s * 0.42, s * 0.14, s * 0.88]}>
      {/* white */}
      <mesh scale={[s * 0.23, s * 0.27, s * 0.12]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshPhongMaterial color="#ffffff" shininess={60} />
      </mesh>
      {/* pupil */}
      <mesh position={[x * s * 0.04, -s * 0.02, s * 0.06]} scale={[s * 0.14, s * 0.16, s * 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhongMaterial color="#1a2030" />
      </mesh>
      {/* glint */}
      <mesh position={[x * s * 0.07, s * 0.06, s * 0.1]} scale={[s * 0.05, s * 0.05, s * 0.04]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Cheek({ x, bodyScale }: { x: number; bodyScale: number }) {
  const s = bodyScale;
  return (
    <mesh
      position={[x * s * 0.58, -s * 0.08, s * 0.78]}
      scale={[s * 0.22, s * 0.12, s * 0.08]}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#FF9DB6" transparent opacity={0.55} />
    </mesh>
  );
}

function Smile({ bodyScale }: { bodyScale: number }) {
  const s = bodyScale;
  return (
    <mesh
      position={[0, -s * 0.2, s * 0.93]}
      rotation={[0, 0, Math.PI]} // flip so arc curves upward = smile
      scale={[s * 0.22, s * 0.22, s * 0.22]}
    >
      <torusGeometry args={[1, 0.18, 8, 16, Math.PI]} />
      <meshPhongMaterial color="#1a2030" />
    </mesh>
  );
}

function Leaf({ bodyScale }: { bodyScale: number }) {
  const s = bodyScale;
  return (
    <group position={[0, s * 1.02, 0]}>
      {/* left leaf */}
      <mesh
        position={[-s * 0.16, s * 0.22, 0]}
        rotation={[0, 0, Math.PI * 0.18]}
        scale={[s * 0.12, s * 0.34, s * 0.06]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhongMaterial color="#9BF59B" shininess={20} />
      </mesh>
      {/* right leaf */}
      <mesh
        position={[s * 0.16, s * 0.22, 0]}
        rotation={[0, 0, -Math.PI * 0.18]}
        scale={[s * 0.12, s * 0.34, s * 0.06]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhongMaterial color="#7EDB7E" shininess={20} />
      </mesh>
      {/* stem */}
      <mesh scale={[s * 0.045, s * 0.22, s * 0.045]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshPhongMaterial color="#3CA03C" />
      </mesh>
    </group>
  );
}

function Horns({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const darkColor = new THREE.Color(color).multiplyScalar(0.7).getStyle();
  return (
    <group position={[0, s * 0.82, s * 0.22]}>
      <mesh position={[-s * 0.32, s * 0.28, 0]} rotation={[0, 0, Math.PI * 0.15]} scale={[s * 0.11, s * 0.35, s * 0.11]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshPhongMaterial color={darkColor} shininess={30} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.28, 0]} rotation={[0, 0, -Math.PI * 0.15]} scale={[s * 0.11, s * 0.35, s * 0.11]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshPhongMaterial color={darkColor} shininess={30} />
      </mesh>
    </group>
  );
}

function Wings({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const wingColor = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.4).getStyle();
  return (
    <group>
      {/* left wing */}
      <mesh
        position={[-s * 1.1, s * 0.22, -s * 0.1]}
        rotation={[Math.PI * 0.08, -Math.PI * 0.25, -Math.PI * 0.18]}
        scale={[s * 0.72, s * 0.44, s * 0.04]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={wingColor} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* right wing */}
      <mesh
        position={[s * 1.1, s * 0.22, -s * 0.1]}
        rotation={[Math.PI * 0.08, Math.PI * 0.25, Math.PI * 0.18]}
        scale={[s * 0.72, s * 0.44, s * 0.04]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={wingColor} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Crown({ bodyScale }: { bodyScale: number }) {
  const s = bodyScale;
  return (
    <group position={[0, s * 1.14, 0]}>
      {/* base ring */}
      <mesh scale={[s * 0.42, s * 0.07, s * 0.42]}>
        <torusGeometry args={[1, 0.22, 8, 24]} />
        <meshPhongMaterial color="#FFD036" shininess={80} specular="#FFFFFF" />
      </mesh>
      {/* gems */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x * s * 0.5, s * 0.1, 0]} scale={[s * 0.09, s * 0.15, s * 0.09]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshPhongMaterial color={i === 1 ? '#FF6B8B' : '#7EC8FF'} shininess={90} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- Animated creature group ----------

interface CreatureSceneProps {
  config: StageConfig;
  mood?: 'happy' | 'neutral' | 'sad';
}

function CreatureGroup({ config, mood = 'happy' }: CreatureSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(Math.random() * Math.PI * 2);
  const s = config.scale;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    t.current += delta;
    // Gentle bob
    groupRef.current.position.y = Math.sin(t.current * 0.9) * 0.08 * s;
    // Slow idle rotation
    groupRef.current.rotation.y = Math.sin(t.current * 0.35) * 0.12;
    // Slight tilt based on mood
    if (mood === 'sad') {
      groupRef.current.rotation.x = 0.06 + Math.sin(t.current * 0.5) * 0.02;
    } else {
      groupRef.current.rotation.x = Math.sin(t.current * 0.6) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      <GlowSphere color={config.glowColor} scale={s} />
      <Body color={config.bodyColor} scale={s} />
      <Belly color={config.bellyColor} bodyScale={s} />
      <Eye x={-1} bodyScale={s} />
      <Eye x={1} bodyScale={s} />
      <Cheek x={-1} bodyScale={s} />
      <Cheek x={1} bodyScale={s} />
      <Smile bodyScale={s} />
      {config.hasLeaf && <Leaf bodyScale={s} />}
      {config.hasHorns && <Horns bodyScale={s} color={config.bodyColor} />}
      {config.hasWings && <Wings bodyScale={s} color={config.bodyColor} />}
      {config.hasCrown && <Crown bodyScale={s} />}
    </group>
  );
}

// ---------- Public component ----------

interface Creature3DProps {
  config: StageConfig;
  mood?: 'happy' | 'neutral' | 'sad';
  size?: number;
}

export function Creature3D({ config, mood = 'happy', size = 260 }: Creature3DProps) {
  const cameraZ = 3.8 / config.scale;

  return (
    <CreatureErrorBoundary config={config} size={size}>
      <Canvas
        style={{ width: size, height: size }}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.1, cameraZ], fov: 55 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 5]} intensity={1.1} castShadow={false} />
        <pointLight position={[-2, 2, 4]} intensity={0.55} color={config.glowColor} />
        <CreatureGroup config={config} mood={mood} />
      </Canvas>
    </CreatureErrorBoundary>
  );
}
