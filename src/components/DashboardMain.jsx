import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MOCK_ACCOUNT_DATA } from '../mockTnb/tnbCloudRegistry';

export default function DashboardMain({ currentUser, onLogout, onAddAccount }) {
  // --- STATE MANAGEMENT ---
  const [accountInput, setAccountInput] = useState('');
  
  // Custom threshold baseline parameter (kWh)
  const [activeThreshold, setActiveThreshold] = useState(350);
  
  // Timeframe interval state filter ('DAY' | 'WEEK' | 'MONTH')
  const [timeFilter, setTimeFilter] = useState('MONTH'); 
  
  // Standard preset thresholds for user quick selection
  const BUDGET_PRESETS = [
  { name: 'Low Consumption Plan', value: 250, desc: 'Optimized for minimal energy usage' },
  { name: 'Balanced Operations Plan', value: 350, desc: 'Standard baseline for typical usage' },
  { name: 'High Demand Plan', value: 500, desc: 'Supports peak seasonal or heavy loads' },
];


  // AI Assistant settings and input/output strings
  const [apiKey, setApiKey] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Analyze my energy balances and suggest optimization vectors.');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Drag-and-drop structural order layout array
  const [panelOrder, setPanelOrder] = useState(['PERFORMANCE_MATRIX', 'GEMINI_AI']);
  const [draggedPanel, setDraggedPanel] = useState(null);

  // Hardware mitigation logs and visual state warnings
  const [actionLog, setActionLog] = useState("System idling. Monitoring grid load parameters...");
  const [activeProtocol, setActiveProtocol] = useState('NORMAL');
  const [actionRequiredText, setActionRequiredText] = useState('None. System operations executing within standard parameters.');

  // Print view manager configurations
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    includeGraph: true,
    includeMatrix: true,
    includeConsole: true,
    includeAi: true
  });

