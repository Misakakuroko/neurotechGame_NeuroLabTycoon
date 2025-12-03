import React, { useMemo } from 'react';
import { useGameStore, SequenceType } from '../store/gameStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { AlertTriangle, CheckCircle, Play, ShieldCheck, Brain, Sliders, Microscope, Target, Zap, Gauge } from 'lucide-react';
import TechSlider from './TechSlider';
import ScientificCitation from './ScientificCitation';

const SafetyConsole: React.FC = () => {
  const { experimentParams, scanParams, shimming, labSetup, setExperimentParam, setScanParam, setShimming, toggleChecklist, setGameStage, tutorialActive, tutorialStep } = useGameStore();
  const { modelCountN, checklist } = experimentParams;
  const { subjectType } = useGameStore();
  
  // Helper for tutorial highlighting
  const isTutHighlight = (step: number) => tutorialActive && tutorialStep === step;

  // --- Calculations for Visual Feedback ---
  const fieldStrength = labSetup.magnetType === '11.7T' ? 11.7 : labSetup.magnetType === '7T' ? 7 : 3;
  const baseSNR = fieldStrength * 15;
  
  const resPenalty = 1 / Math.pow(scanParams.resolution, 3); // Corrected to cubic (voxel volume)
  const timeBenefit = Math.sqrt(scanParams.scanDuration);
  const seqMult = scanParams.sequence === 'SE' ? 1.5 : scanParams.sequence === 'GRE' ? 1.0 : 0.8;
  
  const safetyFactor = 1 + 5.37 * Math.pow(modelCountN, -0.75); // rASF
  const powerClamp = Math.min(1, 1.5 / safetyFactor); 

  const predictedSNR = baseSNR * (1/resPenalty) * timeBenefit * seqMult * powerClamp;
  
  const baseGradientDemand = (3.5 - scanParams.resolution) * 80; 
  const seqGradientMult = scanParams.sequence === 'EPI' ? 1.5 : 1.0;
  const totalGradientDemand = baseGradientDemand * seqGradientMult;

  const gradientCapacity = labSetup.gradientType === 'Connectome' ? 300 : labSetup.gradientType === 'HighPerf' ? 200 : 80;
  const gradientLoad = Math.min(100, (totalGradientDemand / gradientCapacity) * 100);
  const isGradientOverloaded = totalGradientDemand > gradientCapacity;

  const pnsRisk = Math.min(100, (totalGradientDemand / 250) * 100); 
  const isPNSWarning = pnsRisk > 85;

  const shimError = Math.abs(shimming.x) + Math.abs(shimming.y) + Math.abs(shimming.z);
  const shimBlur = shimError / 20; 
  const motionBlur = scanParams.scanDuration > 10 ? (scanParams.scanDuration - 10) * 0.5 : 0; 
  const totalBlur = shimBlur + motionBlur + (3 - scanParams.resolution)*1; 

  const hasRFArtifacts = (labSetup.magnetType === '11.7T' || labSetup.magnetType === '7T') && !labSetup.pTxEnabled;

  // --- Charts ---
  const calculateASF = (n: number) => 1 + 5.37 * Math.pow(n, -0.75);
  const currentASF = calculateASF(modelCountN);
  const chartData = useMemo(() => {
    const data: { n: number; asf: number }[] = [];
    for (let n = 2; n <= 64; n += 2) {
      data.push({ n, asf: parseFloat(calculateASF(n).toFixed(2)) });
    }
    return data;
  }, []);

  const handleRunScan = () => {
    setGameStage('review');
  };

  const allChecksPassed = Object.values(checklist).every(Boolean) && !isGradientOverloaded;

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl backdrop-blur-md">
          <p className="text-slate-400 text-[10px] font-mono uppercase">Models: {label}</p>
          <p className="text-blue-400 text-xs font-mono font-bold">rASF: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Visualization of Shimming Distortions
  // We apply skew and scale transforms based on shim errors
  const shimTransform = `
    perspective(1000px)
    rotateX(${shimming.y / 5}deg) 
    rotateY(${shimming.x / 5}deg) 
    scale(${1 + shimming.z / 200})
  `;

  // New: Shim Quality Check
  const isShimGood = shimError < 15; // Threshold for green grid
  const gridColor = isShimGood ? 'rgba(0, 255, 128, 0.3)' : 'rgba(255, 50, 50, 0.4)'; // Green vs Red

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-200 relative animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
            <ShieldCheck className="w-8 h-8 text-blue-500" /> 
            Scan Control <span className="text-slate-600">Room</span>
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            Target Subject: <span className="text-blue-400 font-mono uppercase bg-blue-900/20 px-2 py-0.5 rounded text-xs border border-blue-800 shadow-[0_0_10px_rgba(37,99,235,0.2)]">{subjectType}</span>
          </p>
        </div>
        <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Predicted SNR</div>
            <div className={`text-4xl font-mono font-bold tracking-tighter ${predictedSNR > 50 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-amber-500'}`}>
                {predictedSNR.toFixed(1)} <span className="text-base text-slate-600 font-normal">dB</span>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Physics Controls */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Pulse Sequence Params */}
            <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md space-y-6 transition-all shadow-xl hover:border-slate-700/80 group ${isTutHighlight(7) ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 z-10' : ''}`}>
                <h3 className="font-bold text-slate-300 flex items-center gap-2 text-xs uppercase tracking-wider border-b border-slate-800 pb-2 group-hover:text-purple-400 transition-colors">
                    <Microscope className="w-3 h-3 text-purple-500" /> Pulse Sequence
                </h3>
                
                <div className="flex gap-2 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                    {(['GRE', 'SE', 'EPI'] as SequenceType[]).map(seq => {
                         const content = (
                            <button 
                                onClick={() => setScanParam({ sequence: seq })}
                                className={`w-full h-full py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded transition-all ${scanParams.sequence === seq ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {seq}
                            </button>
                        );

                        return (
                             <div className="flex-1" key={seq}>
                                <ScientificCitation 
                                    refId={seq === 'GRE' ? 'GRE' : seq === 'SE' ? 'SE' : 'EPI'} 
                                    position="top"
                                    className="block w-full h-full"
                                >
                                    {content}
                                </ScientificCitation>
                             </div>
                        );
                    })}
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <ScientificCitation refId="Mesoscopic" position="right">
                             <div className="absolute -top-1 right-0 text-[9px] text-purple-400/60 font-mono uppercase tracking-wider cursor-help hover:text-purple-300 border-b border-dashed border-purple-400/30">
                                Target: Mesoscopic
                             </div>
                        </ScientificCitation>
                        <TechSlider 
                            label="Resolution"
                            value={scanParams.resolution}
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            unit="mm"
                            color="purple"
                            onChange={(val) => setScanParam({ resolution: val })}
                        />
                    </div>

                    <TechSlider 
                        label="Scan Duration"
                        value={scanParams.scanDuration}
                        min={1}
                        max={20}
                        step={1}
                        unit="min"
                        color="purple"
                        warning={scanParams.scanDuration > 10}
                        warningMsg="Risk of Motion Artifacts"
                        onChange={(val) => setScanParam({ scanDuration: val })}
                    />
                </div>
            </div>

            {/* New: Gradient Load / PNS */}
            <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md space-y-6 shadow-xl transition-all hover:border-slate-700/80 group ${isTutHighlight(8) ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 z-10' : ''}`}>
                 <h3 className="font-bold text-slate-300 flex items-center gap-2 text-xs uppercase tracking-wider border-b border-slate-800 pb-2 group-hover:text-orange-400 transition-colors">
                    <Gauge className="w-3 h-3 text-orange-500" /> Gradient Load
                </h3>
                
                {/* Load Meter */}
                <div>
                   <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wide">
                       <span className="text-slate-400">Duty Cycle</span>
                       <span className={isGradientOverloaded ? 'text-red-500 font-bold animate-pulse' : 'text-orange-300'}>
                           {gradientLoad.toFixed(0)}% {isGradientOverloaded && '!'}
                       </span>
                   </div>
                   <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                       <div className={`h-full rounded-full transition-all duration-500 ${isGradientOverloaded ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, gradientLoad)}%` }}></div>
                   </div>
                </div>

                {/* PNS Meter */}
                <div>
                   <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wide">
                       <ScientificCitation refId="SAR" position="right">
                           <span className="text-slate-400 border-b border-dashed border-slate-700 hover:text-blue-400 hover:border-blue-400 transition-colors cursor-help">PNS Risk / SAR</span>
                       </ScientificCitation>
                       <span className={isPNSWarning ? 'text-amber-500 font-bold' : 'text-emerald-300'}>
                           {pnsRisk.toFixed(0)}%
                       </span>
                   </div>
                   <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                       <div className={`h-full rounded-full transition-all duration-500 ${isPNSWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, pnsRisk)}%` }}></div>
                   </div>
                </div>
            </div>

            {/* 2. VOP Safety */}
            <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl transition-all hover:border-slate-700/80 group ${isTutHighlight(9) ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 z-10' : ''}`}>
                <h3 className="font-bold text-slate-300 flex items-center gap-2 mb-6 text-xs uppercase tracking-wider border-b border-slate-800 pb-2 group-hover:text-blue-400 transition-colors">
                    <Brain className="w-3 h-3 text-blue-500" /> 
                    <ScientificCitation refId="VOP" position="right">
                        <span>VOP Safety Model (N)</span>
                    </ScientificCitation>
                </h3>
                
                <TechSlider 
                    label="Virtual Models"
                    value={modelCountN}
                    min={2}
                    max={64}
                    step={1}
                    color="blue"
                    onChange={(val) => setExperimentParam({ modelCountN: val })}
                />
                
                <div className="mt-4 flex justify-between items-center bg-slate-950/50 p-3 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Safety Factor (rASF)</span>
                    <span className={`font-mono font-bold text-sm ${currentASF < 1.2 ? 'text-red-400' : 'text-blue-400'}`}>{currentASF.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-2 italic opacity-70">
                    More Virtual Observation Points (N) allow for tighter safety margins, enabling higher B1+ power usage.
                </p>
            </div>

            {/* 3. Shimming */}
            <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md space-y-4 shadow-xl transition-all hover:border-slate-700/80 group ${isTutHighlight(10) ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 z-10' : ''}`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                     <h3 className="font-bold text-slate-300 flex items-center gap-2 text-xs uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                        <Target className="w-3 h-3 text-emerald-500" /> 
                        <ScientificCitation refId="Shimming" position="right">
                            <span className="border-b border-dashed border-slate-700 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-help">B0 Shimming</span>
                        </ScientificCitation>
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${isShimGood ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                        Δ {shimError} Hz
                    </span>
                </div>
                <div className="space-y-4 pt-2">
                    {['x', 'y', 'z'].map((axis) => (
                        <TechSlider 
                            key={axis}
                            label={`Shim ${axis.toUpperCase()}`}
                            value={shimming[axis as keyof typeof shimming]}
                            min={-50}
                            max={50}
                            step={1}
                            unit="Hz"
                            color="emerald"
                            onChange={(val) => setShimming({ [axis]: val })}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Middle: Visual Feedback (The Brain) */}
        <div className="lg:col-span-5 flex flex-col">
            {/* MONITOR FRAME */}
            <div className="bg-black rounded-t-xl overflow-hidden border-x-[6px] border-t-[6px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative aspect-square flex items-center justify-center group ring-1 ring-slate-700/50">
                
                {/* CRT Scanlines Effect */}
                <div className="absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50"></div>
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
                     <div className="text-[10px] text-green-500/70 font-mono tracking-widest uppercase">Live_Feed :: {labSetup.magnetType}_cam_01</div>
                     <div className="text-[10px] text-green-500/50 font-mono uppercase">Seq :: {scanParams.sequence}</div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-700/50 z-30"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-700/50 z-30"></div>

                {/* Base Brain Image */}
                <div className="relative w-full h-full overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2831&auto=format&fit=crop" 
                        alt="MRI Scan Preview"
                        className="w-full h-full object-cover transition-all duration-500 opacity-70 group-hover:opacity-90"
                        style={{
                            filter: `
                                blur(${totalBlur}px) 
                                brightness(${Math.min(1.2, predictedSNR / 60)}) 
                                contrast(${scanParams.sequence === 'GRE' ? 1.4 : 1.1})
                                grayscale(100%)
                            `
                        }}
                    />
                    
                    {/* Direction 1: Shimming Grid Visualization */}
                    <div 
                        className="absolute inset-0 border-slate-500/30 pointer-events-none transition-all duration-500 ease-out"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                                linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                            transform: shimTransform, // Apply dynamic 3D transform based on shimming values
                            opacity: Math.max(0.3, Math.min(0.8, shimError / 30)) // Grid becomes more visible when error is high
                        }}
                    />
                    {!isShimGood && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-900/80 text-red-200 px-4 py-2 rounded backdrop-blur-sm border border-red-500/50 animate-pulse text-xs font-mono font-bold uppercase tracking-widest">
                                Field Inhomogeneity Detected
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlays for defects */}
                {hasRFArtifacts && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_black_90%)] opacity-90 pointer-events-none z-10"></div>
                )}
                
                {/* UI Overlay */}
                <div className="absolute bottom-4 right-4 text-right z-30 space-y-1">
                    <div className={`text-[10px] font-mono px-2 py-0.5 bg-black/60 rounded backdrop-blur border ${currentASF < 1.2 ? 'text-red-500 border-red-900 animate-pulse' : 'text-green-500 border-green-900/50'}`}>
                        SAR_LIMIT: {currentASF < 1.2 ? 'CRITICAL' : 'NORMAL'}
                    </div>
                </div>
            </div>
            
            {/* Monitor Control Bar */}
            <div className="bg-slate-800 rounded-b-xl p-2 flex justify-center gap-4 border-x-[6px] border-b-[6px] border-slate-800 mb-6 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                <div className="flex gap-1">
                    <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                    <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                    <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                </div>
            </div>

             <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-colors">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                     <AlertTriangle className="w-3 h-3 text-amber-500" /> Pre-Scan Checklist
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(checklist).map(([key, checked]) => (
                        <label key={key} className={`flex items-center gap-3 text-sm cursor-pointer p-3 rounded border transition-all group ${checked ? 'bg-blue-900/10 border-blue-800/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'border-slate-700 bg-slate-900 group-hover:border-slate-500'}`}>
                                {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" checked={checked} onChange={() => toggleChecklist(key as any)} className="hidden" />
                            <span className={`capitalize font-mono text-xs ${checked ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {key === 'metallicImplants' ? 'Metallic Implants Check' : key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </label>
                    ))}
                </div>
             </div>

             <button
                onClick={handleRunScan}
                disabled={!allChecksPassed}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-wide ${isTutHighlight(11) ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 relative z-10' : ''} ${
                allChecksPassed
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-500/30 hover:scale-[1.01]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
            >
                {isGradientOverloaded ? (
                    <span className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> HARDWARE OVERLOAD</span>
                ) : (
                    <><Play className="w-5 h-5 fill-current" /> Initialize Scan</>
                )}
            </button>
        </div>

        {/* Right: Graphs */}
        <div className="lg:col-span-3 bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 flex flex-col backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-colors">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-800 pb-2">Safety Analysis</h3>
             <div className="flex-1 min-h-[200px] relative">
                {/* Grid lines background to make it look more technical */}
                <div className="absolute inset-0 border border-slate-800/50 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] rounded-lg overflow-hidden"></div>
                
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAsf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="n" hide />
                    <YAxis domain={[1, 4.5]} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <ReferenceLine x={modelCountN} stroke="#60a5fa" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="asf" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAsf)" isAnimationActive={false} />
                </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 p-3 bg-slate-950/50 rounded border border-slate-800">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                    <span>CURRENT_N</span>
                    <span className="text-blue-400 font-bold">{modelCountN}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                    Safety Factor curve. Keep rASF &gt; 1.2 for safe operation.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyConsole;