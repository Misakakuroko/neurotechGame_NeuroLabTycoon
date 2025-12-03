import React, { useState, useEffect, useRef } from 'react';
import { useOpticalGameStore } from '../../store/opticalGameStore';
import { Activity, Brain, ChevronRight, AlertOctagon, Microscope, Zap, BookOpen, Thermometer, Play, Pause, RotateCcw } from 'lucide-react';

// --- 辅助组件 ---

// 科研文献引用组件
const SciRef: React.FC<{ code: string, title: string, text: string }> = ({ code, title, text }) => (
  <div className="group relative inline-block ml-2 cursor-help z-50" onClick={(e) => e.stopPropagation()}>
    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500/80 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-900/10 hover:bg-emerald-500/20 transition-colors">
      <BookOpen className="w-3 h-3" /> [{code}]
    </span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
      <div className="text-xs font-bold text-emerald-400 mb-1 border-b border-slate-800 pb-1">{title}</div>
      <div className="text-[10px] text-slate-300 leading-relaxed">{text}</div>
      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 transform rotate-45"></div>
    </div>
  </div>
);

// --- 核心组件: Chapter3 ---

const Chapter3: React.FC = () => {
  // 全局状态
  const { 
    c3_treatment, 
    identifyPathway, 
    selectTreatment, 
    setTreatmentConfig, 
    completeChapter3, 
    addKnowledgePoints, 
    setChapter,
    c3_result
  } = useOpticalGameStore();

  // 流程控制
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1:诊断, 2:方案选择, 3:实时调控
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);

  // --- 仿真状态 (Step 3) ---
  const [simActive, setSimActive] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [brainTemp, setBrainTemp] = useState(37.0);
  const [stnActivity, setStnActivity] = useState(80); // 0-100, 目标 < 20
  const [tremor, setTremor] = useState(100); // 0-100
  const [tissueIntegrity, setTissueIntegrity] = useState(100);
  const [stabilityScore, setStabilityScore] = useState(0); // 累积成功分数
  const [messages, setMessages] = useState<string[]>([]);
  
  // 实时控制参数
  const [wavelength, setWavelength] = useState(470); // nm
  const [power, setPower] = useState(0); // mW
  const [frequency, setFrequency] = useState(20); // Hz

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 逻辑处理 ---

  const handleDiagnosis = () => {
    if (selectedCircuit === 'pd') {
        identifyPathway();
        addKnowledgePoints(50);
        setStep(2);
    } else {
        alert("诊断错误。请参考文献：PD 的特征是 STN 通路过度活跃。");
    }
  };

  const handleTreatmentSelect = (method: 'fiber' | 'ucnp') => {
    selectTreatment(method);
    // 重置默认参数
    if (method === 'ucnp') {
        setWavelength(980); // NIR default
    } else {
        setWavelength(473); // Blue default
    }
    setPower(0);
    setFrequency(20);
    setStep(3);
    addKnowledgePoints(30);
  };

  // --- 仿真循环 (Step 3 Core) ---
  useEffect(() => {
    if (!simActive || step !== 3) return;

    const interval = setInterval(() => {
      setSimTime(t => t + 0.1);

      // 1. 计算转换效率 (Physics)
      let efficiency = 0;
      if (c3_treatment.selectedMethod === 'fiber') {
        // 光纤直接照射：波长 450-500nm 有效 (Blue for ChR2)
        // 但由于是物理插入，初始 damage 较高 (模拟中不体现，但在结果中扣分)
        efficiency = (wavelength >= 450 && wavelength <= 500) ? 1.0 : 0.1;
      } else {
        // UCNP: 需要 NIR (950-1000nm) 才能上转换为蓝光
        // 高斯分布模拟共振峰值 980nm
        const delta = Math.abs(wavelength - 980);
        if (delta < 50) {
            efficiency = Math.max(0, 1 - (delta / 50)); // 980nm 是 1.0
        }
      }

      // 2. 计算有效光功率 (Effective Power)
      // 频率影响平均功率: Power * DutyCycle (Simplified)
      const dutyCycle = Math.min(1, frequency / 100); 
      const effectivePower = power * efficiency * dutyCycle;

      // 3. STN 活性计算 (抑制模型)
      // 基础活性 80 (病态), 目标 < 30. 
      // 需要 EffectivePower > 22.5 才能有效抑制 (系数从 1.5 提升到 2.0)
      const suppression = effectivePower * 2.0;
      // 添加随机噪音
      const noise = (Math.random() - 0.5) * 10;
      const currentStn = Math.max(10, Math.min(100, 80 - suppression + noise));
      
      setStnActivity(currentStn);
      setTremor(currentStn); // 震颤直接关联 STN 活性

      // 4. 热效应计算 (Thermal Model)
      // 升温 = 输入总功率 (不只是有效功率) * 时间因子 (从 0.05 降至 0.02)
      // 降温 = 自然冷却 (从 0.8 调整为 0.5 以匹配更平滑的热模型)
      const heating = (power * dutyCycle * 0.02); 
      const cooling = 0.5; 
      let newTemp = brainTemp + heating - cooling;
      if (newTemp < 37) newTemp = 37;
      setBrainTemp(newTemp);

      // 5. 组织损伤 (Tissue Integrity)
      if (newTemp > 41.0) {
        setTissueIntegrity(prev => Math.max(0, prev - 1)); // 过热损伤
      }

      // 6. 成功进度 (Stability)
      // 保持 STN < 40 (放宽判定) 且 Temp < 40
      if (currentStn < 40 && newTemp < 40) {
        setStabilityScore(prev => Math.min(100, prev + 1.0)); // 加快进度
      }

      // 结束判断
      if (stabilityScore >= 100) {
        finishSimulation(true);
      } else if (tissueIntegrity <= 0) {
        finishSimulation(false);
      }

    }, 100);

    return () => clearInterval(interval);
  }, [simActive, step, wavelength, power, frequency, brainTemp, c3_treatment.selectedMethod]);

  const finishSimulation = (success: boolean) => {
    setSimActive(false);
    const result = {
        success,
        tissueIntegrity,
        treatmentStability: stabilityScore
    };
    completeChapter3(result);
    
    if (success) {
        alert("治疗成功！震颤已消除且组织完好。");
            setChapter('chapter4'); 
         } else {
        alert("治疗失败：组织热损伤严重，实验被迫终止。");
        // 也可以让其进入 Chapter 4 但带着惩罚，这里简单处理
        setChapter('chapter4');
    }
  };

  // --- Canvas 绘图 (示波器) ---
  useEffect(() => {
    if (step !== 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 简单的波形滚动动画
    let animationId: number;
    let offset = 0;

    const render = () => {
        // 黑色背景
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 网格
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=20) { ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); }
        for(let i=0; i<canvas.height; i+=20) { ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();

        // 绘制 STN 波形 (LFP)
        ctx.beginPath();
        ctx.strokeStyle = stnActivity > 50 ? '#ef4444' : '#10b981'; // 红(高) -> 绿(低)
        ctx.lineWidth = 2;

        // 波幅随 stnActivity 变化
        const amplitude = stnActivity / 2; 
        const freq = stnActivity / 10; // 频率也随活性变化

        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height/2 + Math.sin((x + offset) * 0.1 * freq) * amplitude * Math.sin((x + offset) * 0.01);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 绘制“目标区间”遮罩
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(0, canvas.height/2 - 15, canvas.width, 30); // +/- 15 像素是安全区

        offset += 2;
        animationId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationId);
  }, [step, stnActivity]);


  // --- 渲染 UI ---
  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-200 font-mono h-full flex flex-col overflow-y-auto">
      {/* 顶部导航 */}
      <div className="mb-6 border-b border-slate-700 pb-4 flex justify-between items-end shrink-0">
        <div>
            <h1 className="text-3xl font-bold text-emerald-400 mb-1">CHAPTER 3: THE RESONANCE</h1>
            <p className="text-slate-400 text-xs">OBJECTIVE: Achieve stable neuromodulation via selected optical interface.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={step >= 1 ? 'text-emerald-400' : ''}>PATHOLOGY</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step >= 2 ? 'text-emerald-400' : ''}>STRATEGY</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step >= 3 ? 'text-emerald-400' : ''}>MODULATION</span>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="flex-grow bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
        
        {/* STEP 1: DIAGNOSIS (简化版) */}
        {step === 1 && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl font-bold">Subject 89: Circuit Analysis</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4 text-sm text-slate-300">
                        <p>Clinical presentation: Resting tremor, bradykinesia (slowness of movement).</p>
                        <div className="bg-black/40 p-4 rounded border border-slate-800">
                            <h3 className="text-xs text-slate-500 uppercase mb-2">LFP Readings</h3>
                            <div className="flex justify-between border-b border-slate-800 py-1"><span>Striatum (D2):</span> <span className="text-red-400">Hyperactive</span></div>
                            <div className="flex justify-between border-b border-slate-800 py-1"><span>GPe:</span> <span className="text-blue-400">Inhibited (Silent)</span></div>
                            <div className="flex justify-between py-1"><span>STN:</span> <span className="text-red-400 font-bold animate-pulse">BURST FIRING</span></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-slate-500 mb-2">Identify the pathological loop:</p>
                        {[
                            { id: 'healthy', label: 'Normal Pathway', desc: 'Balanced Direct/Indirect' },
                            { id: 'pd', label: 'Parkinsonian State', desc: 'STN Hyperactivity due to GPe inhibition' },
                            { id: 'hd', label: 'Huntington State', desc: 'Striatal atrophy' },
                        ].map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCircuit(c.id)}
                                className={`w-full text-left p-3 rounded border transition-all
                                    ${selectedCircuit === c.id 
                                        ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' 
                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                            >
                                <div className="font-bold text-sm">{c.label}</div>
                                <div className="text-xs opacity-60">{c.desc}</div>
                            </button>
                        ))}
                        
                        <button 
                            onClick={handleDiagnosis}
                            disabled={!selectedCircuit}
                            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded"
                        >
                            CONFIRM DIAGNOSIS
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: TREATMENT SELECTION */}
        {step === 2 && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-500" /> Protocol Selection
                </h2>
                <p className="text-slate-400 text-sm mb-8">Target: Subthalamic Nucleus (STN). Goal: Normalize firing rate.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fiber Optic */}
                    <div 
                        onClick={() => handleTreatmentSelect('fiber')}
                        className="group cursor-pointer relative p-6 rounded-xl border-2 border-slate-700 bg-slate-800 hover:border-red-500 hover:bg-slate-800/80 transition-all"
                    >
                        <div className="absolute top-4 right-4 text-slate-600 group-hover:text-red-500"><AlertOctagon /></div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400">Legacy Fiber Optic</h3>
                        <div className="text-xs text-slate-400 mb-4 flex gap-2">
                            <span className="bg-slate-700 px-2 py-1 rounded">473nm (Blue)</span>
                            <span className="bg-slate-700 px-2 py-1 rounded">High Power</span>
                            </div>
                        <ul className="text-sm text-slate-300 space-y-2 mb-4">
                            <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> High efficiency (Direct delivery)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500">⚠</span> Invasive (Tissue damage guaranteed)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500">⚠</span> Risk of inflammation (Glial scar)</li>
                        </ul>
                        <div className="text-xs font-mono text-red-400 bg-red-900/10 p-2 rounded mt-auto">
                            WARNING: CEO prefers this for "reliability", but it harms the patient.
                        </div>
                    </div>

                    {/* UCNP */}
                    <div 
                        onClick={() => handleTreatmentSelect('ucnp')}
                        className="group cursor-pointer relative p-6 rounded-xl border-2 border-slate-700 bg-slate-800 hover:border-emerald-500 hover:bg-slate-800/80 transition-all"
                    >
                        <div className="absolute top-4 right-4 text-slate-600 group-hover:text-emerald-500"><Microscope /></div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400">UCNP Transcranial</h3>
                        <div className="text-xs text-slate-400 mb-4 flex gap-2">
                            <span className="bg-slate-700 px-2 py-1 rounded">980nm (NIR)</span>
                            <span className="bg-slate-700 px-2 py-1 rounded">Nano-Transducers</span>
                            </div>
                        <ul className="text-sm text-slate-300 space-y-2 mb-4">
                            <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Minimally Invasive (No probe)</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-500">✓</span> Deep penetration via NIR Window</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500">⚠</span> Complex tuning required (Resonance)</li>
                        </ul>
                        <div className="text-xs font-mono text-emerald-400 bg-emerald-900/10 p-2 rounded mt-auto">
                            <SciRef code="Chen '18" title="Upconversion" text="UCNPs convert deep-penetrating NIR light to visible blue light locally in the brain, enabling non-invasive optogenetics." />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 3: REAL-TIME MODULATION GAME */}
        {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in zoom-in-95 duration-500">
                        
                {/* LEFT: CONTROLS (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-emerald-400 flex items-center gap-2"><Zap className="w-4 h-4"/> LASER CONTROLLER</h3>
                        <div className={`text-xs px-2 py-0.5 rounded ${simActive ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 text-slate-500'}`}>
                            {simActive ? 'EMISSION ON' : 'STANDBY'}
                                    </div>
                                </div>

                    {/* 1. WAVELENGTH */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">WAVELENGTH</span>
                            <span className="font-mono text-cyan-400">{wavelength} nm</span>
                                    </div>
                                    <input 
                                        type="range" min="400" max="1100" step="10"
                            value={wavelength}
                            onChange={(e) => setWavelength(Number(e.target.value))}
                            disabled={c3_treatment.selectedMethod === 'fiber'} // Fiber is fixed wavelength
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                        <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-mono">
                            <span>400(Blue)</span>
                            <span>980(NIR)</span>
                            <span>1100</span>
                        </div>
                        {c3_treatment.selectedMethod === 'ucnp' && (
                             <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-2">
                                <span className="text-yellow-500">TIP:</span> Tune to UCNP absorption peak (NIR window) for max efficiency.
                                    </div>
                        )}
                                </div>

                    {/* 2. POWER */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">LASER POWER</span>
                            <span className={`font-mono ${power > 80 ? 'text-red-500' : 'text-orange-400'}`}>{power} mW</span>
                                    </div>
                                    <input 
                            type="range" min="0" max="100" step="1"
                            value={power}
                            onChange={(e) => setPower(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>

                     {/* 3. FREQUENCY (Pulse) */}
                     <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">PULSE FREQ</span>
                            <span className="font-mono text-purple-400">{frequency} Hz</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" step="1"
                            value={frequency}
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                         <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-2">
                            Higher freq = Smoother signal but more HEAT.
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setSimActive(!simActive)}
                            className={`py-3 rounded font-bold flex items-center justify-center gap-2 transition-all
                            ${simActive 
                                ? 'bg-red-900/50 text-red-400 border border-red-500' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                        >
                            {simActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {simActive ? 'STOP' : 'START'}
                        </button>
                        <button 
                            onClick={() => {
                                setSimActive(false);
                                setTissueIntegrity(100);
                                setStabilityScore(0);
                                setBrainTemp(37);
                                setStnActivity(80);
                            }}
                            className="bg-slate-800 text-slate-400 hover:bg-slate-700 py-3 rounded flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> RESET
                        </button>
                    </div>
                </div>

                {/* CENTER: MONITORING (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* OSCILLOSCOPE */}
                    <div className="bg-black rounded-lg border border-slate-800 relative h-48 flex items-center justify-center overflow-hidden">
                        <canvas ref={canvasRef} width={400} height={200} className="w-full h-full" />
                        <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-500">LFP MONITOR (STN)</div>
                        {stnActivity < 35 && <div className="absolute top-2 right-2 text-[10px] font-bold text-emerald-500 bg-emerald-900/30 px-2 rounded">SIGNAL STABILIZED</div>}
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* TEMP GAUGE */}
                        <div className="bg-slate-900 p-4 rounded border border-slate-800 flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Thermometer className="w-3 h-3"/> TISSUE TEMP</div>
                            <div className="relative w-full h-4 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${brainTemp > 40 ? 'bg-red-500' : brainTemp > 38 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (brainTemp - 35) * 10)}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-xl font-bold font-mono">{brainTemp.toFixed(1)}°C</div>
                            <div className="text-[10px] text-slate-500">Max Safe: 40°C</div>
                        </div>

                         {/* TISSUE HEALTH */}
                         <div className="bg-slate-900 p-4 rounded border border-slate-800 flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-2">TISSUE INTEGRITY</div>
                            <div className="relative w-20 h-20">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={tissueIntegrity < 50 ? '#ef4444' : '#3b82f6'} strokeWidth="3" strokeDasharray={`${tissueIntegrity}, 100`} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                                    {tissueIntegrity}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: GOAL & STATUS (3 cols) */}
                <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col">
                     <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Treatment Progress</h3>
                     
                     {/* Progress Bar */}
                     <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1">
                            <span>STABILITY GOAL</span>
                            <span>{stabilityScore.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300" style={{ width: `${stabilityScore}%` }}></div>
                        </div>
                    </div>

                     {/* Patient Status Visual */}
                     <div className="flex-grow flex flex-col items-center justify-center border border-slate-800 rounded bg-black/20 p-4">
                        <div className="text-xs text-slate-500 mb-2">PATIENT TREMOR</div>
                        <div className="relative">
                            {/* 简单的 CSS 动画模拟手部震颤 */}
                            <div 
                                className="w-12 h-12 rounded-full border-4 border-slate-600 bg-slate-800"
                                style={{ 
                                    transform: `translate(${Math.sin(Date.now() * 0.1) * (stnActivity/10)}px, ${Math.cos(Date.now() * 0.1) * (stnActivity/10)}px)`
                                }}
                            ></div>
                        </div>
                        <div className={`mt-4 text-sm font-bold ${stnActivity < 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stnActivity < 30 ? "NORMAL" : "SEVERE"}
                        </div>
                    </div>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};

export default Chapter3;
