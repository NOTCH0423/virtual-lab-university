'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Play, Pause, RotateCcw, Zap, Save, Info, Plus, Minus, Trash2 } from 'lucide-react';

interface Component {
  id: string;
  type: 'battery' | 'resistor' | 'bulb' | 'wire';
  x: number;
  y: number;
  value?: number;
  connected: string[];
}

interface CircuitStats {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
}

const COLORS = {
  wire: '#94a3b8',
  battery: '#22c55e',
  resistor: '#f97316',
  bulb: '#eab308',
  background: '#0f172a',
  grid: '#1e293b',
};

export default function CircuitAnalysisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<Component[]>([
    { id: 'b1', type: 'battery', x: 100, y: 150, value: 9, connected: [] },
    { id: 'r1', type: 'resistor', x: 250, y: 150, value: 100, connected: [] },
    { id: 'b2', type: 'bulb', x: 400, y: 150, value: 6, connected: [] },
  ]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'wire' | 'battery' | 'resistor' | 'bulb'>('select');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [circuitStats, setCircuitStats] = useState<CircuitStats>({ voltage: 9, current: 0.045, resistance: 200, power: 0.405 });
  const [isPowered, setIsPowered] = useState(true);

  const drawCircuit = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    components.forEach((comp) => {
      ctx.save();
      ctx.translate(comp.x, comp.y);
      
      switch (comp.type) {
        case 'battery':
          ctx.strokeStyle = isPowered ? COLORS.battery : '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(0, 15);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(8, -8);
          ctx.lineTo(8, 8);
          ctx.stroke();
          ctx.fillStyle = isPowered ? '#22c55e' : '#64748b';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${comp.value}V`, 0, 30);
          break;
          
        case 'resistor':
          ctx.strokeStyle = COLORS.resistor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-25, 0);
          ctx.lineTo(-15, 0);
          ctx.lineTo(-10, -10);
          ctx.lineTo(0, 10);
          ctx.lineTo(10, -10);
          ctx.lineTo(15, 0);
          ctx.lineTo(25, 0);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${comp.value}Ω`, 0, 25);
          break;
          
        case 'bulb':
          ctx.fillStyle = isPowered ? '#fef08a' : '#475569';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (isPowered) {
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 8; i++) {
              const angle = (i * Math.PI) / 4;
              ctx.beginPath();
              ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
              ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${comp.value}W`, 0, 30);
          break;
      }
      
      if (selectedComponent === comp.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-35, -25, 70, 50);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
    
    const bat = components.find(c => c.type === 'battery');
    const res = components.find(c => c.type === 'resistor');
    if (bat && res && isPowered) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bat.x - 30, bat.y);
      ctx.lineTo(res.x + 25, res.y);
      ctx.stroke();
    }
  }, [components, selectedComponent, isPowered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawCircuit(ctx, canvas.width, canvas.height);
  }, [drawCircuit]);

  useEffect(() => {
    const totalVoltage = components.filter(c => c.type === 'battery').reduce((sum, c) => sum + (c.value || 0), 0);
    const totalResistance = components.filter(c => c.type === 'resistor').reduce((sum, c) => sum + (c.value || 0), 0) + 10;
    const current = totalVoltage / totalResistance;
    const power = totalVoltage * current;
    
    setCircuitStats({
      voltage: totalVoltage,
      current,
      resistance: totalResistance,
      power
    });
  }, [components]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clicked = components.find(comp => {
      const dx = comp.x - x;
      const dy = comp.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });
    
    if (clicked) {
      setSelectedComponent(clicked.id);
    } else {
      setSelectedComponent(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const addComponent = () => {
    const id = `${selectedTool}_${Date.now()}`;
    const newComp: Component = {
      id,
      type: selectedTool as 'battery' | 'resistor' | 'bulb',
      x: mousePos.x,
      y: mousePos.y,
      value: selectedTool === 'battery' ? 9 : selectedTool === 'resistor' ? 100 : 6,
      connected: []
    };
    setComponents([...components, newComp]);
  };

  const deleteComponent = () => {
    if (selectedComponent) {
      setComponents(components.filter(c => c.id !== selectedComponent));
      setSelectedComponent(null);
    }
  };

  const updateComponentValue = (value: number) => {
    if (selectedComponent) {
      setComponents(components.map(c => 
        c.id === selectedComponent ? { ...c, value } : c
      ));
    }
  };

  const resetCircuit = () => {
    setComponents([
      { id: 'b1', type: 'battery', x: 100, y: 150, value: 9, connected: [] },
      { id: 'r1', type: 'resistor', x: 250, y: 150, value: 100, connected: [] },
      { id: 'b2', type: 'bulb', x: 400, y: 150, value: 6, connected: [] },
    ]);
    setSelectedComponent(null);
    setIsPowered(true);
  };

  const selectedCompData = selectedComponent ? components.find(c => c.id === selectedComponent) : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Análisis de Circuitos</h1>
            <p className="text-gray-400 text-sm">Diseña y analiza circuitos eléctricos con componentes interactivos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPowered(!isPowered)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPowered 
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              {isPowered ? 'Circuito Activado' : 'Circuito Desactivado'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-[500px] cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />
          </div>

          <div className="col-span-4 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Herramientas</div>
              <div className="grid grid-cols-4 gap-2">
                {(['select', 'battery', 'resistor', 'bulb'] as const).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedTool === tool 
                        ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' 
                        : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'
                    }`}
                  >
                    {tool === 'select' && <Zap className="w-5 h-5 mx-auto" />}
                    {tool === 'battery' && <span className="text-lg">🔋</span>}
                    {tool === 'resistor' && <span className="text-lg">⚡</span>}
                    {tool === 'bulb' && <span className="text-lg">💡</span>}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={addComponent}
                  disabled={selectedTool === 'select'}
                  className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
                <button
                  onClick={deleteComponent}
                  disabled={!selectedComponent}
                  className="py-2 px-3 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Estadísticas del Circuito</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Voltaje total
                  </span>
                  <span className="font-mono font-medium text-emerald-400">{circuitStats.voltage.toFixed(1)} V</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Corriente
                  </span>
                  <span className="font-mono font-medium text-blue-400">{(circuitStats.current * 1000).toFixed(1)} mA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Resistencia
                  </span>
                  <span className="font-mono font-medium text-orange-400">{circuitStats.resistance.toFixed(0)} Ω</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Potencia
                  </span>
                  <span className="font-mono font-medium text-yellow-400">{circuitStats.power.toFixed(3)} W</span>
                </div>
              </div>
            </div>

            {selectedCompData && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Editar {selectedCompData.type === 'battery' ? 'Batería' : selectedCompData.type === 'resistor' ? 'Resistencia' : 'Bombilla'}
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm">
                      {selectedCompData.type === 'battery' ? 'Voltaje (V)' : 
                       selectedCompData.type === 'resistor' ? 'Resistencia (Ω)' : 'Potencia (W)'}
                    </span>
                    <span className="font-mono">{selectedCompData.value}</span>
                  </label>
                  <input
                    type="range"
                    min={selectedCompData.type === 'battery' ? 1 : 1}
                    max={selectedCompData.type === 'battery' ? 24 : selectedCompData.type === 'resistor' ? 1000 : 100}
                    value={selectedCompData.value}
                    onChange={(e) => updateComponentValue(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={resetCircuit}
              className="w-full py-3 bg-slate-700 text-gray-300 rounded-xl font-medium hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar circuito
            </button>

            <button className="w-full py-3 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Guardar diseño
            </button>
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Ley de Ohm</h3>
              <p className="text-sm text-gray-400">
                V = I × R (Voltaje = Corriente × Resistencia). La potencia se calcula como P = V × I o P = V²/R.
                Usa el simulador para verificar las relaciones entre voltaje, corriente y resistencia en diferentes configuraciones de circuito.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
