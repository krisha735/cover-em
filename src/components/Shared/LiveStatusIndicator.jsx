import React from 'react';

export default function LiveStatusIndicator({ currentLiveStatus }) {
  const colorMap = {
    Safe: 'bg-emerald-500 text-emerald-400',
    Warning: 'bg-amber-500 text-amber-400 animate-bounce',
    Critical: 'bg-rose-500 text-rose-400 animate-ping'
  };

  return (
    <div className="mt-1 flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colorMap[currentLiveStatus]?.split(' ')[0]}`}></span>
      <p className={`text-xl font-black font-mono uppercase tracking-wide ${colorMap[currentLiveStatus]?.split(' ')[1]}`}>{currentLiveStatus}</p>
    </div>
  );
}
