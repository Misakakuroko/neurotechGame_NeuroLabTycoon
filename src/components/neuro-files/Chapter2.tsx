import React, { useEffect, useRef, useState } from 'react';
import { useOpticalGameStore } from '../../store/opticalGameStore';
import { MousePointer2, Play, Settings, AlertTriangle, RotateCcw, ArrowLeft, ArrowRight, Pause } from 'lucide-react';

const MAZE_WIDTH = 400;
const MAZE_HEIGHT = 400;

const Chapter2: React.FC = () => {
  const { 
    c2_config, c2_mouse, c2_status, 
    setC2LedSpacing, updateMouse, setC2Status, 
    setChapter, addKnowledgePoints, increaseSuspicion, addEvidence, resetC2
  } = useOpticalGameStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState<string>("Mission: Navigate the mouse to the extraction point.");

  // Simulation Loop
  useEffect(() => {
    if (c2_status !== 'active') return;

    const interval = setInterval(() => {
      if (c2_mouse.isFrozen) return;

      // Move forward based on angle
      const speed = 1.5; // px per tick
      const rad = (c2_mouse.angle - 90) * (Math.PI / 180); // -90 to align 0 with UP
      const dx = Math.cos(rad) * speed;
      const dy = Math.sin(rad) * speed;

      let newX = c2_mouse.x + dx;
      let newY = c2_mouse.y + dy;

      // Boundary checks (Simple Box)
      if (newX < 10 || newX > 90 || newY < 10 || newY > 90) {
         // Hit wall - for now just stop or bounce? Let's just clamp
         newX = Math.max(5, Math.min(95, newX));
         newY = Math.max(5, Math.min(95, newY));
      }

      // Win Condition (Top Zone: y < 15)
      if (newY < 15) {
          setC2Status('complete');
          setMessage("TARGET ACQUIRED. Wireless Control Successful.");
          addKnowledgePoints(150);
          addEvidence("Wireless Photometry Specs");
          setTimeout(() => setChapter('chapter3'), 2000);
      }

      updateMouse({ x: newX, y: newY });
    }, 50);

    return () => clearInterval(interval);
  }, [c2_status, c2_mouse, updateMouse, setC2Status, addKnowledgePoints, addEvidence, setChapter]);

  // Canvas Render
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);

      // Draw Maze Floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);
      
      // Draw Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for(let i=0; i<MAZE_WIDTH; i+=40) {
          ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, MAZE_HEIGHT); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(MAZE_WIDTH, i); ctx.stroke();
      }

      // Draw Goal Zone
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT * 0.15);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT * 0.15);
      ctx.fillStyle = '#10b981';
      ctx.font = '12px monospace';
      ctx.fillText("EXTRACTION ZONE", 10, 20);

      // Draw Mouse
      // Convert % to px
      const mx = (c2_mouse.x / 100) * MAZE_WIDTH;
      const my = (c2_mouse.y / 100) * MAZE_HEIGHT;

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate((c2_mouse.angle) * Math.PI / 180);
      
      // Mouse Body
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 15, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Head/Implant
      ctx.fillStyle = c2_mouse.isFrozen ? '#22c55e' : '#ef4444'; // Green if frozen (UCNP active), Red if moving
      ctx.beginPath();
      ctx.arc(0, -8, 4, 0, 2 * Math.PI);
      ctx.fill();

      // LED Glow
      if (c2_status === 'active') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = c2_mouse.isFrozen ? '#22c55e' : '#ef4444';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

  }, [c2_mouse, c2_status]);

  const handleAction = (action: 'left' | 'right' | 'stop') => {
      if (c2_status !== 'active') return;

      // Check Crosstalk Logic
      if ((action === 'left' || action === 'right') && c2_config.ledSpacing < 1.5) {
          setC2Status('failed');
          setMessage("CRITICAL FAILURE: Signal Crosstalk Detected! LEDs are too close (<1.5mm). Red light spread to adjacent cortex.");
          increaseSuspicion(30);
          return;
      }

      if (action === 'stop') {
          updateMouse({ isFrozen: true });
      } else {
          const turnAmount = 30;
          const newAngle = c2_mouse.angle + (action === 'left' ? -turnAmount : turnAmount);
          updateMouse({ 
              angle: newAngle,
              isFrozen: false 
          });
      }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-200 font-mono h-full flex flex-col">
      <div className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">CHAPTER 2: THE MARIONETTE</h1>
        <p className="text-slate-400 text-sm">OBJECTIVE: Calibrate the wireless implant and navigate the subject.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT PANEL: Configuration & Controls */}
        <div className="space-y-6">
            
            {/* Setup Phase */}
            <div className={`p-6 rounded-xl border ${c2_status === 'setup' ? 'bg-slate-800 border-blue-500' : 'bg-slate-900/50 border-slate-800 opacity-50 pointer-events-none'}`}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> IMPLANT CONFIG
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-2">LED SPACING (M2-Cortex)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="0.1" 
                                max="3.0" 
                                step="0.1"
                                value={c2_config.ledSpacing}
                                onChange={(e) => setC2LedSpacing(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className={`font-bold text-lg w-16 ${c2_config.ledSpacing < 1.5 ? 'text-red-500' : 'text-green-500'}`}>
                                {c2_config.ledSpacing}mm
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                            *Warning: Red light (630nm) spreads ~0.75mm in tissue.
                        </p>
                    </div>

                    {c2_status === 'setup' && (
                        <button 
                            onClick={() => setC2Status('active')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4" /> INITIALIZE LINK
                        </button>
                    )}
                </div>
            </div>

            {/* Control Phase */}
            <div className={`p-6 rounded-xl border ${c2_status === 'active' ? 'bg-slate-800 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MousePointer2 className="w-5 h-5" /> REMOTE CONTROL
                </h2>
                
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => handleAction('left')}
                        className="aspect-square bg-slate-700 hover:bg-red-600 hover:text-white rounded-lg flex flex-col items-center justify-center border-2 border-slate-600 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">LEFT (M2)</span>
                    </button>

                    <button 
                        onClick={() => handleAction('stop')}
                        className="aspect-square bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg flex flex-col items-center justify-center border-2 border-slate-600 transition-all"
                    >
                        <Pause className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">FREEZE (SC)</span>
                    </button>

                    <button 
                        onClick={() => handleAction('right')}
                        className="aspect-square bg-slate-700 hover:bg-red-600 hover:text-white rounded-lg flex flex-col items-center justify-center border-2 border-slate-600 transition-all"
                    >
                        <ArrowRight className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">RIGHT (M2)</span>
                    </button>
                </div>
            </div>

            {/* Status Message */}
            <div className={`p-4 rounded border text-sm ${
                c2_status === 'failed' ? 'bg-red-900/20 border-red-500 text-red-400' :
                c2_status === 'complete' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' :
                'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
                {c2_status === 'failed' && <AlertTriangle className="w-5 h-5 mb-2 inline-block mr-2" />}
                {message}
                {c2_status === 'failed' && (
                    <button 
                        onClick={resetC2}
                        className="block mt-3 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" /> RETRY CALIBRATION
                    </button>
                )}
            </div>
        </div>

        {/* RIGHT PANEL: Simulation View */}
        <div className="lg:col-span-2 bg-black rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
            <canvas 
                ref={canvasRef} 
                width={MAZE_WIDTH} 
                height={MAZE_HEIGHT} 
                className="max-w-full h-auto"
            />
            
            {/* Overlay Scanlines */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-500 animate-pulse">
                LIVE FEED :: CAM_04 [WIRELESS]
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter2;
