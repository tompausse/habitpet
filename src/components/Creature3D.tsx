import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { StageConfig } from '../game/creatures';
import { CreatureErrorBoundary } from './CreatureErrorBoundary';

// ---------- Floating particles (individual meshes — no InstancedMesh) ----------

interface ParticleProps {
  color: string;
  bodyScale: number;
  index: number;
  total: number;
}

function Particle({ color, bodyScale, index, total }: ParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const s = bodyScale;

  // Each particle gets a unique starting position spread around the halo
  const angle = (index / total) * Math.PI * 2;
  const state = useRef({
    x: Math.cos(angle) * s * (0.72 + Math.random() * 0.4),
    y: (Math.random() * 1.4 - 0.5) * s,
    z: Math.sin(angle) * s * (0.55 + Math.random() * 0.3),
    vy: (0.16 + Math.random() * 0.2) * s,
    vx: (Math.random() - 0.5) * 0.15 * s,
    vz: (Math.random() - 0.5) * 0.10 * s,
    life: Math.random() * 3,
    maxLife: 2.0 + Math.random() * 2.0,
  });

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const p = state.current;
    p.life += dt;

    if (p.life >= p.maxLife) {
      // Reset to bottom halo
      const a = Math.random() * Math.PI * 2;
      const r = s * (0.55 + Math.random() * 0.5);
      p.x = Math.cos(a) * r * 0.85;
      p.y = -s * (0.65 + Math.random() * 0.2);
      p.z = Math.sin(a) * r * 0.6;
      p.vy = (0.16 + Math.random() * 0.2) * s;
      p.vx = (Math.random() - 0.5) * 0.15 * s;
      p.vz = (Math.random() - 0.5) * 0.10 * s;
      p.life = 0;
      p.maxLife = 2.0 + Math.random() * 2.0;
    } else {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    }

    // Bell-curve size: grows in, shrinks out
    const t = p.life / p.maxLife;
    const fade = Math.sin(Math.PI * t);
    const sz = Math.max(0.001, fade * 0.058 * s);

    meshRef.current.position.set(p.x, p.y, p.z);
    meshRef.current.scale.setScalar(sz);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color={color} transparent opacity={0.68} depthWrite={false} />
    </mesh>
  );
}

function Particles({ color, bodyScale }: { color: string; bodyScale: number }) {
  const COUNT = 8;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle key={i} color={color} bodyScale={bodyScale} index={i} total={COUNT} />
      ))}
    </>
  );
}

// ---------- Body parts ----------

function GlowSphere({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale * 1.58, scale * 1.58, scale * 1.58]}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshBasicMaterial color={color} transparent opacity={0.09} side={THREE.BackSide} />
    </mesh>
  );
}

function Body({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale, scale * 1.06, scale]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial color={color} shininess={35} specular="#aaffdd" />
    </mesh>
  );
}

function Belly({ color, bodyScale }: { color: string; bodyScale: number }) {
  return (
    <mesh
      position={[0, -0.22 * bodyScale, 0.75 * bodyScale]}
      scale={[bodyScale * 0.6, bodyScale * 0.48, bodyScale * 0.15]}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshPhongMaterial color={color} shininess={8} />
    </mesh>
  );
}

