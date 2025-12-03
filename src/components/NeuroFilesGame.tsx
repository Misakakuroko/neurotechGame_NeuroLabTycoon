import React from 'react';
import { useOpticalGameStore, Chapter } from '../store/opticalGameStore';
import Chapter1 from './neuro-files/Chapter1';
import Chapter2 from './neuro-files/Chapter2';
import Chapter3 from './neuro-files/Chapter3';
import Chapter4 from './neuro-files/Chapter4';
import { Brain, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

const NeuroFilesGame: React.FC = () => {
  const { currentChapter, knowledgePoints, suspicionLevel, evidenceCollected, setChapter } = useOpticalGameStore();

  // Dev/Debug helper to jump chapters
  const devJump = (c: Chapter) => setChapter(c);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono relative overflow-hidden flex flex-col">
      {/* HUD Header */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-6 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
           <div className="bg-purple-600 p-1.5 rounded shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Brain className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold tracking-tight text-slate-100">
              NEURO-FILES <span className="text-purple-400 text-xs ml-2">CASE: OPTICAL_CONSPIRACY</span>
           </span>
        </div>

        {/* Chapter Indicator */}
        <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-600">
            <span className={currentChapter === 'chapter1' ? 'text-cyan-400 font-bold' : ''}>01_Infiltration</span>
            <ChevronRight className="w-3 h-3" />
            <span className={currentChapter === 'chapter2' ? 'text-cyan-400 font-bold' : ''}>02_Marionette</span>
            <ChevronRight className="w-3 h-3" />
            <span className={currentChapter === 'chapter3' ? 'text-emerald-400 font-bold' : ''}>03_Cure</span>
            <ChevronRight className="w-3 h-3" />
            <span className={currentChapter === 'chapter4' ? 'text-purple-400 font-bold' : ''}>04_Verdict</span>
        </div>

        <div className="flex items-center gap-6 text-xs">
            <div className="flex flex-col items-end">
                <span className="text-slate-500 uppercase tracking-widest">Knowledge</span>
                <span className="text-cyan-400 font-bold text-lg">{knowledgePoints} PTS</span>
            </div>
            
            <div className="flex flex-col items-end">
                 <span className="text-slate-500 uppercase tracking-widest">Suspicion</span>
                 <div className="flex items-center gap-2">
                     <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                            className={`h-full ${suspicionLevel > 75 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} 
                            style={{ width: `${suspicionLevel}%` }}
                         ></div>
                     </div>
                     <span className={`${suspicionLevel > 75 ? 'text-red-500' : 'text-slate-300'} font-bold`}>{suspicionLevel}%</span>
                 </div>
            </div>

             <div className="flex flex-col items-end">
                <span className="text-slate-500 uppercase tracking-widest">Evidence</span>
                <div className="flex items-center gap-1 text-purple-400">
                    <FileText className="w-4 h-4" />
                    <span className="font-bold">{evidenceCollected.length}</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 overflow-y-auto">
         {currentChapter === 'chapter1' && <Chapter1 />}
         {currentChapter === 'chapter2' && <Chapter2 />}
         {currentChapter === 'chapter3' && <Chapter3 />}
         {currentChapter === 'chapter4' && <Chapter4 />}
         
         {currentChapter === 'intro' && (
             <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-1000">
                 <h1 className="text-4xl font-bold text-white tracking-tighter">NEURO-FILES</h1>
                 <p className="text-slate-400 max-w-lg text-center">
                     Welcome, Professor. Intelligence reports suggest "NeuroCorp" is misusing advanced optical technologies.
                     Your mission is to infiltrate their labs, gather evidence, and expose the truth.
                 </p>
                 <button 
                    onClick={() => setChapter('chapter1')}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all hover:scale-105"
                 >
                     START INVESTIGATION
                 </button>
             </div>
         )}
      </main>

      {/* CRT Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};

export default NeuroFilesGame;
