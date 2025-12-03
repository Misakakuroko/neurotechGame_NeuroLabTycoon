import React from 'react';
import { useGameStore, COSTS, MagnetType, CoolingType, CoilType, GradientType, UNLOCK_THRESHOLDS, SubjectType } from '../store/gameStore';
import { ChevronRight, Zap, Thermometer, Activity, Cpu, Lock, GraduationCap, Coins, Gauge, ShoppingCart } from 'lucide-react';
import ScientificCitation from './ScientificCitation';

const MagnetShop: React.FC = () => {
  const { budget, prestige, day, labSetup, unlockedMagnets, purchaseItem, setGameStage, subjectType, setSubjectType, tutorialActive, tutorialStep, nextTutorialStep } = useGameStore();

  const handlePurchase = (cost: number, item: any) => {
    if (budget >= cost) {
      purchaseItem(cost, item);
    }
  };

  const canProceed = labSetup.magnetType && labSetup.coolingSystem && labSetup.coilType;

  // Helper to check if a section should be highlighted in tutorial
  const isTutHighlight = (step: number) => tutorialActive && tutorialStep === step;

  // Subject difficulty config
  const SUBJECTS: { type: SubjectType; reqPrestige: number; rewardMult: number }[] = [
    { type: 'Phantom', reqPrestige: 0, rewardMult: 0.5 },
    { type: 'Adult', reqPrestige: 20, rewardMult: 1.0 },
    { type: 'Pediatric', reqPrestige: 80, rewardMult: 2.0 },
    { type: 'Neonate', reqPrestige: 300, rewardMult: 4.0 }, // Ultra hard
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-200 animate-in fade-in relative">
      {/* Header Stats */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lab Management <span className="text-sm font-mono font-normal text-slate-500 ml-2">DAY_{day.toString().padStart(3, '0')}</span></h1>
          <p className="text-slate-400 text-sm mt-1">Manage budget, procure hardware, and select research targets.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow">
            <GraduationCap className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{prestige}</span>
            <span className="text-xs uppercase tracking-wider opacity-70">Prestige</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-shadow">
            <Coins className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">${budget.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Subject Selection (Mission Board) */}
        <div className={`lg:col-span-3 space-y-4 transition-all duration-300 ${isTutHighlight(1) ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 rounded-xl z-10' : ''}`}>
           <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl min-h-[500px] hover:border-slate-700/80 transition-colors">
                <h2 className="font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Research Target
                </h2>
                <div className="space-y-3">
                    {SUBJECTS.map((sub) => {
                    const locked = prestige < sub.reqPrestige;
                    const active = subjectType === sub.type;
                    
                    const content = (
                        <div className="flex justify-between items-center z-10 relative">
                            <span className={`font-bold ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{sub.type}</span>
                            {locked ? <Lock className="w-3 h-3 text-slate-600" /> : <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">x{sub.rewardMult} REWARD</span>}
                        </div>
                    );

                    return (
                        <button
                        key={sub.type}
                        onClick={() => {
                            if (!locked) {
                                setSubjectType(sub.type);
                                if (tutorialActive && tutorialStep === 1) nextTutorialStep();
                            }
                        }}
                        disabled={locked}
                        className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                            active
                            ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                            : locked 
                                ? 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed'
                                : 'border-slate-800 hover:border-blue-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg'
                        }`}
                        >
                             {sub.type === 'Pediatric' || sub.type === 'Neonate' ? (
                                <ScientificCitation refId="Pediatric" position="right">
                                    {content}
                                </ScientificCitation>
                            ) : content}
                            
                            {locked && <div className="text-[10px] text-red-400/80 mt-2 font-mono uppercase tracking-wide">REQ: {sub.reqPrestige} PRESTIGE</div>}
                        </button>
                    )
                    })}
                </div>
           </div>
        </div>

        {/* Right Column: Hardware Shop - Bento Grid */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
          
          {/* Magnets - Full Width */}
          <div className={`md:col-span-2 bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl transition-all hover:border-slate-700/80 ${isTutHighlight(2) ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 z-10' : ''}`}>
            <h2 className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Main Magnet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['3T', '7T', '11.7T'] as MagnetType[]).map((type) => {
                const isUnlocked = unlockedMagnets.includes(type);
                const cost = COSTS.magnet[type];
                const active = labSetup.magnetType === type;
                
                const content = (
                    <div className="flex justify-between items-start">
                        <span className={`text-2xl font-bold tracking-tighter ${active ? 'text-yellow-400' : 'text-slate-300'}`}>{type}</span>
                        {!isUnlocked && <Lock className="w-4 h-4 text-slate-600" />}
                        {active && <span className="text-[10px] bg-yellow-900/40 text-yellow-200 px-2 py-0.5 rounded border border-yellow-700/50 uppercase tracking-wide shadow-[0_0_10px_rgba(234,179,8,0.2)]">Owned</span>}
                    </div>
                );

                return (
                    <button
                    key={type}
                    onClick={() => handlePurchase(cost, { magnetType: type })}
                    disabled={!isUnlocked || active || budget < cost}
                    className={`p-5 rounded-xl border text-left transition-all relative group flex flex-col justify-between min-h-[120px] ${
                        active
                        ? 'border-yellow-500/50 bg-yellow-900/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                        : !isUnlocked
                            ? 'border-slate-800 bg-slate-950/30 opacity-50'
                            : 'border-slate-800 hover:border-yellow-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg'
                    }`}
                    >
                         {type === '11.7T' ? (
                            <ScientificCitation refId="11.7T" position="bottom">
                                {content}
                            </ScientificCitation>
                        ) : type === '7T' ? (
                             <ScientificCitation refId="7T" position="bottom">
                                {content}
                            </ScientificCitation>
                        ) : content}

                        <div>
                            <div className="text-xs font-mono text-slate-500 mb-1">${cost.toLocaleString()}</div>
                            {!isUnlocked && <div className="text-[10px] text-slate-500 font-mono uppercase">Unlock: {UNLOCK_THRESHOLDS[type]} Prestige</div>}
                        </div>
                    </button>
                );
                })}
            </div>
          </div>

          {/* Cooling */}
          <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl transition-all hover:border-slate-700/80 ${isTutHighlight(3) ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 z-10' : ''}`}>
            <h2 className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
              <Thermometer className="w-4 h-4 text-cyan-500" /> Cooling System
            </h2>
            <div className="space-y-3">
                {(['Standard', 'Superfluid'] as CoolingType[]).map((type) => {
                const active = labSetup.coolingSystem === type;
                
                const content = (
                    <div>
                        <div className={`font-bold text-sm ${active ? 'text-cyan-400' : 'text-slate-300'}`}>{type === 'Superfluid' ? '1.8K Superfluid' : 'Standard 4.2K'}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">${COSTS.cooling[type].toLocaleString()}</div>
                    </div>
                );

                return (
                    <button
                        key={type}
                        onClick={() => handlePurchase(COSTS.cooling[type], { coolingSystem: type })}
                        disabled={active || budget < COSTS.cooling[type]}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        active
                            ? 'border-cyan-500/50 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-0.5'
                        }`}
                    >
                        {type === 'Superfluid' ? (
                             <ScientificCitation refId="Superfluid" position="right">
                                {content}
                            </ScientificCitation>
                        ) : content}

                        {active ? (
                            <span className="text-[10px] bg-cyan-900/40 text-cyan-200 px-2 py-0.5 rounded border border-cyan-700/50 uppercase tracking-wide shadow-[0_0_10px_rgba(6,182,212,0.2)]">Installed</span>
                        ) : (
                            <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        )}
                    </button>
                );
                })}
            </div>
          </div>
          
          {/* Coils */}
          <div className={`bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl transition-all hover:border-slate-700/80 ${isTutHighlight(4) ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 z-10' : ''}`}>
             <h2 className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-emerald-500" /> RF Coils
            </h2>
            <div className="space-y-3">
                {(['Birdcage', 'Avanti2'] as CoilType[]).map((type) => {
                    const active = labSetup.coilType === type;
                    return (
                    <button
                        key={type}
                        onClick={() => handlePurchase(COSTS.coil[type], { coilType: type })}
                        disabled={active || budget < COSTS.coil[type]}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        active
                            ? 'border-emerald-500/50 bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                            : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-0.5'
                        }`}
                    >
                        <div>
                            <div className={`font-bold text-sm ${active ? 'text-emerald-400' : 'text-slate-300'}`}>{type}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">${COSTS.coil[type].toLocaleString()}</div>
                        </div>
                         {active ? (
                            <span className="text-[10px] bg-emerald-900/40 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50 uppercase tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.2)]">Equipped</span>
                        ) : (
                            <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                        )}
                    </button>
                );
                })}
            </div>
          </div>

           {/* Gradient Systems */}
           <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-colors">
            <h2 className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
              <Gauge className="w-4 h-4 text-orange-500" /> 
              <ScientificCitation refId="Gradient" position="left">
                <span className="border-b border-dashed border-slate-700 hover:border-orange-500 hover:text-orange-400 transition-colors cursor-help">Gradients (dB/dt)</span>
              </ScientificCitation>
            </h2>
            <div className="space-y-3">
                {(['Standard', 'HighPerf', 'Connectome'] as GradientType[]).map((type) => {
                const active = labSetup.gradientType === type;
                return (
                    <button
                        key={type}
                        onClick={() => handlePurchase(COSTS.gradient[type], { gradientType: type })}
                        disabled={active || budget < COSTS.gradient[type]}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        active
                            ? 'border-orange-500/50 bg-orange-900/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                            : 'border-slate-800 hover:border-orange-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-0.5'
                        }`}
                    >
                        <div>
                            <div className={`font-bold text-sm ${active ? 'text-orange-400' : 'text-slate-300'}`}>{type === 'HighPerf' ? 'High-Perf' : type}</div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                                <span>${COSTS.gradient[type].toLocaleString()}</span>
                                <span className="text-slate-600">•</span>
                                <span>{type === 'Standard' ? '80 mT/m' : type === 'HighPerf' ? '200 mT/m' : '300 mT/m'}</span>
                            </div>
                        </div>
                        {active ? (
                            <span className="text-[10px] bg-orange-900/40 text-orange-200 px-2 py-0.5 rounded border border-orange-700/50 uppercase tracking-wide shadow-[0_0_10px_rgba(249,115,22,0.2)]">Active</span>
                        ) : (
                            <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
                        )}
                    </button>
                );
                })}
            </div>
          </div>

           {/* Upgrades */}
           <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-xl hover:border-slate-700/80 transition-colors">
             <h2 className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-xs mb-6 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-purple-500" /> System Upgrades
            </h2>
             <button
              onClick={() => handlePurchase(COSTS.pTx, { pTxEnabled: true })}
              disabled={labSetup.pTxEnabled || budget < COSTS.pTx}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                labSetup.pTxEnabled
                  ? 'border-purple-500/50 bg-purple-900/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                  : 'border-slate-800 hover:border-purple-500/50 bg-slate-950/50 hover:bg-slate-800 hover:-translate-y-0.5'
              }`}
            >
              <div>
                <ScientificCitation refId="pTx" position="left">
                    <div className={`font-bold text-sm w-fit border-b border-dashed border-slate-700 hover:border-purple-400 ${labSetup.pTxEnabled ? 'text-purple-400' : 'text-slate-300'}`}>pTx Transmit System</div>
                </ScientificCitation>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">${COSTS.pTx.toLocaleString()}</div>
              </div>
              {labSetup.pTxEnabled ? (
                <span className="text-[10px] bg-purple-900/40 text-purple-200 px-2 py-0.5 rounded border border-purple-700/50 uppercase tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.2)]">Installed</span>
              ) : (
                 <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
              )}
            </button>
           </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={() => setGameStage('safety')}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg uppercase tracking-wide text-sm ${
            canProceed 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 hover:shadow-blue-600/30 hover:scale-105' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          } ${isTutHighlight(5) ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 z-10 relative' : ''}`}
        >
          Enter Control Room <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MagnetShop;