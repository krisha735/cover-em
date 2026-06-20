import React from 'react';

export default function SystemAlertsPanel({ alerts, setAlerts }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 font-mono">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase text-white">Boundary Alert Terminal</h3>
        {alerts.length > 0 && <button onClick={() => setAlerts([])} className="text-xs text-rose-400 uppercase font-bold">Flush</button>}
      </div>
      {alerts.length === 0 ? <div className="text-slate-500 text-xs">Zero issues flag active threads.</div> : (
        alerts.map(a => (
          <div key={a.id} className="bg-slate-950 border border-slate-800 p-3 rounded border-l-2 border-l-rose-500 text-xs text-slate-300">
            {a.msg}
          </div>
        ))
      )}
    </div>
  );
}