// --- USEMEMO: DATA TRACING & TELEMETRY PROCESSING ---
	  // Maps active profile structures from database tracking keys
	  const linkedProfiles = useMemo(() => {
		// REPAIR: Use Optional Chaining (?.) and a Fallback (|| [])
		// If linkedAccounts is missing, it defaults to an empty array [] instead of crashing
		const accounts = currentUser?.linkedAccounts || [];
		
		return accounts
		  .map(id => MOCK_ACCOUNT_DATA[id])
		  .filter(Boolean);
	  }, [currentUser]);

  // Processes raw historical telemetry logs based on active time filter selection
  const telemetryDataStream = useMemo(() => {
    let totalGridKwh = 0;
    let totalSolarKwh = 0;
    let labels = [];
    let gridTrend = [];
    let solarTrend = [];

    // Calculate absolute historical sums for context metrics
    linkedProfiles.forEach(profile => {
      profile.monthlyUsage.forEach((val) => {
        if (profile.type === 'Solar') totalSolarKwh += val;
        else totalGridKwh += val;
      });
    });

    // Populate chart intervals depending on filter criteria
    if (timeFilter === 'DAY') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      gridTrend = [65, 78, 82, 45, 90, 52, 61];
      solarTrend = [40, 55, 60, 62, 35, 70, 68];
    } else if (timeFilter === 'WEEK') {
      labels = ['W1', 'W2', 'W3', 'W4'];
      gridTrend = [210, 245, 195, 260];
      solarTrend = [150, 180, 175, 140];
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      gridTrend = Array(12).fill(0);
      solarTrend = Array(12).fill(0);
      
      linkedProfiles.forEach(profile => {
        profile.monthlyUsage.forEach((val, i) => {
          if (profile.type === 'Solar') solarTrend[i] += val;
          else gridTrend[i] += val;
        });
      });
    }

    const currentWindowGridAvg = gridTrend.reduce((a, b) => a + b, 0) / gridTrend.length;

    return { totalGridKwh, totalSolarKwh, labels, gridTrend, solarTrend, currentWindowGridAvg };
  }, [linkedProfiles, timeFilter]);

  // Computes environmental impact matrix points (Carbon metrics, Costing projections)
  const systemMetrics = useMemo(() => {
    const netKwh = telemetryDataStream.totalGridKwh - telemetryDataStream.totalSolarKwh;
    const totalCost = Math.max(0, netKwh) * 0.218;
    
    const actualGridCarbon = (telemetryDataStream.totalGridKwh * 0.584) / 1000;
    const solarCarbonOffset = (telemetryDataStream.totalSolarKwh * 0.584) / 1000;
    const netCarbonMass = Math.max(0, actualGridCarbon - solarCarbonOffset);

    return { netKwh, totalCost, netCarbonMass, actualGridCarbon, solarCarbonOffset };
  }, [telemetryDataStream]);

  // Adjusts the active threshold target visually matching DAYly scale divisions
  const adjustedThreshold = useMemo(() => {
    if (timeFilter === 'DAY') return (activeThreshold / 4.3).toFixed(0);
    return activeThreshold;
  }, [activeThreshold, timeFilter]);

  // Evaluates risk boundaries (Breach vs Warning cushions)
  const isBreached = telemetryDataStream.currentWindowGridAvg > adjustedThreshold;
  const isPreBreach = !isBreached && telemetryDataStream.currentWindowGridAvg >= (adjustedThreshold * 0.85);
  
  const excessKwh = Math.max(0, telemetryDataStream.currentWindowGridAvg - adjustedThreshold).toFixed(1);
  const bufferKwh = (telemetryDataStream.currentWindowGridAvg * 0.15).toFixed(1);

  // --- USEEFFECT: PROTOCOL LIFECYCLE WATCHER ---
  // Automatically triggers load automation warnings when values surpass target ranges
  useEffect(() => {
	if (isBreached) {
	  setActiveProtocol('SHED');
	  setActionLog(`Critical threshold exceeded: Average intake is ${telemetryDataStream.currentWindowGridAvg.toFixed(1)} kWh, above the ${adjustedThreshold} kWh ceiling.`);
	  setActionRequiredText(`Immediate action required: Initiate building-wide HVAC shedding protocols to reduce intake by ${excessKwh} kWh.`
	  );
	} else if (isPreBreach) {
	  setActiveProtocol('LOAD');
	  setActionLog(`Warning: Consumption has entered the 15% buffer zone. Risk threshold at ${(adjustedThreshold * 0.85).toFixed(0)} kWh.`);
	  setActionRequiredText(`Scheduled adjustment: Engage automated load-shifting to reallocate approximately ${bufferKwh} kWh to off-peak cycles.`);
	} else {
	  setActiveProtocol('NORMAL');
	  setActionLog(`System stable: Average consumption remains within sustainable limits.`);
	  setActionRequiredText(`No action required: Monitoring continues under normal operating conditions.`);
	}
  }, [isBreached, isPreBreach, adjustedThreshold, telemetryDataStream.currentWindowGridAvg, excessKwh, bufferKwh]);

  // --- API SERVICE CALLS ---
  // Forwards analytical data parameters to Gemini Flash nodes
  const triggerGeminiLiveQuery = async () => {
    if (!apiKey) return alert("API Token Missing");
    setIsLoadingAi(true);
    setAiResponse("Querying Gemini core nodes...");

    try {
      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an Energy Audit Expert. Fulfill this request: "${aiPrompt}". System Telemetry: Average Grid Intake is ${telemetryDataStream.currentWindowGridAvg.toFixed(2)} kWh, Solar Generation is ${telemetryDataStream.totalSolarKwh.toFixed(2)} kWh, Target Ceiling is ${adjustedThreshold} kWh.` }] }]
        })
      });
      const jsonResult = await response.json();
      setAiResponse(jsonResult?.candidates?.[0]?.content?.parts?.[0]?.text || "No parseable response from Gemini.");
    } catch (err) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Maps manual user input string tokens to grid registry keys
  const handleLinkAccount = (e) => {
    e.preventDefault();
    if (!MOCK_ACCOUNT_DATA[accountInput]) return alert("Invalid Account ID");
    onAddAccount(accountInput);
    setAccountInput('');
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (id) => setDraggedPanel(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetId) => {
    if (draggedPanel === targetId) return;
    const currentOrder = [...panelOrder];
    const draggedIdx = currentOrder.indexOf(draggedPanel);
    const targetIdx = currentOrder.indexOf(targetId);
    currentOrder.splice(draggedIdx, 1);
    currentOrder.splice(targetIdx, 0, draggedPanel);
    setPanelOrder(currentOrder);
  };

  // Closes dialog layers and calls systemic window print engine
  const handleExecutePrint = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => { window.print(); }, 150);
  };

  const isCustomActive = useMemo(() => {
    return !BUDGET_PRESETS.some(p => p.value === activeThreshold);
  }, [activeThreshold, BUDGET_PRESETS]);

  // --- SUB-RENDER BLOCKS ---
  // Sub-Render Block 1: Structured Data Table (Performance Matrix)
  const renderPerformanceMatrixBlock = () => {
    const gridBaseline = 500.0;
    const gridTarget = parseFloat(adjustedThreshold);
    const gridActual = parseFloat(telemetryDataStream.currentWindowGridAvg);
    const gridVariance = gridTarget > 0 ? ((gridActual - gridTarget) / gridTarget) * 100 : 0;
    
    let gridStatus = "Outstanding";
    let statusClass = "print-status-good bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (gridActual > gridTarget) {
      gridStatus = "Critical";
      statusClass = "print-status-bad bg-rose-500/10 text-rose-400 border-rose-500/30";
    } else if (gridActual >= gridTarget * 0.85) {
      gridStatus = "Satisfactory";
      statusClass = "print-status-warn bg-amber-500/10 text-amber-400 border-amber-500/30";
    }

    const carbonBaseline = (gridBaseline * 12 * 0.548) / 1000;
    const carbonTarget = (gridTarget * 12 * 0.548) / 1000;
    const carbonActual = systemMetrics.netCarbonMass;
    const carbonVariance = carbonTarget > 0 ? ((carbonActual - carbonTarget) / carbonTarget) * 100 : 0;

    let carbonStatus = "Outstanding";
    let carbonStatusClass = "print-status-good bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (carbonActual > carbonTarget) {
      carbonStatus = "Critical";
      carbonStatusClass = "print-status-bad bg-rose-500/10 text-rose-400 border-rose-500/30";
    } else if (carbonActual >= carbonTarget * 0.85) {
      carbonStatus = "Satisfactory";
      carbonStatusClass = "print-status-warn bg-amber-500/10 text-amber-400 border-amber-500/30";
    }

    return (
      <div 
        key="PERFORMANCE_MATRIX" draggable onDragStart={() => handleDragStart('PERFORMANCE_MATRIX')} onDragOver={handleDragOver} onDrop={() => handleDrop('PERFORMANCE_MATRIX')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 cursor-grab active:cursor-grabbing relative group transition-all hover:border-slate-700 printable-section-matrix"
      >
        <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-600 select-none opacity-0 group-hover:opacity-100 transition-opacity print:hidden">☰ Drag Block to Move</div>
        <h3 className="text-sm font-bold text-white print-header-title tracking-wide">Carbon and Energy Performance Matrix
		</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse print-table">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/40 print-tr-head">
                <th className="py-3 px-4 font-bold">No.</th>
                <th className="py-3 px-4 font-bold">Performance Metric ({timeFilter})</th>
                <th className="py-3 px-4 font-bold">Baseline</th>
                <th className="py-3 px-4 font-bold">Target Limit</th>
                <th className="py-3 px-4 font-bold">Actual to Date</th>
                <th className="py-3 px-4 font-bold">Variance (%)</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr className="hover:bg-slate-950/20 transition-colors">
                <td className="py-3.5 px-4 text-slate-500">1</td>
                <td className="py-3.5 px-4 font-sans font-medium text-white print-dark-txt">
                  Site Power Grid Intake <span className="text-[10px] font-mono text-slate-500 block mt-0.5 print:text-gray-500">(Window Avg kWh)</span>
                </td>
                <td className="py-3.5 px-4 print-dark-txt">{gridBaseline.toFixed(1)}</td>
                <td className="py-3.5 px-4 text-teal-400 font-bold print-dark-txt">{parseFloat(adjustedThreshold).toFixed(0)}</td>
                <td className="py-3.5 px-4 font-bold print-dark-txt">{gridActual.toFixed(1)}</td>
                <td className={`py-3.5 px-4 font-bold ${gridVariance >= 0 ? 'text-rose-400 print:text-red-600' : 'text-emerald-400 print:text-green-600'}`}>
                  {gridVariance >= 0 ? `+${gridVariance.toFixed(1)}%` : `${gridVariance.toFixed(1)}%`}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block text-[10px] px-2.5 py-1 rounded border font-bold uppercase tracking-wide min-w-[90px] ${statusClass}`}>
                    {gridStatus}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-950/20 transition-colors">
                <td className="py-3.5 px-4 text-slate-500">2</td>
                <td className="py-3.5 px-4 font-sans font-medium text-white print-dark-txt">
                  Net Infrastructure Footprint <span className="text-[10px] font-mono text-slate-500 block mt-0.5 print:text-gray-500">(Annualized Total tCO2e)</span>
                </td>
                <td className="py-3.5 px-4 print-dark-txt">{carbonBaseline.toFixed(3)}</td>
                <td className="py-3.5 px-4 text-teal-400 font-bold print-dark-txt">{carbonTarget.toFixed(3)}</td>
                <td className="py-3.5 px-4 font-bold print-dark-txt">{carbonActual.toFixed(3)}</td>
                <td className={`py-3.5 px-4 font-bold ${carbonVariance >= 0 ? 'text-rose-400 print:text-red-600' : 'text-emerald-400 print:text-green-600'}`}>
                  {carbonVariance >= 0 ? `+${carbonVariance.toFixed(1)}%` : `${carbonVariance.toFixed(1)}%`}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block text-[10px] px-2.5 py-1 rounded border font-bold uppercase tracking-wide min-w-[90px] ${carbonStatusClass}`}>
                    {carbonStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Sub-Render Block 2: Visual Chart Columns (Graph Rendering Module)
  const renderGraphBlock = () => {
    const maxValOnChart = Math.max(...telemetryDataStream.gridTrend, ...telemetryDataStream.solarTrend, adjustedThreshold, 1000);
    const yAxisCeiling = Math.ceil(maxValOnChart / 250) * 250; 
    const lineY = Math.min(100, (adjustedThreshold / yAxisCeiling) * 100);
    const warningLineY = lineY * 0.85;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all printable-section-graph">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
			<h3 className="text-sm font-bold text-white print-header-title tracking-wide">Resource Stream Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5 print:hidden">Live statistics indicators</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 print:hidden">
              {['DAY', 'WEEK', 'MONTH'].map((type) => (
                <button
                  key={type} type="button" onClick={() => setTimeFilter(type)}
                  className={`text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-md transition-all ${
                    timeFilter === type ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono print:border-gray-300 print:text-black">
              <span className="text-slate-500 print:text-gray-600">Limit ({timeFilter}):</span> <span className="text-rose-400 font-bold print:text-red-600">{adjustedThreshold} kWh</span>
            </div>
          </div>
        </div>

        <div className="flex h-72 relative pt-8 pb-8 pl-12 pr-4 print-chart-window">
          <div className="absolute left-0 top-8 bottom-8 w-10 flex flex-col justify-between text-right text-[10px] font-mono text-slate-500 font-bold pr-2 select-none print:hidden">
            <span>{yAxisCeiling}</span><span>{yAxisCeiling * 0.75}</span><span>{yAxisCeiling * 0.5}</span><span>{yAxisCeiling * 0.25}</span><span className="translate-y-1">0</span>
          </div>
          <div className="absolute left-12 right-4 top-8 bottom-8 flex flex-col justify-between pointer-events-none opacity-25 print:hidden">
            <div className="w-full border-t border-slate-700 border-dashed"></div>
            <div className="w-full border-t border-slate-700 border-dashed"></div>
            <div className="w-full border-t border-slate-700 border-dashed"></div>
            <div className="w-full border-t border-slate-700 border-dashed"></div>
          </div>

          <div className="w-full h-full flex items-end justify-between gap-1 border-b border-slate-800 relative print-bars-container">
            <div style={{ bottom: `${lineY}%` }} className="absolute left-0 right-0 h-0 z-20 pointer-events-none border-t border-dashed border-rose-500/70 print:hidden">
              <span className="absolute right-0 -top-4 text-[9px] font-bold bg-slate-950 px-1.5 py-0.5 rounded text-rose-400 border border-rose-500/20">TARGET: {adjustedThreshold} kWh</span>
            </div>
            <div style={{ bottom: `${warningLineY}%` }} className="absolute left-0 right-0 h-0 z-20 pointer-events-none border-t border-dashed border-amber-500/60 print:hidden">
              <span className="absolute left-0 -top-4 text-[9px] font-bold bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 border border-amber-500/20">CUSHION: {(adjustedThreshold * 0.85).toFixed(0)} kWh</span>
            </div>

            {telemetryDataStream.labels.map((label, idx) => {
              const gridVal = telemetryDataStream.gridTrend[idx] || 0;
              const solarVal = telemetryDataStream.solarTrend[idx] || 0;
              const gridHeight = Math.min(100, (gridVal / yAxisCeiling) * 100);
              const solarHeight = Math.min(100, (solarVal / yAxisCeiling) * 100);
              const barIsBreached = gridVal > adjustedThreshold;
              const barIsPreBreach = !barIsBreached && gridVal >= (adjustedThreshold * 0.85);

              return (
                <div key={`${label}-${idx}`} className="flex-1 h-full flex items-end justify-center relative print-bar-column">
                  <div className="flex flex-col items-center justify-end h-full w-full relative print-sub-bar-wrapper">
                    <div style={{ height: `${gridHeight}%` }} className={`w-full max-w-[14px] rounded-t print-grid-bar-fill ${barIsBreached ? 'bg-rose-500/50 print:bg-red-500' : barIsPreBreach ? 'bg-amber-500/50 print:bg-amber-400' : 'bg-blue-500/40 print:bg-blue-400'}`}></div>
                  </div>
                  <div className="flex flex-col items-center justify-end h-full w-full relative print-sub-bar-wrapper">
                    <div style={{ height: `${solarHeight}%` }} className="w-full max-w-[14px] bg-emerald-500/40 rounded-t print-solar-bar-fill print:bg-emerald-500"></div>
                  </div>
                  <span className="absolute top-full mt-2 text-[10px] text-slate-400 font-mono font-bold tracking-tight text-center whitespace-nowrap print:text-black print-label-text">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center items-center mt-8 text-[10px] font-mono text-slate-400 print:text-black">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500/40 border border-blue-500/60 rounded-sm print:bg-blue-400 print:border-blue-600"></span> Grid Intake</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500/40 border border-emerald-500/60 rounded-sm print:bg-emerald-500 print:border-emerald-600"></span> Solar Output</div>
        </div>
      </div>
    );
  };

  // Sub-Render Block 3: AI Chat Advisory Module
  const renderGeminiAiBlock = () => (
    <div 
      key="GEMINI_AI" draggable onDragStart={() => handleDragStart('GEMINI_AI')} onDragOver={handleDragOver} onDrop={() => handleDrop('GEMINI_AI')}
      className="bg-slate-900 border border-teal-500/30 rounded-xl p-6 cursor-grab active:cursor-grabbing relative group transition-all hover:border-teal-500/50 printable-section-ai"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-2 w-2 bg-teal-400 rounded-full print:hidden animate-pulse shadow-[0_0_8px_#2dd4bf]"></div>
        <div>
          <h3 className="text-sm font-bold text-white print-header-title">AI Energy Control Assistant</h3>
          <p className="text-xs text-slate-400 mt-0.5 print:hidden">Powered by Google Gemini Enterprise</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center print:hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Quick Tasks:</span>
          {[
            { label: "Give Me an Audit Summary", text: "Give me a friendly, 3-bullet point summary of my usage trends and whether I'm spending too much money." },
            { label: "How to Save Money?", text: "Based on my solar and grid numbers, give me 2 simple changes I can make to reduce my monthly electricity bill." },
            { label: "Check My Carbon Footprint", text: "Analyze my net environmental carbon footprint and tell me how my clean solar offsets are helping." }
          ].map((sample) => (
            <button
              key={sample.label} type="button" onClick={() => setAiPrompt(sample.text)}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all font-medium"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 print:hidden">
          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 focus-within:border-teal-500/50 transition-all">
            <input 
              type="text" placeholder="Ask the AI anything about your power usage..." 
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" 
              value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} 
            />
            <button 
              onClick={triggerGeminiLiveQuery} disabled={isLoadingAi} 
              className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              {isLoadingAi ? 'Analyzing...' : 'Ask Assistant'}
            </button>
          </div>
        </div>

        {/* AI response element container targeting web overflow scrollbacks and print expansions */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[100px] max-h-64 overflow-y-auto shadow-inner print-ai-box">
          {aiResponse ? ( 
            <div className="text-xs text-slate-200 leading-relaxed font-sans print:text-black markdown-content">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div> 
          ) : ( 
            <div className="text-xs text-slate-500 italic flex items-center justify-center h-16 print:text-black">No active AI advisory query has been processed for this report block cycle.</div> 
          )}
        </div>
      </div>
    </div>
  );

  // Sub-Render Block 4: Hardwired System Log Terminal
  const renderActiveMitigationConsole = () => {
    let boxStyles = "bg-slate-900 border-slate-800";
    let pulseIndicatorColor = "bg-emerald-400 shadow-[0_0_8px_#34d399]";
    let textBadge = "STABILITY STATUS: NORMAL";
    let textBadgeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

    if (isBreached) {
      boxStyles = "bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.05)]";
      pulseIndicatorColor = "bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]";
      textBadge = "CRITICAL THRESHOLD EXCEEDED";
      textBadgeColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    } else if (isPreBreach) {
      boxStyles = "bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
      pulseIndicatorColor = "bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]";
      textBadge = "WARNING: THRESHOLD APPROACHING";
      textBadgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    }

    return (
      <div className={`transition-all duration-300 rounded-xl p-6 border printable-section-console ${boxStyles}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b border-slate-800/80 print-border-b gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full print:hidden ${pulseIndicatorColor}`}></div>
            <div>
              <h3 className="text-sm font-bold text-white print-header-title tracking-wide">Energy Consuption Logs</h3>
                 </div>
          </div>
          <div>
            <span className={`inline-block text-[10px] font-mono px-2.5 py-1 rounded border font-bold uppercase tracking-wide print:text-black ${textBadgeColor}`}>{textBadge}</span>
          </div>
        </div>
        <div className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">[ STATUS MONITOR ]</span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-[11px] flex items-start gap-2 print-log-box">
              <span className="text-slate-500 select-none font-bold print:hidden">❯_</span>
              <div className="text-slate-300 print:text-black"><strong>Status:</strong> {actionLog}</div>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">[ ENFORCED ACTIONS & PROTOCOLS ]</span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-[11px] flex items-start gap-2 print-log-box">
              <span className="text-slate-500 select-none font-bold print:hidden">❯_</span>
              <div className="text-slate-200 print:text-black"><strong>Action Needed:</strong> {actionRequiredText}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPanel = (id) => {
    if (id === 'PERFORMANCE_MATRIX') return renderPerformanceMatrixBlock();
    if (id === 'GEMINI_AI') return renderGeminiAiBlock();
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-6 print-container-override">
      
      {/* ========================================================================
        EMBEDDED CSS CUSTOM INTERFACE MEDIA-PRINT OVERRIDES
        ========================================================================
      */}
      <style>{`
        /* Web Render Markdown Styling Rules */
        .markdown-content strong { font-weight: bold !important; color: #ffffff !important; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { font-weight: bold !important; color: #2dd4bf !important; margin-top: 8px; margin-bottom: 4px; }
        .markdown-content ul { list-style-type: disc !important; padding-left: 20px !important; margin: 8px 0 !important; }
        .markdown-content li { margin-bottom: 4px !important; }

        /* Media Print Execution Overrides */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .markdown-content strong { color: #000000 !important; }
          .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { color: #0f172a !important; }
          
          html, body, .print-container-override { 
            background: #ffffff !important; 
            color: #000000 !important; 
            font-family: Arial, sans-serif !important;
            padding: 10px !important;
            margin: 0px !important;
            overflow: visible !important;
          }

          /* CRITICAL UNLOCK: Strip absolute web restrictions from draggable container elements */
          .space-y-6 {
            overflow: visible !important;
            display: block !important;
            height: auto !important;
          }
          
          /* Hide non-printable web interactive dashboards */
          .print\\:hidden, header, form, .BUDGET_CTRL, .print-modal-trigger, .drag-handle { 
            display: none !important; 
          }
          
          /* Universal printable cards formatting schema */
          .printable-section-graph, .printable-section-matrix, .printable-section-console, .printable-section-ai {
            display: ${printConfig.includeGraph ? 'block' : 'none'} !important;
            background: #ffffff !important;
            border: 1px solid #64748b !important;
            border-radius: 8px !important;
            padding: 20px !important;
            margin-bottom: 25px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: auto !important;
          }
          
          .printable-section-matrix { display: ${printConfig.includeMatrix ? 'block' : 'none'} !important; }
          .printable-section-console { display: ${printConfig.includeConsole ? 'block' : 'none'} !important; }
          
          /* Allow the AI module block to split over pages natively if text runs deep */
          .printable-section-ai { 
            display: ${printConfig.includeAi ? 'block' : 'none'} !important; 
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          .print-header-title {
            color: #0f172a !important;
            font-size: 14px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }
          .print-dark-txt { color: #000000 !important; }

          /* Data Table printing structural adjustments */
          .print-table { width: 100% !important; border: 1px solid #cbd5e1 !important; }
          .print-tr-head { background-color: #f1f5f9 !important; border-bottom: 2px solid #94a3b8 !important; }
          .print-tr-head th { color: #0f172a !important; padding: 10px !important; font-weight: bold !important; }
          .print-table td { padding: 10px !important; border-bottom: 1px solid #cbd5e1 !important; color: #334155 !important; }
          .print-border-b { border-bottom: 1px solid #cbd5e1 !important; }

          .print-status-good { background: #dcfce7 !important; color: #15803d !important; border: 1px solid #bbf7d0 !important; }
          .print-status-warn { background: #fef3c7 !important; color: #b45309 !important; border: 1px solid #fde68a !important; }
          .print-status-bad { background: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fca5a5 !important; }

          /* Printing fallbacks for Flexbox graph layout engines */
          .print-chart-window { 
            border-bottom: 2px solid #334155 !important; 
            background-color: #f8fafc !important;
            display: block !important;
            height: 220px !important;
            position: relative !important;
            padding-top: 10px !important;
            padding-bottom: 20px !important;
          }
          .print-bars-container {
            display: block !important;
            width: 100% !important;
            height: 180px !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
          }
          .print-bar-column {
            display: inline-block !important;
            width: 7% !important;
            margin-right: 1% !important;
            height: 100% !important;
            position: relative !important;
            vertical-align: bottom !important;
          }
          .print-sub-bar-wrapper {
            display: inline-block !important;
            width: 45% !important;
            height: 100% !important;
            position: relative !important;
            vertical-align: bottom !important;
          }
          .print-grid-bar-fill {
            background-color: #2563eb !important; 
            width: 100% !important;
            position: absolute !important;
            bottom: 0 !important;
            border-radius: 2px 2px 0 0 !important;
          }
          .print-solar-bar-fill {
            background-color: #16a34a !important;
            width: 100% !important;
            position: absolute !important;
            bottom: 0 !important;
            border-radius: 2px 2px 0 0 !important;
          }
          .print-label-text {
            color: #000000 !important;
            font-weight: bold !important;
            position: absolute !important;
            bottom: -20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            text-align: center !important;
            font-size: 9px !important;
          }

          .print-log-box { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 12px !important; border-radius: 6px !important; }
          
          /* ==========================================================================
             FIXED TRUNCATION OVERRIDE FOR THE AI CHAT CONTENT CONTAINER
             ==========================================================================
             This target strips away max-height caps, removes the web scroll mechanism, 
             and opens the layout flow allowing endless text to render natively on the page.
          */
          .print-ai-box { 
            background: #f8fafc !important; 
            border: 1px solid #94a3b8 !important; 
            padding: 14px !important; 
            border-radius: 6px !important;
            max-height: none !important;   /* Strips the max-h-64 web restriction */
            height: auto !important;       /* Forces automatic dimensional tracking expansion */
            overflow: visible !important;  /* Removes scrollbars and renders all text streams */
            display: block !important;
          }

          .markdown-content {
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Allows structural text blocks to break clean across multi-page boundaries */
          .markdown-content p, .markdown-content li {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
        }
      `}</style>

      {/* WEB HEADER VIEW */}
      <header className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">C.OVER: The Unified Dashboard</h2>
          <p className="text-xs text-slate-400 font-mono">Client: <span className="text-teal-400">{currentUser.username}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            type="button" 
            onClick={() => setIsPrintModalOpen(true)}
            className="print-modal-trigger bg-teal-500 hover:bg-teal-400 text-slate-950 font-sans font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
          >
            Print Report
          </button>
          <button onClick={onLogout} className="px-3 py-1.5 border border-slate-800 hover:text-rose-400 text-xs font-bold rounded-lg bg-slate-950">Logout</button>
        </div>
      </header>

      {/* PORTFOLIO CONNECTIONS INPUT MODULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <form onSubmit={handleLinkAccount} className="space-y-2">
          <label className="block text-[10px] font-mono text-slate-500 uppercase">Link Account</label>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. 120034005600" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none" value={accountInput} onChange={(e) => setAccountInput(e.target.value)} />
            <button type="submit" className="bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg">Link</button>
          </div>
        </form>
        <div className="md:col-span-2 space-y-2">
          <span className="block text-[10px] font-mono text-slate-500 uppercase">Active Accounts</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {linkedProfiles.map(p => (
              <div key={p.accountNumber} className="bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{p.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {p.accountNumber}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${p.type === 'Solar' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'}`}>{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THRESHOLD ADJUSTMENT CONTROLLER PANELS */}
      <div className="BUDGET_CTRL bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 print:hidden">
        <div><h3 className="text-sm font-bold text-white print-header-title tracking-wide">Energy Threshold Control</h3></div>
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.name} type="button" onClick={() => setActiveThreshold(preset.value)}
              className={`p-4 rounded-lg border text-left font-mono transition-all flex flex-col justify-between h-24 ${
                activeThreshold === preset.value ? 'bg-teal-950/40 border-teal-500/80 shadow-[0_0_12px_rgba(45,212,191,0.1)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
               <div className={`text-xs font-sans font-bold leading-tight ${activeThreshold === preset.value ? 'text-white' : 'text-slate-300'}`}>{preset.name}</div>
              </div>
              <div className="flex justify-between items-end w-full border-t border-slate-800/60 pt-2 mt-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Target (kWh)</span>
                <span className="text-xs font-bold text-teal-400">{preset.value} kWh</span>
              </div>
            </button>
          ))}
          
          <div className={`p-4 rounded-lg border font-mono transition-all flex flex-col justify-between h-24 ${isCustomActive ? 'bg-teal-950/40 border-teal-500/80 shadow-[0_0_12px_rgba(45,212,191,0.1)]' : 'bg-slate-950 border-slate-800 focus-within:border-slate-700'}`}>
            <div className="space-y-1">
              <span className={`text-xs font-sans font-bold leading-tight ${isCustomActive ? 'text-white' : 'text-slate-300'}`}> Custom Threshold</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2 mt-2 w-full">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Target (kWh)</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-teal-400 focus:outline-none" 
                  value={activeThreshold} onChange={(e) => setActiveThreshold(Math.max(0, parseInt(e.target.value) || 0))} 
                />
                <span className="text-xs font-bold text-teal-400">kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER CHANNELS */}
      {renderGraphBlock()}
      {renderActiveMitigationConsole()}

      {/* SORTABLE DRAG LAYOUT BLOCKS PANEL CONTAINER */}
      <div className="space-y-6">
        {panelOrder.map(panelId => renderPanel(panelId))}
      </div>

      {/* HANDOUT SELECTION CONFIGURATION MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">Component Selection</h3>
              <p className="text-xs text-slate-400 mt-1">Select components to include.</p>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <label className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={printConfig.includeGraph} onChange={(e) => setPrintConfig({...printConfig, includeGraph: e.target.checked})} className="rounded text-teal-500 bg-slate-900 h-4 w-4" />
                <span className="text-slate-200">Include Performance Graph Chart</span>
              </label>
              <label className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={printConfig.includeMatrix} onChange={(e) => setPrintConfig({...printConfig, includeMatrix: e.target.checked})} className="rounded text-teal-500 bg-slate-900 h-4 w-4" />
                <span className="text-slate-200">Include Carbon Matrix Table</span>
              </label>
              <label className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={printConfig.includeConsole} onChange={(e) => setPrintConfig({...printConfig, includeConsole: e.target.checked})} className="rounded text-teal-500 bg-slate-900 h-4 w-4" />
                <span className="text-slate-200">Include Mitigation System Logs</span>
              </label>
              <label className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input type="checkbox" checked={printConfig.includeAi} onChange={(e) => setPrintConfig({...printConfig, includeAi: e.target.checked})} className="rounded text-teal-500 bg-slate-900 h-4 w-4" />
                <span className="text-slate-200">Include Gemini AI Summary Advice</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 border border-slate-800 text-slate-400 text-xs rounded-lg font-bold">Cancel</button>
              <button type="button" onClick={handleExecutePrint} className="px-4 py-2 bg-teal-500 text-slate-950 rounded-lg text-xs font-bold">CONFIRM</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}