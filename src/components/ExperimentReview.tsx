import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AlertOctagon, CheckCircle, RefreshCw, ArrowRight, Award, TrendingUp, FileText } from 'lucide-react';

const ExperimentReview: React.FC = () => {
  const { labSetup, experimentParams, scanParams, shimming, completeExperiment, nextRound } = useGameStore();
  const [status, setStatus] = useState<'scanning' | 'analyzing' | 'done'>('scanning');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simulation Result State
  const [success, setSuccess] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [stats, setStats] = useState({ snr: 0, prestige: 0, money: 0 });

  useEffect(() => {
    // Simulate Sequence
    const runSimulation = async () => {
      addLog("Initializing gradients...");
      await delay(800);
      
      // 1. Hardware Checks
      if (labSetup.magnetType === '11.7T' && labSetup.coolingSystem !== 'Superfluid') {
        fail("MAGNET QUENCH DETECTED! Temp > 2.1K. Critical failure.");
        return;
      }
      
      addLog(`B0 Field Strength: ${labSetup.magnetType}... Stable.`);
      await delay(800);

      // 2. RF Checks
      if ((labSetup.magnetType === '11.7T' || labSetup.magnetType === '7T') && !labSetup.pTxEnabled) {
        fail("FATAL: B1+ Inhomogeneity too high. Black holes in ROI. pTx hardware missing.");
        return;
      }

      // 3. Shimming Check
      const shimError = Math.abs(shimming.x) + Math.abs(shimming.y) + Math.abs(shimming.z);
      addLog(`Running Active Shimming... Residual Δ: ${shimError}Hz`);
      if (shimError > 60) {
        fail("Geometric Distortion severe. Shimming failed to correct field.");
        return;
      }
      await delay(800);

      // 4. Gradient Checks (New: dB/dt & PNS)
      const baseGradientDemand = (3.5 - scanParams.resolution) * 80;
      const seqGradientMult = scanParams.sequence === 'EPI' ? 1.5 : 1.0;
      const totalGradientDemand = baseGradientDemand * seqGradientMult;
      const gradientCapacity = labSetup.gradientType === 'Connectome' ? 300 : labSetup.gradientType === 'HighPerf' ? 200 : 80;

      addLog(`Checking Gradient Slew Rates... Demand: ${totalGradientDemand.toFixed(0)} T/m/s`);

      if (totalGradientDemand > gradientCapacity) {
        fail("GRADIENT FAILURE: Requested slew rate exceeds hardware capacity. Upgrade gradients.");
        return;
      }

      // PNS Check
      const pnsRisk = (totalGradientDemand / 250) * 100;
      if (pnsRisk > 100) {
        fail("SAFETY HALT: Subject reported intense peripheral nerve stimulation (PNS). Scan aborted.");
        return;
      }

      // 5. Safety & SNR Physics
      const { modelCountN } = experimentParams;
      const { resolution, scanDuration } = scanParams;
      
      const safetyFactor = 1 + 5.37 * Math.pow(modelCountN, -0.75);
      
      // SNR Calc
      let snrScore = 100; // Base
      if (labSetup.magnetType === '3T') snrScore = 40;
      if (labSetup.magnetType === '7T') snrScore = 70;
      if (labSetup.magnetType === '11.7T') snrScore = 100;
      
      snrScore *= (1.5 / safetyFactor); // Less safe = more power = more SNR
      snrScore *= Math.sqrt(scanDuration) / 2; // Time benefit
      snrScore /= Math.pow(resolution, 3); // Resolution penalty (Cubic for Voxel Volume)

      addLog(`Acquiring k-Space data... [${scanParams.sequence}]`);
      await delay(1000);

      // 6. Random Events
      if (scanDuration > 10 && Math.random() > 0.5) {
        fail("Subject moved during long scan. Motion artifacts render image useless.");
        return;
      }

      if (snrScore < 20) {
        fail("SNR too low. Image is just noise.");
        return;
      }

      // SUCCESS
      const baseMoney = 500000;
      const basePrestige = 10;
      
      // Multipliers based on difficulty/quality
      const qualityMult = snrScore / 50;
      
      const earnedPrestige = Math.floor(basePrestige * qualityMult);
      const earnedMoney = Math.floor(baseMoney * qualityMult);

      setSuccess(true);
      setStats({
        snr: Math.floor(snrScore),
        prestige: earnedPrestige,
        money: earnedMoney
      });
      setStatus('done');
    };

    runSimulation();
  }, []);

  useEffect(() => {
    if (status === 'done') {
        completeExperiment({
            success,
            snr: stats.snr,
            artifacts: false,
            message: success ? "Paper Published" : failReason,
            prestigeGain: success ? stats.prestige : 2,
            moneyGain: success ? stats.money : 50000,
        });
    }
  }, [status]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const fail = (reason: string) => {
    setSuccess(false);
    setFailReason(reason);
    setStatus('done');
  };

  if (status !== 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 font-mono text-sm">
         <div className="w-full max-w-md bg-black text-green-500 p-6 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.1)] border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-pulse"></div>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Iseult_Console_v4.2.exe - Running Sequence</span>
            </div>
            <div className="space-y-2 h-48 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (   
                  <div key={i} className="opacity-80 flex gap-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                      <span>{log}</span>
                  </div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 max-w-2xl mx-auto text-center animate-in zoom-in duration-300">
      {success ? (
        <div className="bg-slate-900/80 p-10 rounded-2xl shadow-2xl border border-slate-700 w-full backdrop-blur-md relative overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-green-500/10 blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-bounce">
                <CheckCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Experiment Successful</h2>
            <p className="text-slate-400 mb-10">Data quality exceeds publication standards.</p>
            
            <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">SNR</div>
                    <div className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{stats.snr.toFixed(1)}</div>
                </div>
                <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 hover:bg-purple-900/30 transition-colors">
                    <div className="text-[10px] text-purple-300/70 uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-1"><Award className="w-3 h-3" /> Prestige</div>
                    <div className="text-3xl font-mono font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">+{stats.prestige}</div>
                </div>
                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30 hover:bg-green-900/30 transition-colors">
                    <div className="text-[10px] text-green-300/70 uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Grant</div>
                    <div className="text-3xl font-mono font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">+${(stats.money/1000).toFixed(0)}k</div>
                </div>
            </div>

            <div className="bg-white text-slate-900 p-6 rounded-lg text-left mb-8 relative overflow-hidden border-4 border-slate-200 transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl group">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl italic">Nature</div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                         <div className="text-xs text-blue-600 font-bold uppercase tracking-widest border-b-2 border-blue-600 inline-block">Journal Acceptance</div>
                         <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="font-serif text-2xl leading-tight font-medium">"In vivo imaging of the human brain with {labSetup.magnetType} MRI: A breakthrough in SNR"</h3>
                </div>
            </div>

            <button onClick={nextRound} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 group">
                Collect Grant & Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 p-10 rounded-2xl shadow-2xl border border-red-900/50 w-full backdrop-blur-md relative overflow-hidden">
             {/* Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-[100px] pointer-events-none"></div>

           <div className="w-20 h-20 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertOctagon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Experiment Failed</h2>
          <div className="bg-red-950/50 p-4 rounded-xl border border-red-900 mb-4 inline-block">
             <p className="text-lg text-red-400 font-medium font-mono">{failReason}</p>
          </div>
          <p className="text-sm text-slate-500 mb-8">The review board has rejected your data.</p>
          
          <button onClick={nextRound} className="px-8 py-3 bg-transparent border border-slate-700 text-slate-400 font-bold rounded-lg hover:bg-slate-800 hover:text-white transition-all">
            Return to Lab (+$50k Consolation)
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperimentReview;