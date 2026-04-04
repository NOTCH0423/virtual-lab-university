'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Play, Pause, RotateCcw, Zap, TrendingUp, Target, Timer, Gauge, Save, Info } from 'lucide-react';

interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  velocity: number;
}

interface TrajectoryPoint {
  x: number;
  y: number;
  t: number;
}

export default function ProjectileMotionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(50);
  const [gravity, setGravity] = useState(9.81);
  const [projectile, setProjectile] = useState<ProjectileState | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [stats, setStats] = useState({ time: 0, maxHeight: 0, range: 0, currentHeight: 0 });
  const [hasLanded, setHasLanded] = useState(false);

  const g = gravity;
  const v0 = velocity;
  const theta = (angle * Math.PI) / 180;
  
  const maxRange = (v0 * v0 * Math.sin(2 * theta)) / g;
  const maxHeight = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);
  const flightTime = (2 * v0 * Math.sin(theta)) / g;
  const theoreticalRange = (velocity * velocity * Math.sin(2 * theta)) / gravity;

  const resetSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRunning(false);
    setProjectile(null);
    setTrajectory([]);
    setStats({ time: 0, maxHeight: 0, range: 0, currentHeight: 0 });
    setHasLanded(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawScene(ctx, canvas.width, canvas.height, null, [], angle, velocity);
      }
    }
  }, [angle, velocity]);

  const drawScene = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    proj: ProjectileState | null,
    traj: TrajectoryPoint[],
    ang: number,
    vel: number
  ) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    const groundY = height - 50;
    const scaleX = (width - 100) / (maxRange * 1.2);
    const scaleY = (height - 100) / (maxHeight * 1.5);
    const scale = Math.min(scaleX, scaleY);
    const offsetX = 50;
    const offsetY = groundY;
    
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(width - 20, offsetY);
    ctx.stroke();
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= maxRange * 1.2; i += maxRange / 5) {
      const x = offsetX + i * scale;
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + 10);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`${i.toFixed(0)}m`, x - 10, offsetY + 20);
    }
    
    for (let i = 0; i <= maxHeight * 1.5; i += maxHeight / 4) {
      const y = offsetY - i * scale;
      ctx.beginPath();
      ctx.moveTo(offsetX - 10, y);
      ctx.lineTo(offsetX, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`${i.toFixed(1)}m`, offsetX - 45, y + 3);
    }
    
    if (traj.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      traj.forEach((p, i) => {
        const x = offsetX + p.x * scale;
        const y = offsetY - p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    if (proj) {
      const px = offsetX + proj.x * scale;
      const py = offsetY - proj.y * scale;
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(px - 2, py - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.lineTo(px, py);
      ctx.stroke();
      
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 20 * Math.cos(proj.angle - Math.PI / 6), py + 20 * Math.sin(proj.angle - Math.PI / 6));
      ctx.lineTo(px - 20 * Math.cos(proj.angle + Math.PI / 6), py + 20 * Math.sin(proj.angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + 30, offsetY - 30);
    ctx.lineTo(offsetX + 50, offsetY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    const cannonAngle = (ang * Math.PI) / 180;
    const cx = offsetX + 25;
    const cy = offsetY - 15;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-cannonAngle);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, -6, 35, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    
    if (hasLanded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(width / 2 - 150, height / 2 - 40, 300, 80);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('¡Impacto!', width / 2, height / 2);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Alcance: ${traj[traj.length - 1]?.x.toFixed(2)}m`, width / 2, height / 2 + 25);
      ctx.textAlign = 'left';
    }
  }, [maxRange, maxHeight, hasLanded]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const t = elapsed;
    
    const vx = velocity * Math.cos(theta);
    const vy = velocity * Math.sin(theta);
    
    const x = vx * t;
    const y = vy * t - 0.5 * g * t * t;
    
    if (y < 0) {
      setHasLanded(true);
      setIsRunning(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      const finalX = (velocity * velocity * Math.sin(2 * theta)) / g;
      setStats(prev => ({ ...prev, range: finalX, currentHeight: 0 }));
      
      drawScene(ctx, canvas.width, canvas.height, { x: finalX, y: 0, vx, vy: 0, angle: theta, velocity }, trajectory, angle, velocity);
      return;
    }
    
    const currentAngle = Math.atan2(vy - g * t, vx);
    
    setProjectile({ x, y, vx, vy, angle: currentAngle, velocity });
    setStats(prev => ({
      time: elapsed,
      maxHeight: Math.max(prev.maxHeight, y),
      range: x,
      currentHeight: y
    }));
    
    setTrajectory(prev => [...prev, { x, y, t: elapsed }]);
    
    drawScene(ctx, canvas.width, canvas.height, { x, y, vx, vy, angle: currentAngle, velocity }, [...trajectory, { x, y, t: elapsed }], angle, velocity);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [velocity, theta, g, angle, trajectory, drawScene]);

  const startSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTrajectory([]);
    setHasLanded(false);
    startTimeRef.current = Date.now();
    setIsRunning(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const pauseSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawScene(ctx, canvas.width, canvas.height, null, [], angle, velocity);
    }
  }, [angle, velocity, drawScene]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lanzador de Proyectiles</h1>
            <p className="text-gray-400 text-sm">Estudia el movimiento parabólico con variables ajustables</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {isRunning ? 'En movimiento' : hasLanded ? 'Finalizado' : 'Listo'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-96"
              style={{ display: 'block' }}
            />
          </div>

          <div className="col-span-4 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Estadísticas</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Timer className="w-4 h-4" /> Tiempo
                  </span>
                  <span className="font-mono font-medium">{stats.time.toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Altura máx
                  </span>
                  <span className="font-mono font-medium">{stats.maxHeight.toFixed(2)}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Alcance
                  </span>
                  <span className="font-mono font-medium">{stats.range.toFixed(2)}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Altura actual
                  </span>
                  <span className="font-mono font-medium">{stats.currentHeight.toFixed(2)}m</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Parámetros</div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm">Ángulo: {angle}°</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="85"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm">Velocidad: {velocity} m/s</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={velocity}
                    onChange={(e) => setVelocity(parseInt(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm">Gravedad: {gravity.toFixed(2)} m/s²</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={gravity}
                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Valores Teóricos</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Alcance máximo:</span>
                  <span className="font-mono">{theoreticalRange.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Altura máxima:</span>
                  <span className="font-mono">{maxHeight.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo de vuelo:</span>
                  <span className="font-mono">{flightTime.toFixed(2)} s</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <button
                  onClick={startSimulation}
                  className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={pauseSimulation}
                  className="flex-1 py-3 bg-amber-500/20 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pausar
                </button>
              )}
              <button
                onClick={resetSimulation}
                className="py-3 px-4 bg-slate-700 text-gray-300 rounded-xl font-medium hover:bg-slate-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <button className="w-full py-3 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Guardar resultados
            </button>
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Sobre el movimiento parabólico</h3>
              <p className="text-sm text-gray-400">
                El movimiento de un proyectil es la combinación de un movimiento horizontal uniforme y un movimiento vertical uniformemente acelerado. 
                Las ecuaciones son: x = v₀·cos(θ)·t para la posición horizontal, y v₀·sin(θ)·t - ½gt² para la posición vertical.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
