import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import type { StageConfig } from '../game/creatures';
import { CreatureErrorBoundary } from './CreatureErrorBoundary';

// ---------- Shared dummy for InstancedMesh transforms ----------
const _dummy = new THREE.Object3D();

// ---------- Floating particle system ----------

interface ParticleState {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; maxLife: number;
}

function Particles({ color, bodyScale, count = 9 }: { color: string; bodyScale: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Initialise particle states once
  const states = useRef<ParticleState[]>([]);
  if (states.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const r = (0.7 + Math.random() * 0.5) * bodyScale;
      states.current.push({
        x: Math.cos(angle) * r * 0.85,
        y: (Math.random() * 1.6 - 0.4) * bodyScale,
        z: Math.sin(angle) * r * 0.6,
        vx: (Math.random() - 0.5) * 0.18 * bodyScale,
        vy: (0.18 + Math.random() * 0.22) * bodyScale,
        vz: (Math.random() - 0.5) * 0.12 * bodyScale,
        life: Math.random() * 3,
        maxLife: 2.2 + Math.random() * 1.8,
      });
    }
  }

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const s = states.current;
    for (let i = 0; i < count; i++) {
      const p = s[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        const angle = Math.random() * Math.PI * 2;
        const r = (0.5 + Math.random() * 0.6) * bodyScale;
        p.x = Math.cos(angle) * r * 0.85;
        p.y = (-0.7 + Math.random() * 0.3) * bodyScale;
        p.z = Math.sin(angle) * r * 0.6;
        p.vx = (Math.random() - 0.5) * 0.18 * bodyScale;
        p.vy = (0.18 + Math.random() * 0.22) * bodyScale;
        p.vz = (Math.random() - 0.5) * 0.12 * bodyScale;
        p.life = 0;
        p.maxLife = 2.2 + Math.random() * 1.8;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
      }

      // Size: peaks in middle of lifetime (bell curve)
      const t = p.life / p.maxLife;
      const fade = Math.sin(Math.PI * t);
      const sz = Math.max(0.001, fade * 0.065 * bodyScale);

      _dummy.position.set(p.x, p.y, p.z);
      _dummy.scale.setScalar(sz);
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color={color} transparent opacity={0.72} depthWrite={false} />
    </instancedMesh>
  );
}

// ---------- Body parts ----------

function GlowSphere({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale * 1.6, scale * 1.6, scale * 1.6]}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.BackSide} />
    </mesh>
  );
}

function Body({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={[scale, scale * 1.06, scale]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.0} />
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
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.0} />
    </mesh>
  );
}

