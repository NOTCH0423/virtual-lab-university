'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneKind, SimParams, SimState } from '@/lib/lab-sims';
import { mitosisPhase } from '@/lib/lab-sims';

type P = { s: MutableRefObject<SimState>; p: SimParams; color: string };

function Floor({ y = 0, size = 30 }: { y?: number; size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  );
}

function PendulumScene({ s, p, color }: P) {
  const arm = useRef<THREE.Group>(null);
  useFrame(() => {
    if (arm.current) arm.current.rotation.z = s.current.theta ?? 0;
  });
  const L = p.L;
  return (
    <group position={[0, 2.2, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.5, 0.1, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      <group ref={arm}>
        <mesh position={[0, -L / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, L, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, -L, 0]} castShadow>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
      <Floor y={-3.4} />
    </group>
  );
}

function ProjectileScene({ s, p, color }: P) {
  const ball = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Vector3[]>([]);
  const line = useRef<THREE.Line>(null);
  const R = (p.v0 * p.v0) / p.g + 5;
  const k = 10 / Math.max(10, R);
  useFrame(() => {
    const st = s.current;
    const pos = new THREE.Vector3(-5 + st.x * k, st.y * k, 0);
    if (ball.current) ball.current.position.copy(pos);
    if (st.t === 0) trail.current = [];
    const last = trail.current[trail.current.length - 1];
    if (!last || last.distanceTo(pos) > 0.05) trail.current.push(pos.clone());
    if (line.current && trail.current.length > 1) line.current.geometry.setFromPoints(trail.current);
  });
  const lineObj = useMemo(() => new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color })), [color]);
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[-5, (p.h0 * k) / 2, 0]}>
        <boxGeometry args={[0.4, Math.max(0.01, p.h0 * k), 0.4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh ref={ball} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <primitive object={lineObj} ref={line} />
      <Floor />
    </group>
  );
}

function BlockScene({ s, color }: P) {
  const block = useRef<THREE.Group>(null);
  useFrame(() => {
    if (block.current) block.current.position.x = -6 + (s.current.x ?? 0) * 0.4;
  });
  return (
    <group position={[0, -1, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[13, 0.1, 2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-6 + i * 2, 0.01, 0.9]}>
          <boxGeometry args={[0.04, 0.02, 0.2]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      <group ref={block}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.9, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4, 16]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
      </group>
      <Floor y={-0.1} />
    </group>
  );
}

function BounceScene({ s, p, color }: P) {
  const ball = useRef<THREE.Mesh>(null);
  const k = 4 / Math.max(4, p.h);
  useFrame(() => {
    if (ball.current) ball.current.position.y = 0.25 + (s.current.y ?? 0) * k;
  });
  return (
    <group position={[0, -2, 0]}>
      <mesh position={[-1, (p.h * k) / 2, 0]}>
        <boxGeometry args={[0.05, p.h * k, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh ref={ball} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Floor />
    </group>
  );
}

function Beaker({ fill, liquid, x = 0, h = 2 }: { fill: number; liquid: string; x?: number; h?: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.8, 0.8, h, 32, 1, true]} />
        <meshPhysicalMaterial color="#cbd5e1" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, (h * fill) / 2, 0]}>
        <cylinderGeometry args={[0.76, 0.76, Math.max(0.01, h * fill), 32]} />
        <meshStandardMaterial color={liquid} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function TitrationScene({ s, p }: P) {
  const liquid = useRef<THREE.MeshStandardMaterial>(null);
  const level = useRef<THREE.Mesh>(null);
  const burette = useRef<THREE.Mesh>(null);
  const drop = useRef<THREE.Mesh>(null);
  const Vmax = (2 * p.Ca * p.Va) / p.Cb;
  useFrame((_, d) => {
    const st = s.current;
    const pink = Math.max(0, Math.min(1, (st.pH - 8.2) / 1.5));
    if (liquid.current) liquid.current.color.set(new THREE.Color('#e0f2fe').lerp(new THREE.Color('#ec4899'), pink));
    const fill = 0.35 + 0.3 * (st.Vb / Vmax);
    if (level.current) {
      level.current.scale.y = fill;
      level.current.position.y = fill;
    }
    if (burette.current) {
      const r = 1 - st.Vb / Vmax;
      burette.current.scale.y = Math.max(0.01, r);
      burette.current.position.y = 2.6 + 1.5 * r;
    }
    if (drop.current) {
      drop.current.position.y -= d * 3;
      if (drop.current.position.y < 1) drop.current.position.y = 2.5;
      drop.current.visible = st.t > 0 && st.Vb < Vmax;
    }
  });
  return (
    <group position={[0, -2, 0]}>
      <mesh position={[0, 4.1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 16, 1, true]} />
        <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={burette}>
        <cylinderGeometry args={[0.1, 0.1, 3, 16]} />
        <meshStandardMaterial color="#bfdbfe" transparent opacity={0.8} />
      </mesh>
      <mesh ref={drop} position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#bfdbfe" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.9, 2, 32, 1, true]} />
        <meshPhysicalMaterial color="#cbd5e1" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={level}>
        <cylinderGeometry args={[0.55, 0.85, 2, 32]} />
        <meshStandardMaterial ref={liquid} transparent opacity={0.8} />
      </mesh>
      <Floor />
    </group>
  );
}

function Particles({ count, getColor, radius = 0.7, height = 1.6, speed = 1 }: { count: number; getColor: (i: number) => string; radius?: number; height?: number; speed?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => [Math.random() * 6.28, Math.random(), Math.random() * 6.28, i]), [count]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const [a, r, ph] = seeds[i];
      m.position.set(Math.cos(a + t * 0.5 + ph) * radius * r, 0.2 + ((Math.sin(t + ph) + 1) / 2) * height, Math.sin(a + t * 0.4) * radius * r);
      (m.material as THREE.MeshStandardMaterial).color.set(getColor(i));
    });
  });
  return (
    <>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial />
        </mesh>
      ))}
    </>
  );
}

