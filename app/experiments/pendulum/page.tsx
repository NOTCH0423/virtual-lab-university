'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';

function Pendulum({ length, amplitude, damping, isRunning }: { 
  length: number; 
  amplitude: number; 
  damping: number;
  isRunning: boolean;
}) {
  const bobRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const timeRef = useRef(0);
  const angleRef = useRef(amplitude);

  useFrame((state, delta) => {
    if (isRunning) {
      timeRef.current += delta;
      const decay = Math.exp(-damping * timeRef.current);
      angleRef.current = amplitude * Math.cos(Math.sqrt(9.81 / length) * timeRef.current) * decay;
    }
    
    if (groupRef.current) {
      const angleRad = (angleRef.current * Math.PI) / 180;
      const x = length * Math.sin(angleRad);
      const y = -length * Math.cos(angleRad);
      
      if (bobRef.current) {
        bobRef.current.position.set(x, y, 0);
      }
    }
  });

  const angleRad = (amplitude * Math.PI) / 180;
  const initialX = length * Math.sin(angleRad);
  const initialY = -length * Math.cos(angleRad);

  return (
    <group position={[0, 2, 0]} ref={groupRef}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh ref={bobRef} position={[initialX, initialY, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.3} roughness={0.4} emissive="#0ea5e9" emissiveIntensity={0.2} />
      </mesh>
      
      <line>
        <bufferGeometry>
          <float32BufferAttribute 
            attach="attributes-position" 
            args={[new Float32Array([0, 0, 0, initialX, initialY, 0]), 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#718096" />
      </line>
    </group>
  );
}

function PhysicsGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  );
}

function GridHelper() {
  return (
    <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, -0.99, 0]} />
  );
}

function PendulumSimulation({ length, amplitude, damping, isRunning }: { 
  length: number; 
  amplitude: number; 
  damping: number;
  isRunning: boolean;
}) {
  return (
    <Canvas shadows className="w-full h-full">
      <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={50} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={5} maxDistance={15} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Suspense fallback={null}>
        <Pendulum length={length} amplitude={amplitude} damping={damping} isRunning={isRunning} />
        <PhysicsGround />
        <GridHelper />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

export default function PendulumExperimentPage() {
  const [length, setLength] = useState(3);
  const [amplitude, setAmplitude] = useState(30);
  const [damping, setDamping] = useState(0.05);
  const [isRunning, setIsRunning] = useState(false);

  const period = 2 * Math.PI * Math.sqrt(length / 9.81);
  const frequency = 1 / period;

  const handleReset = () => {
    setIsRunning(false);
    setLength(3);
    setAmplitude(30);
    setDamping(0.05);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <PendulumSimulation length={length} amplitude={amplitude} damping={damping} isRunning={isRunning} />
        </div>
        
        <div className="absolute top-4 left-4 glass-dark px-4 py-2 rounded-xl">
          <span className="text-sm text-gray-400">Laboratorio:</span>
          <span className="ml-2 font-medium">Péndulo Simple</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="glass-dark px-4 py-2 rounded-xl flex items-center gap-6">
            <div>
              <span className="text-xs text-gray-400 block">Período</span>
              <span className="font-mono font-medium">{period.toFixed(3)} s</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Frecuencia</span>
              <span className="font-mono font-medium">{frequency.toFixed(3)} Hz</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Amplitud</span>
              <span className="font-mono font-medium">{amplitude}°</span>
            </div>
          </div>
          
          <div className="glass-dark px-4 py-2 rounded-xl">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {isRunning ? 'Detener' : 'Iniciar'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 glass-dark p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Péndulo Simple</h2>
          <p className="text-sm text-gray-400">
            Un péndulo simple consiste en una masa suspendida de un punto fijo mediante un hilo inextensible.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Longitud del hilo: {length.toFixed(1)} m
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Amplitud inicial: {amplitude}°
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Amortiguamiento: {damping.toFixed(3)}
            </label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
              disabled={isRunning}
            />
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium mb-3">Fórmulas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Período:</span>
                <span className="font-mono">T = 2π√(L/g)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Frecuencia:</span>
                <span className="font-mono">f = 1/T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ecuación:</span>
                <span className="font-mono">θ(t) = θ₀cos(ωt)</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium mb-3">Datos en tiempo real</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Longitud actual:</span>
                <span className="font-mono">{length.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Período calculado:</span>
                <span className="font-mono">{period.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ω (vel. angular):</span>
                <span className="font-mono">{(2 * Math.PI / period).toFixed(3)} rad/s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleReset}
            className="w-full py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            Reiniciar
          </button>
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
            Guardar Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
