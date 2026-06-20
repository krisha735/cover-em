import React from 'react';
import { ENERGY_TYPES } from '../constants/energyData';

export default function UsageTrackerPanel({ currentUsageInputs, updateUsageValue, thresholds, setThresholds }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-teal-400">⚡ Entry Adjustments</h4>
        {Object.keys(ENERGY_TYPES).map((key) => (
          <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-white font-bold uppercase">{ENERGY_TYPES[key].label}</span>
            <input 
              type="number"
              className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-right text-white font-bold"
              value={currentUsageInputs[key]}
              onChange={(e) => updateUsageValue(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-cyan-400">🛡️ Upper Safety Boundaries</h4>
        {Object.keys(ENERGY_TYPES).map((key) => (
          <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-white uppercase">{ENERGY_TYPES[key].label}</span><span className="text-cyan-400 font-bold">{thresholds[key]}</span></div>
            <input type="range" min="10" max="1500" className="w-full accent-cyan-500" value={thresholds[key]} onChange={(e) => setThresholds({...thresholds, [key]: parseInt(e.target.value) || 0})} />
          </div>
        ))}
      </div>
    </div>
  );
}