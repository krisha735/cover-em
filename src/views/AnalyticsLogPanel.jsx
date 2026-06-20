import React from 'react';
import { INITIAL_HISTORICAL_DATA } from '../constants/energyData';

export default function AnalyticsLogPanel({ exportDataToCSV }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 font-mono">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase text-white">Data Log Registries</h3>
        <button onClick={exportDataToCSV} className="px-3 py-1.5 border border-teal-500 text-teal-400 font-bold text-xs rounded uppercase">
          Export Array (.CSV)
        </button>
      </div>
      <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
            <tr><th className="p-3">Node</th><th className="p-3 text-right">Electricity</th><th className="p-3 text-right">Heating</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-300">
            {INITIAL_HISTORICAL_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-900/60"><td className="p-3 font-bold text-white">{row.month}</td><td className="p-3 text-right">{row.Electricity}</td><td className="p-3 text-right">{row.Heating}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}