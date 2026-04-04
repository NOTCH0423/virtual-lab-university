'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Play, Pause, RotateCcw, Thermometer, Gauge, Wind, Save, Info } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function GasSimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const [isRunning, setIsRunning] = useState(true);
  const [temperature, setTemperature] = useState(300);
  const [pressure, setPressure] = useState(1.0);
  const [particleCount, setParticleCount] = useState(50);
  const [volume, setVolume] = useState(100);
  const [stats, setStats] = useState({ avgSpeed: 0, collisions: 0, kineticEnergy: 0 });
  
  const containerRef = useRef<{ width: number; height: number }>({ width: 600, height: 400 });
  
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
  
  const initParticles = useCallback((count: number) => {
    const particles: Particle[] = [];
    const { width, height } = containerRef.current;
    
    for (let i = 0; i < count; i++) {
      const speedFactor = Math.sqrt(temperature / 300);
      const angle = Math.random() * 2 * Math.PI;
      const speed = (100 + Math.random() * 100) * speedFactor;
      
      particles.push({
        x: 50 + Math.random() * (width - 100),
        y: 50 + Math.random() * (height - 100),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 4,
        color: colors[i % colors.length]
      });
    }
    particlesRef.current = particles;
    return particles;
  }, []);
  
  const updatePhysics = useCallback(() => {
    const particles = particlesRef.current;
    const { width, height } = containerRef.current;
    const wallLoss = 0.98;
    let collisions = 0;
    
    particles.forEach(p => {
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      
      const speedFactor = Math.sqrt(temperature / 300);
      const maxSpeed = 400 * speedFactor;
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      
      if (currentSpeed > maxSpeed) {
        const ratio = maxSpeed / currentSpeed;
        p.vx *= ratio;
        p.vy *= ratio;
      }
      
      if (p.x - p.radius < 0) {
        p.x = p.radius;
        p.vx = -p.vx * wallLoss;
        collisions++;
      }
      if (p.x + p.radius > width) {
        p.x = width - p.radius;
        p.vx = -p.vx * wallLoss;
        collisions++;
      }
      if (p.y - p.radius < 0) {
        p.y = p.radius;
        p.vy = -p.vy * wallLoss;
        collisions++;
      }
      if (p.y + p.radius > height) {
        p.y = height - p.radius;
        p.vy = -p.vy * wallLoss;
        collisions++;
      }
    });
    
    let totalSpeed = 0;
    particles.forEach(p => {
      totalSpeed += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    });
    const avgSpeed = totalSpeed / particles.length;
    const kineticEnergy = 0.5 * particles.length * avgSpeed * avgSpeed * 0.0001;
    
    setStats({
      avgSpeed: avgSpeed,
      collisions: collisions,
      kineticEnergy: kineticEnergy
    });
    
    setPressure((particles.length * temperature * 0.01) / volume);
  }, [temperature, volume]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = containerRef.current;
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);
    
    const particles = particlesRef.current;
    
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const trailLength = Math.min(speed * 0.05, 10);
      const angle = Math.atan2(p.vy, p.vx);
      
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(angle) * trailLength, p.y - Math.sin(angle) * trailLength);
      ctx.strokeStyle = `${p.color}66`;
      ctx.lineWidth = p.radius * 0.5;
      ctx.stroke();
    });
    
    const avgSpeedNorm = Math.min(stats.avgSpeed / 400, 1);
    const barHeight = height - 20;
    const barWidth = 30;
    const pressureHeight = barHeight * pressure / 5;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width - barWidth - 20, 10, barWidth, barHeight);
    
    const pressureGradient = ctx.createLinearGradient(0, barHeight, 0, barHeight - pressureHeight);
    pressureGradient.addColorStop(0, '#22c55e');
    pressureGradient.addColorStop(0.5, '#eab308');
    pressureGradient.addColorStop(1, '#ef4444');
    
    ctx.fillStyle = pressureGradient;
    ctx.fillRect(width - barWidth - 20, barHeight - pressureHeight + 10, barWidth, pressureHeight);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('P', width - barWidth - 5, 25);
    ctx.fillText((pressure * 100).toFixed(0), width - barWidth - 5, barHeight + 25);
  }, [stats.avgSpeed, pressure]);
  
  const animate = useCallback(() => {
    if (isRunning) {
      updatePhysics();
    }
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [isRunning, updatePhysics, draw]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    containerRef.current = { width: canvas.width, height: canvas.height };
    
    initParticles(particleCount);
  }, [particleCount, initParticles]);
  
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);
  
  useEffect(() => {
    particlesRef.current.forEach(p => {
      const speedFactor = Math.sqrt(temperature / 300);
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (currentSpeed > 0) {
        p.vx *= speedFactor;
        p.vy *= speedFactor;
      }
    });
  }, [temperature]);
  
  const handleParticleCountChange = (count: number) => {
    setParticleCount(count);
    initParticles(count);
  };
  
  const resetSimulation = () => {
    initParticles(particleCount);
    setTemperature(300);
    setPressure(1.0);
    setStats({ avgSpeed: 0, collisions: 0, kineticEnergy: 0 });
  };

  const tempColor = temperature < 273 ? '#3b82f6' : temperature < 400 ? '#22c55e' : temperature < 600 ? '#eab308' : '#ef4444';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Teoría Cinética de Gases</h1>
            <p className="text-gray-400 text-sm">Visualiza el comportamiento microscópico de las partículas gaseosas</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isRunning 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Pausar' : 'Reanudar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-[450px]"
              style={{ display: 'block' }}
            />
          </div>

          <div className="col-span-4 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Variables Termodinámicas</div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" style={{ color: tempColor }} />
                    Temperatura
                  </span>
                  <span className="font-mono font-medium" style={{ color: tempColor }}>
                    {temperature.toFixed(0)} K ({(temperature - 273).toFixed(0)}°C)
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  className="w-full"
                  style={{ accentColor: tempColor }}
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Presión
                  </span>
                  <span className="font-mono font-medium text-emerald-400">
                    {(pressure * 101325).toFixed(0)} Pa
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(pressure / 5 * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Partículas
                  </span>
                  <span className="font-mono font-medium text-blue-400">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={particleCount}
                  onChange={(e) => handleParticleCountChange(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Volumen</span>
                  <span className="font-mono font-medium text-purple-400">{volume} L</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Estadísticas</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Velocidad promedio</span>
                  <span className="font-mono font-medium">{stats.avgSpeed.toFixed(1)} m/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Energía cinética</span>
                  <span className="font-mono font-medium text-yellow-400">{stats.kineticEnergy.toFixed(2)} J</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Colisiones/frame</span>
                  <span className="font-mono font-medium text-orange-400">{stats.collisions}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Ley de Gases Ideales</div>
              <div className="text-sm space-y-1">
                <div className="font-mono text-center py-2 bg-slate-900/50 rounded">
                  PV = nRT
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  P = {pressure.toFixed(2)} atm<br/>
                  V = {volume / 100} L<br/>
                  T = {temperature} K<br/>
                  n = {particleCount / 6.022e23} mol
                </div>
              </div>
            </div>

            <button
              onClick={resetSimulation}
              className="w-full py-3 bg-slate-700 text-gray-300 rounded-xl font-medium hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar
            </button>

            <button className="w-full py-3 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Guardar experimento
            </button>
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Sobre la Teoría Cinética</h3>
              <p className="text-sm text-gray-400">
                La teoría cinética de los gases explica el comportamiento de los gases ideales. Las partículas se mueven constantemente en 
                direcciones aleatorias, chocando entre sí y con las paredes del contenedor. La temperatura es directamente proporcional 
                a la energía cinética promedio de las partículas. Presión es el resultado de las colisiones de las partículas contra las paredes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
