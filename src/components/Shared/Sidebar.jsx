import React from 'react';

export default function Sidebar({ currentUser, activeTab, setActiveTab, alertsCount, onLogout }) {
  const tabs = ['Overview', 'Usage Tracker', 'AI Forecaster', 'Analytics Log', 'System Alerts'];
  const tabIcons = { 'Overview': '📊', 'Usage Tracker': '⚡', 'AI Forecaster': '🧠', 'Analytics Log': '📈', 'System Alerts': '⚠️' };

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono font-black text-white text-md uppercase">DoubleDot <span className="text-teal-400">EMS</span></span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mt-0.5">{currentUser.role} Node</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-between ${activeTab === tab ? 'bg-gradient-to-r from-teal-950 to-slate-900 text-teal-400 border-l-2 border-teal-500' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="flex items-center gap-2">
                <span>{tabIcons[tab]}</span>
                <span>{tab}</span>
              </span>
              {tab === 'System Alerts' && alertsCount > 0 && (
                <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">{alertsCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/60 font-mono flex items-center justify-between">
        <div className="truncate"><p className="text-[10px] text-slate-500 uppercase">Call-Sign</p><p className="text-xs text-white font-bold truncate">u/{currentUser.username}</p></div>
        <button onClick={onLogout} className="p-1 px-2 text-[10px] bg-slate-900 border border-slate-800 hover:text-rose-400 rounded uppercase font-bold">Exit</button>
      </div>
    </aside>
  );
}