import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Brain, Activity, Play, Info, ChevronRight, AlertTriangle } from 'lucide-react';

const StartScreen: React.FC = () => {
  const { setGameStage } = useGameStore();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-4xl w-full p-8">
        {!showInstructions ? (
          // Main Menu
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.2)] relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
                  <Brain className="w-24 h-24 text-blue-500 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
              <div>
                <h1 className="text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                  NeuroLab <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Tycoon</span>
                </h1>
                <p className="text-xl text-slate-400 font-mono tracking-widest uppercase opacity-80">
                  The Ultra-High Field Challenge
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setGameStage('procurement')}
                className="group relative px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
              >
                <span className="flex items-center gap-3 relative z-10">
                  <Play className="w-6 h-6 fill-current" />
                  Start Simulation
                </span>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity"></div>
              </button>

              <button
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-8 py-3 rounded-lg hover:bg-slate-800/50 font-mono text-sm tracking-wide"
              >
                <Info className="w-4 h-4" />
                MISSION_BRIEFING
              </button>
            </div>

            <p className="text-[10px] text-slate-600 font-mono">
              v1.0.0 • Based on Iseult 11.7T Project Data [cite: 460, 308]
            </p>
          </div>
        ) : (
          // Instructions Panel
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 shadow-2xl animate-in slide-in-from-right-10 duration-300 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Mission Briefing</h2>
                <p className="text-blue-400 font-mono text-xs tracking-widest">OBJECTIVE: PEDIATRIC 7T/11.7T ACQUISITION</p>
              </div>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg px-3 py-1"
              >
                Close
              </button>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="space-y-3 group">
                <div className="bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform">1</div>
                <h3 className="text-lg font-bold text-slate-200">Hardware Procurement</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Manage a <span className="text-green-400 font-mono">$10M</span> budget. Select the Magnet, Cooling System, and RF Coils. 
                  <br/><br/>
                  <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wide">Warning:</span> <span className="text-xs text-slate-500">11.7T Magnets require specific cooling infrastructure.</span>
                </p>
              </div>

              <div className="space-y-3 group">
                <div className="bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-purple-400 font-bold border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform">2</div>
                <h3 className="text-lg font-bold text-slate-200">Safety Console</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Calibrate the <span className="text-white">VOP Algorithm</span>. Adjust virtual models (N) to balance safety vs. quality.
                  <br/><br/>
                  <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono border border-slate-700">rASF = 1 + 5.37 * N^(-0.75)</span>
                </p>
              </div>

              <div className="space-y-3 group">
                <div className="bg-emerald-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">3</div>
                <h3 className="text-lg font-bold text-slate-200">Experiment Review</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Run the sequence. Success depends on hardware compatibility and safety margins.
                  <br/><br/>
                  Failures may result from <span className="text-red-400">RF artifacts</span>, <span className="text-red-400">low SNR</span>, or <span className="text-red-400">safety violations</span>.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex gap-4 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <strong className="text-slate-200 block mb-1 text-xs uppercase tracking-wide">Scientific Accuracy Note</strong>
                This simulation enforces real-world constraints from the Iseult 11.7T Project. 
                Physics interactions (e.g., wavelength effects at 500 MHz) must be mitigated with appropriate hardware choices (pTx).
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setShowInstructions(false);
                  setGameStage('procurement');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Initialize System <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartScreen;