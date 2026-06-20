import React from 'react';
import { INITIAL_HISTORICAL_DATA } from '../constants/energyData';

export default function OverviewPanel({ activeInputVal, activeEnergyConfig, currentLiveStatus, systemFinancials, currentUser, selectedEnergy, activeThreshold }) {
  
  // Clean UI mapping for the status badges
  const statusStyles = {
    Safe: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Optimal' },
    Warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Elevated' },
    Critical: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Breach' }
  };

  const currentStyle = statusStyles[currentLiveStatus] || statusStyles.Safe;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 📊 Section 1: Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Consumption */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Consumption</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">{activeInputVal}</span>
            <span className="text-sm font-medium text-slate-500">{activeEnergyConfig.unit}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-xs text-slate-400">
            <span>Configured Target Limit:</span>
            <span className="font-semibold text-slate-300">{activeThreshold} {activeEnergyConfig.unit}</span>
          </div>
        </div>

        {/* Card 2: Operational Health Status */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Health Status</p>
          <div className="mt-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
              <span className="h-2 w-2 rounded-full bg-current"></span>
              {currentStyle.label}
            </span>
          </div>
          <p className="mt-5 text-xs text-slate-400 leading-relaxed">
            {currentLiveStatus === 'Safe' 
              ? 'Telemetry confirms allocations remain within safe structural baselines.' 
              : 'Action advised. Current load matrix displays sub-optimal conservation metrics.'}
          </p>
        </div>

        {/* Card 3: Financial Balance Sheet */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Period Cost</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-white">${systemFinancials.currentTotalCost}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-xs">
            <span className="text-slate-400">Net Variance Saving:</span>
            <span className={`font-bold ${systemFinancials.isSaving ? 'text-emerald-400' : 'text-rose-400'}`}>
              {systemFinancials.isSaving ? `+$${systemFinancials.netSavings}` : `-$${Math.abs(systemFinancials.netSavings).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* 🏢 Section 2: Role Based Management Canvas */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">
              {currentUser.role === 'Business' ? 'Operational Cost Allocation Nodes' : 'Residential Household Cluster Units'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Segmented data views configured specifically for your access clear level.</p>
          </div>
        </div>

        {currentUser.role === 'Business' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
              <p className="font-semibold text-sm text-white mb-2">🏭 Fabrication Plant Alpha</p>
              <p className="text-xs text-slate-400">Primary load focus: <span className="font-semibold text-teal-400">340 kWh</span></p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
              <p className="font-semibold text-sm text-white mb-2">🏢 Logistics Headquarters</p>
              <p className="text-xs text-slate-400">Primary load focus: <span className="font-semibold text-teal-400">120 kWh</span></p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
              <p className="font-semibold text-sm text-white mb-2">📦 Server Infrastructure Loop</p>
              <p className="text-xs text-slate-400">Primary load focus: <span className="font-semibold text-teal-400">85 kWh</span></p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
              <p className="font-semibold text-sm text-white mb-1">🍏 Zone A - Living Spaces</p>
              <p className="text-xs text-slate-400">Consumption distribution scales optimally at roughly 62% efficiency parameters.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
              <p className="font-semibold text-sm text-white mb-1">⚡ Zone B - High Intensity Appliances</p>
              <p className="text-xs text-slate-400">Noticeable runtime cycle overheads recorded across secondary thermal grids.</p>
            </div>
          </div>
        )}
      </div>

      {/* 📉 Section 3: Clean, Elegant Analytical Bar Chart Frame */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h4 className="text-base font-bold text-white">Historical Consumption Matrix</h4>
          <p className="text-xs text-slate-400 mt-0.5">12-Month continuous trajectory records mapped against standard limit baselines.</p>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-800 pb-1">
          {INITIAL_HISTORICAL_DATA.map((item) => {
            const value = item[selectedEnergy] || 0;
            const percentageHeight = Math.min(100, (value / 750) * 100);
            const isBreached = value > activeThreshold;

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Micro Tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-950 text-[10px] text-white py-1 px-2 rounded-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium shadow-xl">
                  {value} {activeEnergyConfig.unit}
                </div>
                
                {/* Sleek Minimalist Bars */}
                <div 
                  style={{ height: `${percentageHeight}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isBreached 
                      ? 'bg-rose-500/70 group-hover:bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)]' 
                      : 'bg-teal-500/60 group-hover:bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.15)]'
                  }`}
                ></div>
                <span className="text-[11px] font-medium text-slate-500 mt-2.5 uppercase tracking-wider">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}