/** Cute round tail nub at the back */
function Tail({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const darkColor = new THREE.Color(color).multiplyScalar(0.76).getStyle();
  return (
    <mesh position={[0, -s * 0.28, -s * 0.86]} scale={[s * 0.22, s * 0.18, s * 0.2]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color={darkColor} roughness={0.6} />
    </mesh>
  );
}

/** Eye with autonomous blinking animation. blinkOffset staggers left/right eye. */
function Eye({ x, bodyScale, blinkOffset = 0 }: { x: number; bodyScale: number; blinkOffset?: number }) {
  const s = bodyScale;
  const scleraRef = useRef<THREE.Mesh>(null);
  const blinkT = useRef(blinkOffset);
  const BLINK_INTERVAL = 4.2;
  const BLINK_DUR = 0.11;

  useFrame((_, dt) => {
    if (!scleraRef.current) return;
    blinkT.current += dt;
    const phase = blinkT.current % BLINK_INTERVAL;
    if (phase < BLINK_DUR) {
      const blink = Math.sin(Math.PI * phase / BLINK_DUR);
      scleraRef.current.scale.y = s * 0.27 * (1 - blink * 0.88);
    } else {
      scleraRef.current.scale.y = s * 0.27;
    }
  });

  return (
    <group position={[x * s * 0.42, s * 0.14, s * 0.88]}>
      {/* Sclera */}
      <mesh ref={scleraRef} scale={[s * 0.23, s * 0.27, s * 0.12]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.05} />
      </mesh>
      {/* Pupil */}
      <mesh position={[x * s * 0.04, -s * 0.02, s * 0.065]} scale={[s * 0.14, s * 0.16, s * 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#1a2030" roughness={0.3} />
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
      <meshBasicMaterial color="#FF9DB6" transparent opacity={0.52} />
    </mesh>
  );
}

function Smile({ bodyScale, mood }: { bodyScale: number; mood: string }) {
  const s = bodyScale;
  if (mood === 'sad') {
    // Frown: arc curves downward
    return (
      <mesh
        position={[0, -s * 0.26, s * 0.93]}
        rotation={[0, 0, 0]}
        scale={[s * 0.17, s * 0.17, s * 0.17]}
      >
        <torusGeometry args={[1, 0.18, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a2030" roughness={0.5} />
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
      <meshStandardMaterial color="#1a2030" roughness={0.5} />
    </mesh>
  );
}

function Leaf({ bodyScale }: { bodyScale: number }) {
  const s = bodyScale;
  return (
    <group position={[0, s * 1.02, 0]}>
      <mesh position={[-s * 0.16, s * 0.22, 0]} rotation={[0, 0, Math.PI * 0.18]} scale={[s * 0.12, s * 0.34, s * 0.06]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#9BF59B" roughness={0.5} />
      </mesh>
      <mesh position={[s * 0.16, s * 0.22, 0]} rotation={[0, 0, -Math.PI * 0.18]} scale={[s * 0.12, s * 0.34, s * 0.06]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#7EDB7E" roughness={0.5} />
      </mesh>
      <mesh scale={[s * 0.045, s * 0.22, s * 0.045]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#3CA03C" roughness={0.6} />
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
        <meshStandardMaterial color={darkColor} roughness={0.4} />
      </mesh>
      <mesh position={[s * 0.32, s * 0.28, 0]} rotation={[0, 0, -Math.PI * 0.15]} scale={[s * 0.11, s * 0.35, s * 0.11]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color={darkColor} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Wings with gentle flapping animation */
function Wings({ bodyScale, color }: { bodyScale: number; color: string }) {
  const s = bodyScale;
  const wingRef1 = useRef<THREE.Mesh>(null);
  const wingRef2 = useRef<THREE.Mesh>(null);
  const wt = useRef(0);

  useFrame((_, dt) => {
    wt.current += dt;
    const flap = Math.sin(wt.current * 2.4) * 0.08;
    if (wingRef1.current) wingRef1.current.rotation.z = -Math.PI * 0.18 + flap;
    if (wingRef2.current) wingRef2.current.rotation.z =  Math.PI * 0.18 - flap;
  });

  const wingColor = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.42).getStyle();
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
        <meshStandardMaterial color="#FFD036" roughness={0.2} metalness={0.6} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x * s * 0.5, s * 0.1, 0]} scale={[s * 0.09, s * 0.15, s * 0.09]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={i === 1 ? '#FF6B8B' : '#7EC8FF'} roughness={0.15} metalness={0.3} />
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

    const bobSpeed  = mood === 'happy' ? 1.25 : mood === 'sad' ? 0.55 : 0.9;
    const bobAmp    = mood === 'happy' ? 0.10 : mood === 'sad' ? 0.04 : 0.08;
    const rotSpeed  = mood === 'happy' ? 0.42 : mood === 'sad' ? 0.18 : 0.35;
    const rotAmp    = mood === 'happy' ? 0.14 : mood === 'sad' ? 0.05 : 0.12;

    let baseY = Math.sin(t.current * bobSpeed) * bobAmp * s;

    if (mood === 'happy') {
      // Tiny hop every ~5.8 s
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
      <Eye x={1} bodyScale={s} blinkOffset={0.22} />
      <Cheek x={-1} bodyScale={s} />
      <Cheek x={1} bodyScale={s} />
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
        {/* Ambient fill */}
        <ambientLight intensity={0.72} />
        {/* Key light: top-front */}
        <directionalLight position={[3, 5, 5]} intensity={1.0} castShadow={false} />
        {/* Fill light: left side */}
        <pointLight position={[-3, 1, 3]} intensity={0.45} color="#ffffff" />
        {/* Rim light: behind, species-tinted — makes the creature pop off background */}
        <pointLight position={[0, 1, -4]} intensity={0.55} color={config.glowColor} />
        {/* Belly glow: front-bottom warm reflection */}
        <pointLight position={[0, -2, 3]} intensity={0.28} color={config.particleColor} />
        <CreatureGroup config={config} mood={mood} />
      </Canvas>
    </CreatureErrorBoundary>
  );
}