function Tail({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const darkColor = new THREE.Color(color).multiplyScalar(0.74).getStyle();
  return (
    <mesh position={[0, -s * 0.30, -s * 0.84]} scale={[s * 0.24, s * 0.20, s * 0.22]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhongMaterial color={darkColor} shininess={15} />
    </mesh>
  );
}

/** Eye with autonomous periodic blinking. */
function Eye({ x, bodyScale, blinkOffset = 0 }: { x: number; bodyScale: number; blinkOffset?: number }) {
  const s = bodyScale;
  const scleraRef = useRef<THREE.Mesh>(null);
  const blinkT = useRef(blinkOffset);
  const BLINK_INTERVAL = 4.0;
  const BLINK_DUR = 0.12;

  useFrame((_, dt) => {
    if (!scleraRef.current) return;
    blinkT.current += dt;
    const phase = blinkT.current % BLINK_INTERVAL;
    if (phase < BLINK_DUR) {
      const blink = Math.sin(Math.PI * phase / BLINK_DUR);
      scleraRef.current.scale.y = s * 0.27 * (1 - blink * 0.9);
    } else {
      scleraRef.current.scale.y = s * 0.27;
    }
  });

  return (
    <group position={[x * s * 0.42, s * 0.14, s * 0.88]}>
      {/* Sclera */}
      <mesh ref={scleraRef} scale={[s * 0.23, s * 0.27, s * 0.12]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshPhongMaterial color="#ffffff" shininess={70} specular="#ffffff" />
      </mesh>
      {/* Pupil */}
      <mesh position={[x * s * 0.04, -s * 0.02, s * 0.065]} scale={[s * 0.14, s * 0.16, s * 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhongMaterial color="#1a2030" shininess={10} />
      </mesh>
      {/* Glint */}
      <mesh position={[x * s * 0.07, s * 0.06, s * 0.105]} scale={[s * 0.052, s * 0.052, s * 0.04]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Cheek({ x, bodyScale }: { x: number; bodyScale: number }) {
  const s = bodyScale;
  return (
    <mesh position={[x * s * 0.58, -s * 0.08, s * 0.78]} scale={[s * 0.22, s * 0.12, s * 0.08]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#FF9DB6" transparent opacity={0.55} />
    </mesh>
  );
}

function Smile({ bodyScale, mood }: { bodyScale: number; mood: string }) {
  const s = bodyScale;
  if (mood === 'sad') {
    return (
      <mesh position={[0, -s * 0.26, s * 0.93]} scale={[s * 0.17, s * 0.17, s * 0.17]}>
        <torusGeometry args={[1, 0.18, 8, 16, Math.PI]} />
        <meshPhongMaterial color="#1a2030" />
      </mesh>
    );
  }
  return (
    <mesh
      position={[0, -s * 0.2, s * 0.93]}
      rotation={[0, 0, Math.PI]}
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
      <mesh position={[-s * 0.16, s * 0.22, 0]} rotation={[0, 0, Math.PI * 0.18]} scale={[s * 0.12, s * 0.34, s * 0.06]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhongMaterial color="#9BF59B" shininess={20} />
      </mesh>
      <mesh position={[s * 0.16, s * 0.22, 0]} rotation={[0, 0, -Math.PI * 0.18]} scale={[s * 0.12, s * 0.34, s * 0.06]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhongMaterial color="#7EDB7E" shininess={20} />
      </mesh>
      <mesh scale={[s * 0.045, s * 0.22, s * 0.045]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshPhongMaterial color="#3CA03C" />
      </mesh>
    </group>
  );
}

function Horns({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const darkColor = new THREE.Color(color).multiplyScalar(0.68).getStyle();
  return (
    <group position={[0, s * 0.82, s * 0.22]}>
      <mesh position={[-s * 0.32, s * 0.28, 0]} rotation={[0, 0, Math.PI * 0.15]} scale={[s * 0.11, s * 0.35, s * 0.11]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshPhongMaterial color={darkColor} shininess={40} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.28, 0]} rotation={[0, 0, -Math.PI * 0.15]} scale={[s * 0.11, s * 0.35, s * 0.11]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshPhongMaterial color={darkColor} shininess={40} />
      </mesh>
    </group>
  );
}

/** Wings with gentle flapping. */
function Wings({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const wingRef1 = useRef<THREE.Mesh>(null);
  const wingRef2 = useRef<THREE.Mesh>(null);
  const wt = useRef(0);

  useFrame((_, dt) => {
    wt.current += dt;
    const flap = Math.sin(wt.current * 2.2) * 0.09;
    if (wingRef1.current) wingRef1.current.rotation.z = -Math.PI * 0.18 + flap;
    if (wingRef2.current) wingRef2.current.rotation.z =  Math.PI * 0.18 - flap;
  });

  const wingColor = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.4).getStyle();
  return (
    <group>
      <mesh ref={wingRef1}
        position={[-s * 1.1, s * 0.22, -s * 0.1]}
        rotation={[Math.PI * 0.08, -Math.PI * 0.25, -Math.PI * 0.18]}
        scale={[s * 0.72, s * 0.44, s * 0.04]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={wingColor} transparent opacity={0.52} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wingRef2}
        position={[s * 1.1, s * 0.22, -s * 0.1]}
        rotation={[Math.PI * 0.08, Math.PI * 0.25, Math.PI * 0.18]}
        scale={[s * 0.72, s * 0.44, s * 0.04]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={wingColor} transparent opacity={0.52} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Crown({ bodyScale }: { bodyScale: number }) {
  const s = bodyScale;
  return (
    <group position={[0, s * 1.14, 0]}>
      <mesh scale={[s * 0.42, s * 0.07, s * 0.42]}>
        <torusGeometry args={[1, 0.22, 8, 24]} />
        <meshPhongMaterial color="#FFD036" shininess={90} specular="#FFFFFF" />
      </mesh>
      {[-0.5, 0, 0.5].map((xi, i) => (
        <mesh key={i} position={[xi * s * 0.5, s * 0.1, 0]} scale={[s * 0.09, s * 0.15, s * 0.09]}>
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

    const bobSpeed = mood === 'happy' ? 1.25 : mood === 'sad' ? 0.55 : 0.9;
    const bobAmp   = mood === 'happy' ? 0.10 : mood === 'sad' ? 0.04 : 0.08;
    const rotSpeed = mood === 'happy' ? 0.42 : mood === 'sad' ? 0.18 : 0.35;
    const rotAmp   = mood === 'happy' ? 0.14 : mood === 'sad' ? 0.05 : 0.12;

    let baseY = Math.sin(t.current * bobSpeed) * bobAmp * s;

    if (mood === 'happy') {
      const hopPhase = t.current % 5.8;
      if (hopPhase < 0.38) {
        baseY += Math.sin(Math.PI * hopPhase / 0.38) * 0.18 * s;
      }
      groupRef.current.rotation.x = Math.sin(t.current * 0.75) * 0.028;
    } else if (mood === 'sad') {
      groupRef.current.rotation.x = 0.07 + Math.sin(t.current * 0.45) * 0.018;
    } else {
      groupRef.current.rotation.x = Math.sin(t.current * 0.6) * 0.025;
    }

    groupRef.current.position.y = baseY;
    groupRef.current.rotation.y = Math.sin(t.current * rotSpeed) * rotAmp;
  });

  return (
    <group ref={groupRef}>
      <Particles color={config.particleColor} bodyScale={s} />
      <GlowSphere color={config.glowColor} scale={s} />
      <Body color={config.bodyColor} scale={s} />
      <Belly color={config.bellyColor} bodyScale={s} />
      <Tail bodyScale={s} color={config.bodyColor} />
      <Eye x={-1} bodyScale={s} blinkOffset={0} />
      <Eye x={1}  bodyScale={s} blinkOffset={0.22} />
      <Cheek x={-1} bodyScale={s} />
      <Cheek x={1}  bodyScale={s} />
      <Smile bodyScale={s} mood={mood} />
      {config.hasLeaf  && <Leaf bodyScale={s} />}
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
        {/* Ambient: soft base fill */}
        <ambientLight intensity={0.6} />
        {/* Key: strong top-front for clear 3D depth */}
        <directionalLight position={[2, 4, 5]} intensity={1.2} castShadow={false} />
        {/* Fill: softer from left */}
        <pointLight position={[-3, 1, 3]} intensity={0.5} color="#ffffff" />
        {/* Rim: behind with species glow colour — separates creature from background */}
        <pointLight position={[0, 0.5, -4]} intensity={0.65} color={config.glowColor} />
        {/* Belly warmth: low front */}
        <pointLight position={[0, -2, 3]} intensity={0.3} color={config.particleColor} />
        <CreatureGroup config={config} mood={mood} />
      </Canvas>
    </CreatureErrorBoundary>
  );
}
