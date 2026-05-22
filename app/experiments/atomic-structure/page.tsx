'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';

function Atom({ electrons, nucleusRadius, electronRadius, orbitRadius }: {
  electrons: number;
  nucleusRadius: number;
  electronRadius: number;
  orbitRadius: number;
}) {
  const groupRef = useRef<any>(null);
  const electronRefs = useRef<any[]>([]);
  const electronPhases = useMemo(() => 
    Array.from({ length: 20 }, () => Math.random() * Math.PI * 2), 
  []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    
    electronRefs.current.forEach((electron, i) => {
      if (electron && i < electrons) {
        const speed = 0.5 + i * 0.2;
        const phase = electronPhases[i];
        const x = orbitRadius * Math.cos(state.clock.elapsedTime * speed + phase);
        const z = orbitRadius * Math.sin(state.clock.elapsedTime * speed + phase);
        const y = Math.sin(state.clock.elapsedTime * speed * 0.5 + phase) * 0.5;
        electron.position.set(x, y, z);
      }
    });
  });

  const electronColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[nucleusRadius, 32, 32]} />
        <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {[...Array(electrons)].map((_, i) => (
        <mesh key={`orbit-${i}`} rotation={[Math.PI / 2 + (i * Math.PI) / Math.max(electrons, 1), 0, 0]}>
          <torusGeometry args={[orbitRadius, 0.01, 16, 100]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.3} />
        </mesh>
      ))}
      
      {[...Array(electrons)].map((_, i) => (
        <mesh
          key={`electron-${i}`}
          ref={(el: any) => { if (el) electronRefs.current[i] = el; }}
        >
          <sphereGeometry args={[electronRadius, 32, 32]} />
          <meshStandardMaterial 
            color={electronColors[i % electronColors.length]} 
            emissive={electronColors[i % electronColors.length]}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      <pointLight position={[0, 0, 0]} color="#ef4444" intensity={2} distance={5} />
    </group>
  );
}

function AtomSimulation({ electrons, nucleusRadius, electronRadius, orbitRadius }: {
  electrons: number;
  nucleusRadius: number;
  electronRadius: number;
  orbitRadius: number;
}) {
  return (
    <Canvas shadows className="w-full h-full">
      <PerspectiveCamera makeDefault position={[8, 3, 8]} fov={50} />
      <OrbitControls />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <Atom 
        electrons={electrons} 
        nucleusRadius={nucleusRadius} 
        electronRadius={electronRadius}
        orbitRadius={orbitRadius}
      />
      
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      <Environment preset="night" />
    </Canvas>
  );
}

const elements = [
  { symbol: 'H', name: 'Hidrógeno', z: 1, electrons: 1, group: 'No metales' },
  { symbol: 'He', name: 'Helio', z: 2, electrons: 2, group: 'Gases nobles' },
  { symbol: 'Li', name: 'Litio', z: 3, electrons: 3, group: 'Metales alcalinos' },
  { symbol: 'C', name: 'Carbono', z: 6, electrons: 6, group: 'No metales' },
  { symbol: 'N', name: 'Nitrógeno', z: 7, electrons: 7, group: 'No metales' },
  { symbol: 'O', name: 'Oxígeno', z: 8, electrons: 8, group: 'No metales' },
  { symbol: 'Na', name: 'Sodio', z: 11, electrons: 11, group: 'Metales alcalinos' },
  { symbol: 'Fe', name: 'Hierro', z: 26, electrons: 26, group: 'Metales de transición' },
];

function getElectronConfiguration(electrons: number): number[] {
  const shells = [2, 8, 18, 32];
  const config: number[] = [];
  let remaining = electrons;
  
  for (const shell of shells) {
    if (remaining <= 0) break;
    const electronsInShell = Math.min(remaining, shell);
    config.push(electronsInShell);
    remaining -= electronsInShell;
  }
  
  return config;
}

export default function AtomicStructurePage() {
  const [electrons, setElectrons] = useState(6);
  const [nucleusRadius, setNucleusRadius] = useState(0.5);
  const [electronRadius, setElectronRadius] = useState(0.1);
  const [orbitRadius, setOrbitRadius] = useState(2);
  const [selectedElement, setSelectedElement] = useState('C');

  const element = elements.find(e => e.symbol === selectedElement) || elements[3];

  const handleElementSelect = (symbol: string) => {
    const el = elements.find(e => e.symbol === symbol);
    if (el) {
      setSelectedElement(symbol);
      setElectrons(el.electrons);
      setNucleusRadius(0.3 + el.z * 0.02);
    }
  };

  const electronConfig = getElectronConfiguration(electrons);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <AtomSimulation 
            electrons={electrons}
            nucleusRadius={nucleusRadius}
            electronRadius={electronRadius}
            orbitRadius={orbitRadius}
          />
        </div>
        
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
          <span className="text-sm text-gray-400">Laboratorio:</span>
          <span className="ml-2 font-medium">Estructura Atómica</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-6">
            <div>
              <span className="text-xs text-gray-400 block">Elemento</span>
              <span className="font-mono font-medium">{element.symbol} - {element.name}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Número Atómico (Z)</span>
              <span className="font-mono font-medium">{element.z}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Electrones</span>
              <span className="font-mono font-medium">{electrons}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Grupo</span>
              <span className="font-mono font-medium">{element.group}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-black/50 backdrop-blur-sm p-6 overflow-y-auto border-l border-white/10">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Estructura Atómica</h2>
          <p className="text-sm text-gray-400">
            Explora la configuración electrónica de diferentes elementos.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Seleccionar Elemento</h3>
          <div className="grid grid-cols-4 gap-2">
            {elements.map((el) => (
              <button
                key={el.symbol}
                onClick={() => handleElementSelect(el.symbol)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  selectedElement === el.symbol
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="text-lg font-bold">{el.symbol}</div>
                <div className="text-xs text-gray-500">{el.z}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Número de electrones: {electrons}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={electrons}
              onChange={(e) => setElectrons(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Radio del núcleo: {nucleusRadius.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={nucleusRadius}
              onChange={(e) => setNucleusRadius(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Radio de órbitas: {orbitRadius.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={orbitRadius}
              onChange={(e) => setOrbitRadius(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium mb-3">Información del Elemento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Símbolo:</span>
                <span className="font-mono font-bold">{element.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span>{element.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Z (Protones):</span>
                <span className="font-mono">{element.z}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Electrones:</span>
                <span className="font-mono">{electrons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Neutrones (aprox):</span>
                <span className="font-mono">{element.z * 2 - (element.z % 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Grupo:</span>
                <span className="text-xs">{element.group}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium mb-3">Configuración Electrónica</h3>
            <div className="space-y-1 text-sm font-mono">
              {electronConfig.map((shell, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-500 w-12">Capa {i + 1}:</span>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{shell}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
