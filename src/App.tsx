import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MagnetShop from './components/MagnetShop';
import SafetyConsole from './components/SafetyConsole';
import ExperimentReview from './components/ExperimentReview';
import StartScreen from './components/StartScreen';
import TutorialOverlay from './components/TutorialOverlay';
import NeuroFilesGame from './components/NeuroFilesGame';
import { Activity } from 'lucide-react';

function App() {
  const { gameStage, setGameStage, selectedTheme } = useGameStore();

  if (gameStage === 'start') {
    return <StartScreen />;
  }

  // Route to Neuro-Files Game if "Invasive Optical Stimulation" is selected
  if (selectedTheme === 'optical_stim') {
    return <NeuroFilesGame />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      
      {/* Tutorial Overlay - Renders on top of everything */}
      <TutorialOverlay />

      {/* Global Header - HUD Style */}
      <nav className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100">
              NeuroLab <span className="text-blue-500">Tycoon</span>
            </span>
            <div className="h-4 w-px bg-slate-800 mx-2"></div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">v1.0.0_RC1</div>
          </div>
          
          {/* Progress Steps - HUD Style */}
          <div className="hidden md:flex items-center bg-slate-900/50 rounded-full px-4 py-1.5 border border-slate-800 gap-2">
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${gameStage === 'procurement' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] font-bold' : 'text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full ${gameStage === 'procurement' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
                01_Hardware
            </div>
            <div className="w-8 h-px bg-slate-800"></div>
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${gameStage === 'safety' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] font-bold' : 'text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full ${gameStage === 'safety' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
                02_Safety
            </div>
            <div className="w-8 h-px bg-slate-800"></div>
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${gameStage === 'review' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] font-bold' : 'text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full ${gameStage === 'review' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
                03_Results
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 relative z-10">
        {gameStage === 'procurement' && <MagnetShop />}
        {gameStage === 'safety' && <SafetyConsole />}
        {gameStage === 'review' && <ExperimentReview />}
      </main>

      <footer className="text-center py-8 text-slate-600 text-[10px] font-mono uppercase tracking-widest opacity-50">
        <p>NeuroLab Tycoon © 2024 • Iseult Project Simulation • 11.7T Ultra-High Field</p>
      </footer>
    </div>
  );
}

export default App;
