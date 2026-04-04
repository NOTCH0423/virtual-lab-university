'use client';

import { useState } from 'react';

export default function TitrationExperimentPage() {
  const [acidConcentration, setAcidConcentration] = useState(0.1);
  const [baseConcentration, setBaseConcentration] = useState(0.1);
  const [volumeAcid, setVolumeAcid] = useState(25);
  const [currentPH, setCurrentPH] = useState(7);
  const [addedBase, setAddedBase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [indicatorColor, setIndicatorColor] = useState('#3b82f6');

  const maxBaseVolume = (acidConcentration * volumeAcid) / baseConcentration;
  
  const calculatePH = (baseVol: number) => {
    const molesAcid = acidConcentration * volumeAcid / 1000;
    const molesBase = baseConcentration * baseVol / 1000;
    const molesDiff = Math.abs(molesAcid - molesBase);
    const totalVolume = (volumeAcid + baseVol) / 1000;
    
    if (molesAcid > molesBase) {
      const H = molesDiff / totalVolume;
      return Math.max(1, 14 + Math.log10(H));
    } else if (molesBase > molesAcid) {
      const OH = molesDiff / totalVolume;
      const pOH = 14 + Math.log10(OH);
      return Math.min(14, pOH);
    }
    return 7;
  };

  const handleAddBase = () => {
    if (addedBase < maxBaseVolume) {
      const newVolume = addedBase + 1;
      setAddedBase(newVolume);
      const newPH = calculatePH(newVolume);
      setCurrentPH(newVolume);
      
      if (newPH < 4) setIndicatorColor('#ef4444');
      else if (newPH > 10) setIndicatorColor('#8b5cf6');
      else setIndicatorColor('#22c55e');
    }
  };

  const handleReset = () => {
    setAddedBase(0);
    setCurrentPH(7);
    setIndicatorColor('#3b82f6');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-lg">
          <div className="glass-dark rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <svg width="200" height="300" viewBox="0 0 200 300">
                  <defs>
                    <linearGradient id="beakerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                      <stop offset="100%" stopColor={indicatorColor} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M40 50 L40 250 Q40 280 100 280 Q160 280 160 250 L160 50"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="4"
                  />
                  <path
                    d={`M45 ${280 - (addedBase / maxBaseVolume) * 200} L45 245 Q45 275 100 275 Q155 275 155 245 L155 ${280 - (addedBase / maxBaseVolume) * 200} Z`}
                    fill="url(#beakerGrad)"
                    className="transition-all duration-300"
                  />
                  <ellipse
                    cx="100"
                    cy={280 - (addedBase / maxBaseVolume) * 200}
                    rx="55"
                    ry="5"
                    fill={indicatorColor}
                    opacity="0.8"
                  />
                </svg>
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-20 rounded-full transition-all duration-300"
                  style={{ backgroundColor: indicatorColor }}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Volumen de Base añadida</p>
              <p className="text-4xl font-bold mb-4">{addedBase.toFixed(1)} mL</p>
              <p className="text-sm text-gray-400">pH actual: <span className="font-mono text-white">{currentPH.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-96 glass-dark p-6 overflow-y-auto border-l border-white/10">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Titulación Ácido-Base</h2>
          <p className="text-sm text-gray-400">
            Determina la concentración de un ácido añadiendo base gota a gota hasta alcanzar el punto de equivalencia.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Concentración del ácido: {acidConcentration} M
            </label>
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={acidConcentration}
              onChange={(e) => setAcidConcentration(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Concentración de la base: {baseConcentration} M
            </label>
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={baseConcentration}
              onChange={(e) => setBaseConcentration(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Volumen de ácido: {volumeAcid} mL
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={volumeAcid}
              onChange={(e) => setVolumeAcid(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium mb-3">Datos del Experimento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Volumen eq. teórico:</span>
                <span className="font-mono">{maxBaseVolume.toFixed(1)} mL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">pH inicial:</span>
                <span className="font-mono">{calculatePH(0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">pH actual:</span>
                <span className="font-mono">{currentPH.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddBase}
              disabled={addedBase >= maxBaseVolume}
              className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              + Añadir 1mL
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors border border-white/10"
            >
              Reiniciar
            </button>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
            Guardar Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