function KineticsScene({ s, p }: P) {
  const liquid = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const r = 1 - (s.current.A ?? p.A0) / p.A0;
    liquid.current?.color.set(new THREE.Color('#3b82f6').lerp(new THREE.Color('#22c55e'), r));
  });
  const N = 60;
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2, 32, 1, true]} />
        <meshPhysicalMaterial color="#cbd5e1" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.76, 0.76, 1.6, 32]} />
        <meshStandardMaterial ref={liquid} transparent opacity={0.35} />
      </mesh>
      <Particles count={N} speed={0.5 + (p.T - 273) / 50} getColor={(i) => (i / N < (s.current.A ?? p.A0) / p.A0 ? '#60a5fa' : '#4ade80')} />
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1, 1, 0.3, 32]} />
        <meshStandardMaterial color={p.T > 330 ? '#ef4444' : '#475569'} emissive={p.T > 330 ? '#7f1d1d' : '#000'} />
      </mesh>
      <Floor y={-0.3} />
    </group>
  );
}

function GalvanicScene({ s, p }: P) {
  const electrons = useRef<(THREE.Mesh | null)[]>([]);
  const cuLiquid = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const running = (s.current.t ?? 0) > 0 && (s.current.cu ?? 1) > 1e-3;
    electrons.current.forEach((m, i) => {
      if (!m) return;
      const u = ((clock.elapsedTime * 0.4 + i / 8) % 1);
      m.position.set(-1.5 + 3 * u, 3.2, 0);
      m.visible = running;
    });
    cuLiquid.current?.color.set(new THREE.Color('#e0f2fe').lerp(new THREE.Color('#2563eb'), Math.min(1, (s.current.cu ?? p.cu) / 1.5)));
  });
  return (
    <group position={[0, -2, 0]}>
      <Beaker x={-1.5} fill={0.7} liquid="#d1d5db" />
      <group position={[1.5, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2, 32, 1, true]} />
          <meshPhysicalMaterial color="#cbd5e1" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.76, 0.76, 1.4, 32]} />
          <meshStandardMaterial ref={cuLiquid} transparent opacity={0.75} />
        </mesh>
      </group>
      <mesh position={[-1.5, 1.6, 0]}>
        <boxGeometry args={[0.2, 2.4, 0.4]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh position={[1.5, 1.6, 0]}>
        <boxGeometry args={[0.2, 2.4, 0.4]} />
        <meshStandardMaterial color="#b45309" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.4, 0.15, 0.15]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[3, 0.04, 0.04]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} ref={(el) => { electrons.current[i] = el; }}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" />
        </mesh>
      ))}
      <Floor />
    </group>
  );
}

