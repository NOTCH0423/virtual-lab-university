'use client';

import { useState } from 'react';

const phases = [
  { name: 'Interfase', description: 'El ADN se replica en el núcleo. La célula prepara sus materiales para dividirse.', color: '#3b82f6' },
  { name: 'Profase', description: 'La cromatina se condensa en cromosomas visibles. El huso mitótico comienza a formarse.', color: '#8b5cf6' },
  { name: 'Metafase', description: 'Los cromosomas se alinean en el ecuador de la célula. El huso mitótico está completamente formado.', color: '#22c55e' },
  { name: 'Anafase', description: 'Las cromátidas hermanas se separan y son atraídas a polos opuestos de la célula.', color: '#f59e0b' },
  { name: 'Telofase', description: 'Los cromosomas llegan a los polos. La envoltura nuclear comienza a regenerarse.', color: '#ef4444' },
  { name: 'Citocinesis', description: 'El citoplasma se divide. Se forman dos células hijas idénticas a la célula madre.', color: '#ec4899' },
];

export default function MitosisExperimentPage() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  const phase = phases[currentPhase];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass-dark rounded-2xl p-8 border border-white/10 w-full max-w-2xl">
          <svg viewBox="0 0 400 400" className="w-full aspect-square">
            <defs>
              <radialGradient id="cellGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
              </radialGradient>
            </defs>
            
            <ellipse
              cx="200"
              cy="200"
              rx={currentPhase >= 3 ? 180 : 150}
              ry={currentPhase >= 3 ? 100 : 150}
              fill="url(#cellGrad)"
              stroke={phase.color}
              strokeWidth="3"
              className="transition-all duration-500"
            />

            {currentPhase === 0 && (
              <g>
                <circle cx="180" cy="200" r="15" fill="#3b82f6" opacity="0.8" />
                <circle cx="220" cy="200" r="15" fill="#3b82f6" opacity="0.8" />
                <circle cx="200" cy="180" r="10" fill="#ef4444" opacity="0.6" />
                <ellipse cx="200" cy="200" rx="80" ry="60" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
              </g>
            )}

            {currentPhase === 1 && (
              <g>
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * Math.PI / 180;
                  const x = 200 + 60 * Math.cos(angle);
                  const y = 200 + 60 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1="200"
                      y1="200"
                      x2={200 + 100 * Math.cos(angle)}
                      y2={200 + 100 * Math.sin(angle)}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  );
                })}
                {[...Array(4)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 90} 200 200)`}>
                    <rect x="180" y="120" width="40" height="15" fill="#8b5cf6" rx="2" />
                    <rect x="180" y="135" width="40" height="15" fill="#a855f7" rx="2" />
                  </g>
                ))}
                <circle cx="200" cy="200" r="8" fill="#ef4444" />
              </g>
            )}

            {currentPhase === 2 && (
              <g>
                {[...Array(4)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 90} 200 200)`}>
                    <rect x="185" y="80" width="30" height="12" fill="#22c55e" rx="2" />
                    <rect x="185" y="92" width="30" height="12" fill="#16a34a" rx="2" />
                    <line x1="200" y1="92" x2="200" y2="40" stroke="#22c55e" strokeWidth="3" />
                  </g>
                ))}
                <line x1="100" y1="200" x2="300" y2="200" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5" />
              </g>
            )}

            {currentPhase === 3 && (
              <g>
                {[...Array(2)].map((_, i) => (
                  <g key={i} transform={`translate(${i === 0 ? -60 : 60}, 0)`}>
                    {[...Array(4)].map((_, j) => (
                      <g key={j} transform={`rotate(${j * 90} 200 200)`}>
                        <rect x="185" y="130" width="30" height="10" fill={i === 0 ? '#f59e0b' : '#fbbf24'} rx="2" />
                        <rect x="185" y="140" width="30" height="10" fill={i === 0 ? '#d97706' : '#f59e0b'} rx="2" />
                      </g>
                    ))}
                  </g>
                ))}
                <line x1="200" y1="80" x2="200" y2="320" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              </g>
            )}

            {currentPhase === 4 && (
              <g>
                {[...Array(2)].map((_, i) => (
                  <g key={i} transform={`translate(${i === 0 ? -70 : 70}, 0)`}>
                    {[...Array(4)].map((_, j) => (
                      <g key={j} transform={`rotate(${j * 90} 200 200)`}>
                        <rect x="187" y="155" width="26" height="8" fill="#ef4444" rx="2" />
                        <rect x="187" y="163" width="26" height="8" fill="#dc2626" rx="2" />
                      </g>
                    ))}
                  </g>
                ))}
                {[...Array(2)].map((_, i) => (
                  <ellipse key={i} cx={200 + (i === 0 ? -70 : 70)} cy="200" rx="70" ry="50" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                ))}
              </g>
            )}

            {currentPhase === 5 && (
              <g>
                {[...Array(2)].map((_, i) => (
                  <g key={i} transform={`translate(${i === 0 ? -80 : 80}, 0)`}>
                    <ellipse cx="200" cy="200" rx="60" ry="80" fill="url(#cellGrad)" stroke={phase.color} strokeWidth="2" />
                    {[...Array(4)].map((_, j) => (
                      <g key={j} transform={`rotate(${j * 90} 200 200)`}>
                        <rect x="187" y="170" width="26" height="6" fill="#ec4899" rx="1" />
                        <rect x="187" y="176" width="26" height="6" fill="#db2777" rx="1" />
                      </g>
                    ))}
                    <circle cx="200" cy="180" r="8" fill="#3b82f6" opacity="0.7" />
                  </g>
                ))}
                <line x1="200" y1="200" x2="200" y2="280" stroke="#ec4899" strokeWidth="2" strokeDasharray="5,5" />
              </g>
            )}

            {showLabels && (
              <g>
                <text x="200" y="380" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  {phase.name}
                </text>
              </g>
            )}
          </svg>

          <div className="mt-6 flex justify-center gap-2">
            {phases.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setCurrentPhase(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentPhase ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 glass-dark p-6 overflow-y-auto border-l border-white/10">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Mitosis en Células Animales</h2>
          <p className="text-sm text-gray-400">
            Observa las fases de la división celular mitótica en una célula animal.
          </p>
        </div>

        <div className="mb-6">
          <div
            className="p-4 rounded-xl border-2"
            style={{ borderColor: phase.color, backgroundColor: `${phase.color}20` }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: phase.color }}>
              {phase.name}
            </h3>
            <p className="text-sm text-gray-300">
              {phase.description}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Fases de la Mitosis</h3>
          <div className="space-y-2">
            {phases.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setCurrentPhase(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  i === currentPhase
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {i + 1}
                </div>
                <span className={i === currentPhase ? 'text-white' : 'text-gray-400'}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              showLabels
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            {showLabels ? 'Ocultar' : 'Mostrar'} Etiquetas
          </button>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <h3 className="text-sm font-medium mb-3">Información Clave</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo de célula:</span>
              <span>Animal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cromosomas:</span>
              <span>4 pares (diploide)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resultado:</span>
              <span>2 células idénticas</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
            disabled={currentPhase === 0}
            className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50 border border-white/10"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPhase(Math.min(phases.length - 1, currentPhase + 1))}
            disabled={currentPhase === phases.length - 1}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <button className="w-full mt-3 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
          Guardar y Continuar
        </button>
      </div>
    </div>
  );
}