function MoleculeScene({ s, p }: P) {
  const N = 48;
  const total = p.h2 + p.o2;
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshPhysicalMaterial color="#cbd5e1" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0.1, 0]}>
        <Particles
          count={N}
          radius={1.1}
          height={1.8}
          getColor={(i) => {
            const st = s.current;
            const tot = (st.h2 ?? p.h2) + (st.o2 ?? p.o2) + (st.w ?? 0);
            const f = i / N;
            const fh = (st.h2 ?? p.h2) / Math.max(tot, total * 0.01);
            const fo = (st.o2 ?? p.o2) / Math.max(tot, total * 0.01);
            return f < fh ? '#f8fafc' : f < fh + fo ? '#ef4444' : '#38bdf8';
          }}
        />
      </group>
      <Floor y={-0.5} />
    </group>
  );
}

function CellScene({ s, p, color }: P) {
  const chromos = useRef<(THREE.Group | null)[]>([]);
  const membrane = useRef<THREE.Mesh>(null);
  const nucleus = useRef<THREE.Mesh>(null);
  const n = p.pairs * 2;
  const angles = useMemo(() => Array.from({ length: n }, (_, i) => [Math.random() * 6.28, (Math.random() - 0.5) * 1.2, i]), [n]);
  useFrame(() => {
    const ph = mitosisPhase(s.current.progress ?? 0);
    const l = ph.local;
    if (membrane.current) {
      const pinch = ph.index === 5 ? l : ph.index === 4 ? l * 0.3 : 0;
      membrane.current.scale.set(1 + (ph.index >= 3 ? 0.35 : 0) + pinch * 0.2, 1 - pinch * 0.55, 1 - pinch * 0.3);
    }
    if (nucleus.current) {
      nucleus.current.visible = ph.index === 0 || ph.index >= 4;
      (nucleus.current.material as THREE.MeshStandardMaterial).opacity = ph.index === 0 ? 0.35 : 0.2;
    }
    chromos.current.forEach((g, i) => {
      if (!g) return;
      const [a, y] = angles[i];
      const pairY = ((i % p.pairs) / Math.max(1, p.pairs - 1) - 0.5) * 1.4;
      let x = 0, yy = 0, z = 0, sep = 0, sc = 1;
      if (ph.index === 0) { x = Math.cos(a) * 0.4; yy = y * 0.5; z = Math.sin(a) * 0.4; sc = 0.5; }
      else if (ph.index === 1) { x = Math.cos(a) * 0.5 * (1 - l * 0.3); yy = y * 0.6; z = Math.sin(a) * 0.5; sc = 0.5 + l * 0.5; }
      else if (ph.index === 2) { x = 0; yy = pairY; z = (i < p.pairs ? -0.15 : 0.15) * (1 - l); }
      else if (ph.index === 3) { yy = pairY; sep = l * 1.1; }
      else { yy = pairY * 0.7; sep = 1.1 + (ph.index === 5 ? l * 0.2 : 0); }
      const side = i < p.pairs ? -1 : 1;
      g.position.set(x + side * sep * (ph.index >= 3 ? 1 : 0), yy, z);
      g.scale.setScalar(sc);
      g.rotation.z = ph.index >= 2 ? 0 : a;
    });
  });
  return (
    <group>
      <mesh ref={membrane}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.15} roughness={0.2} />
      </mesh>
      <mesh ref={nucleus}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.35} />
      </mesh>
      {angles.map((_, i) => (
        <group key={i} ref={(el) => { chromos.current[i] = el; }}>
          <mesh rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
            <meshStandardMaterial color={['#f87171', '#60a5fa', '#facc15', '#34d399', '#f472b6', '#fb923c', '#a3e635', '#22d3ee'][i % p.pairs]} />
          </mesh>
          <mesh rotation={[0, 0, -0.4]}>
            <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
            <meshStandardMaterial color={['#f87171', '#60a5fa', '#facc15', '#34d399', '#f472b6', '#fb923c', '#a3e635', '#22d3ee'][i % p.pairs]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MicroscopeScene({ s, p }: P) {
  const stage = useRef<THREE.Group>(null);
  const clarity = Math.exp(-((p.focus - 50) ** 2) / 300);
  const cells = useMemo(() => {
    const cols = Math.round(2 + 60 / p.obj);
    const out: [number, number][] = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < cols; j++) out.push([i, j]);
    return { cols, out };
  }, [p.obj]);
  useFrame(() => {
    if (stage.current) stage.current.position.x = 1.5 - ((s.current.scanned ?? 0) / 100) * 3;
  });
  const size = 3 / cells.cols;
  const stainCol = new THREE.Color('#fef3c7').lerp(new THREE.Color('#1d4ed8'), p.stain / 100).getStyle();
  return (
    <group>
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#0b1120" />
      </mesh>
      <group ref={stage}>
        {cells.out.map(([i, j]) => (
          <group key={`${i}-${j}`} position={[(i - cells.cols / 2 + 0.5) * size, (j - cells.cols / 2 + 0.5) * size, 0]}>
            <mesh>
              <boxGeometry args={[size * 0.95, size * 0.6, 0.05]} />
              <meshStandardMaterial color={stainCol} transparent opacity={0.25 + 0.6 * clarity} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <sphereGeometry args={[size * 0.12, 12, 12]} />
              <meshStandardMaterial color="#1e3a8a" transparent opacity={0.2 + 0.8 * clarity * (p.stain / 100)} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 0, 0.3]}>
        <ringGeometry args={[2.2, 4, 64]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
    </group>
  );
}

function PeaScene({ s, p }: P) {
  const MAX = 120;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const st = s.current;
    const tot = (st.AA ?? 0) + (st.Aa ?? 0) + (st.aa ?? 0);
    const shown = Math.min(MAX, Math.round((tot / p.n) * MAX));
    const yellow = tot ? ((st.AA + st.Aa) / tot) : 0;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = i < shown;
      // reparto determinista según la proporción observada
      const isYellow = ((i * 0.618034) % 1) < yellow;
      (m.material as THREE.MeshStandardMaterial).color.set(isYellow ? '#facc15' : '#22c55e');
    });
  });
  return (
    <group position={[0, -1.2, 0]}>
      {Array.from({ length: MAX }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[((i % 12) - 5.5) * 0.4, 0.2 + Math.floor(i / 12) * 0.3, ((i * 7) % 5) * 0.1 - 0.2]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial roughness={0.4} />
        </mesh>
      ))}
      <Floor />
    </group>
  );
}

export function SimScene({ kind, ...props }: P & { kind: SceneKind }) {
  switch (kind) {
    case 'pendulum': return <PendulumScene {...props} />;
    case 'projectile': return <ProjectileScene {...props} />;
    case 'block': return <BlockScene {...props} />;
    case 'bounce': return <BounceScene {...props} />;
    case 'titration': return <TitrationScene {...props} />;
    case 'beaker': return <KineticsScene {...props} />;
    case 'galvanic': return <GalvanicScene {...props} />;
    case 'molecules': return <MoleculeScene {...props} />;
    case 'cell': return <CellScene {...props} />;
    case 'microscope': return <MicroscopeScene {...props} />;
    case 'peas': return <PeaScene {...props} />;
    default: return null;
  }
}
