import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Brain, Play, Info, ChevronRight, AlertTriangle, ArrowLeft, Activity, Zap, Waves, Lock, Scan, Radio, Cpu, Eye, Lightbulb, Monitor, Microscope } from 'lucide-react';

type ViewState = 'main' | 'domain_select' | 'briefing';

const DOMAINS = [
  {
    id: 'fmri',
    title: 'Transcranial Imaging',
    subtitle: '(fMRI)',
    description: 'Non-invasive visualization of brain structure and activity using ultra-high field magnetic resonance.',
    icon: Brain,
    color: 'blue',
    available: true,
    technologies: [
      { id: 'mri_11.7t', name: '11.7T Anatomical MRI', desc: 'Mesoscopic structural imaging' },
      { id: 'fmri', name: 'Functional MRI (fMRI)', desc: 'BOLD-based functional mapping' },
      { id: 'dw_mri', name: 'Diffusion MRI (dMRI)', desc: 'White matter tractography' }
    ]
  },
  {
    id: 'eeg_meg',
    title: 'Transcranial Recordings',
    subtitle: '(EEG / MEG / OPM)',
    description: 'Direct measurement of neuronal electrical activity and magnetic fields with millisecond temporal resolution.',
    icon: Activity,
    color: 'emerald',
    available: false,
    technologies: [
      { id: 'eeg', name: 'EEG', desc: 'Scalp electrical potentials' },
      { id: 'meg', name: 'MEG', desc: 'SQUID-based magnetic fields' },
      { id: 'opm', name: 'OPM-MEG', desc: 'Wearable zero-field sensors' }
    ]
  },
  {
    id: 'stimulation',
    title: 'Transcranial Stimulation',
    subtitle: '(TMS / TES / fUS)',
    description: 'Modulate neuronal activity non-invasively using magnetic, electrical, or ultrasonic energy.',
    icon: Zap,
    color: 'amber',
    available: false,
    technologies: [
      { id: 'tms', name: 'TMS', desc: 'Magnetic field induction' },
      { id: 'tes', name: 'tES (tDCS/tACS)', desc: 'Weak electrical currents' },
      { id: 'fus', name: 'Focused Ultrasound', desc: 'Deep focal modulation' }
    ]
  },
  {
    id: 'invasive_rec',
    title: 'Intracranial Recordings',
    subtitle: '(iEEG / Neuropixels)',
    description: 'High-density invasive electrical recording from single neurons to local field potentials.',
    icon: Cpu,
    color: 'cyan',
    available: false,
    technologies: [
      { id: 'ieeg', name: 'iEEG / ECoG', desc: 'Clinical surface grids & depth electrodes' },
      { id: 'neuropixels', name: 'High-Density Probes', desc: 'Neuropixels & silicon arrays' }
    ]
  },
  {
    id: 'invasive_stim',
    title: 'Intracranial Stimulation',
    subtitle: '(DBS / ICMS)',
    description: 'Deep Brain Stimulation and cortical microstimulation for therapeutic and sensory restoration.',
    icon: Radio,
    color: 'orange',
    available: false,
    technologies: [
      { id: 'dbs', name: 'Deep Brain Stimulation', desc: 'Subcortical therapeutic pacing' },
      { id: 'icms', name: 'Intracortical Microstim', desc: 'Sensory restoration & prosthetics' }
    ]
  },
  {
    id: 'optical_rec',
    title: 'Invasive Optical Recordings',
    subtitle: '(Calcium / Voltage)',
    description: 'Imaging cellular activity using fluorescent indicators for calcium, voltage, and glial dynamics.',
    icon: Microscope,
    color: 'purple',
    available: false,
    technologies: [
      { id: 'calcium', name: 'Calcium Imaging', desc: 'Neuronal population dynamics (GCaMP)' },
      { id: 'voltage', name: 'Voltage Imaging', desc: 'Fast membrane potential tracking' },
      { id: 'glia', name: 'Glial Imaging', desc: 'Astrocyte & non-neuronal signaling' }
    ]
  },
  {
    id: 'optical_stim',
    title: 'Invasive Optical Stimulation',
    subtitle: '(Optogenetics)',
    description: 'Precise control of specific neuronal populations using light-sensitive ion channels and holographic targeting.',
    icon: Lightbulb,
    color: 'rose',
    available: true,
    technologies: [
      { id: 'optogenetics', name: 'Optogenetics', desc: 'Cell-type specific actuation' },
      { id: 'holography', name: 'Holographic Photostim', desc: '3D patterned light Shaping' }
    ]
  },
  {
    id: 'vr',
    title: 'VR in Neurosciences',
    subtitle: '(Virtual Reality)',
    description: 'Immersive environments for studying behavior, navigation, and closed-loop neural interaction.',
    icon: Monitor,
    color: 'indigo',
    available: false,
    technologies: [
      { id: 'vr_behavior', name: 'Behavioral Navigation', desc: 'Rodent/Human spatial tasks' },
      { id: 'closed_loop', name: 'Closed-loop Interaction', desc: 'Real-time neural feedback' }
    ]
  }
];

const StartScreen: React.FC = () => {
  const { setGameStage, setSelectedTheme } = useGameStore();
  const [view, setView] = useState<ViewState>('main');

  const handleDomainSelect = (domainId: string) => {
    if (domainId === 'fmri') {
      setSelectedTheme(domainId);
      setView('briefing');
    } else if (domainId === 'optical_stim') {
      setSelectedTheme(domainId);
      setGameStage('procurement'); // Triggers App.tsx render loop
    } else {
      // Placeholder
    }
  };

  const startGame = () => {
    setGameStage('procurement');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-7xl p-6">
        {view === 'main' && (
          // Main Landing
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700 max-w-4xl mx-auto">
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
                  Multimodal Neuroscience Simulation
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setView('domain_select')}
                className="group relative px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
              >
                <span className="flex items-center gap-3 relative z-10">
                  <Play className="w-6 h-6 fill-current" />
                  Select Domain
                </span>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity"></div>
              </button>

              <p className="text-[10px] text-slate-600 font-mono mt-8">
                v1.3.0 • Integrated Research Themes: 8 Major Domains
              </p>
            </div>
          </div>
        )}

        {view === 'domain_select' && (
          // Domain Selection Grid
          <div className="animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Research Domains</h2>
                <p className="text-slate-400 font-mono text-sm">SELECT A TECHNOLOGY STACK TO SPECIALIZE IN (1/8)</p>
              </div>
              <button 
                onClick={() => setView('main')}
                className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => handleDomainSelect(domain.id)}
                  className={`group flex flex-col text-left bg-slate-900/50 border rounded-2xl transition-all relative overflow-hidden h-[28rem]
                    ${domain.available 
                      ? 'hover:bg-slate-800/80 border-slate-700 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer' 
                      : 'border-slate-800/50 opacity-60 cursor-not-allowed'
                    }`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500
                    ${domain.color === 'blue' ? 'from-blue-500 to-cyan-500' : 
                      domain.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                      domain.color === 'amber' ? 'from-amber-500 to-orange-500' :
                      domain.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
                      domain.color === 'orange' ? 'from-orange-500 to-red-500' :
                      domain.color === 'purple' ? 'from-purple-500 to-pink-500' :
                      domain.color === 'rose' ? 'from-rose-500 to-red-500' :
                      'from-indigo-500 to-violet-500'}`} 
                  />

                  {/* Header Section */}
                  <div className="p-6 pb-2 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl transition-colors
                        ${domain.available 
                          ? 'bg-slate-800 group-hover:bg-white/10 text-white' 
                          : 'bg-slate-900 text-slate-600'
                        }`}>
                        <domain.icon className="w-6 h-6" />
                      </div>
                      {!domain.available && (
                         <div className="flex items-center gap-1 text-[10px] font-mono uppercase bg-slate-950/50 px-2 py-1 rounded text-slate-500 border border-slate-800">
                           <Lock className="w-3 h-3" />
                         </div>
                      )}
                      {domain.available && (
                         <div className="flex items-center gap-1 text-[10px] font-mono uppercase bg-blue-900/30 px-2 py-1 rounded text-blue-400 border border-blue-500/30">
                           <Waves className="w-3 h-3" />
                         </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-white transition-colors leading-tight">
                      {domain.title}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-wider truncate">
                      {domain.subtitle}
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {domain.description}
                    </p>
                  </div>

                  {/* Tech Stack List - Fixed Height for Alignment */}
                  <div className="bg-slate-950/30 border-t border-slate-800/50 p-4 h-[7.5rem]">
                    <div className="space-y-2">
                      {domain.technologies.map((tech) => (
                        <div key={tech.id} className="flex items-center gap-2 group/tech">
                          <div className={`w-1 h-1 rounded-full shrink-0 
                            ${domain.available ? 'bg-' + domain.color + '-500' : 'bg-slate-700'}`}>
                          </div>
                          <div className="truncate">
                            <span className={`text-xs font-mono font-bold mr-1 ${domain.available ? 'text-slate-300' : 'text-slate-600'}`}>
                              {tech.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer - Unified for all cards */}
                  {domain.available ? (
                    <div className="px-6 py-3 border-t border-slate-800/50 flex items-center justify-between text-blue-400 text-xs font-bold bg-blue-500/5">
                      <span>Initialize</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <div className="px-6 py-3 border-t border-slate-800/30 flex items-center justify-between text-slate-600 text-xs font-bold bg-slate-900/20">
                      <span>Locked</span>
                      <Lock className="w-3 h-3 opacity-50" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'briefing' && (
          // Instructions Panel (Detailed Briefing for fMRI)
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 shadow-2xl animate-in slide-in-from-right-10 duration-300 relative overflow-hidden max-w-5xl mx-auto">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Domain: Transcranial Imaging</h2>
                <div className="flex items-center gap-3">
                   <span className="text-blue-400 font-mono text-xs tracking-widest">TECH: MRI / fMRI / 11.7T</span>
                   <span className="h-px w-4 bg-slate-600"></span>
                   <span className="text-slate-400 font-mono text-xs tracking-widest">STATUS: OPERATIONAL</span>
                </div>
              </div>
              <button 
                onClick={() => setView('domain_select')}
                className="text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg px-3 py-1"
              >
                Back
              </button>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="space-y-3 group">
                <div className="bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform">1</div>
                <h3 className="text-lg font-bold text-slate-200">Hardware Procurement</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Manage a <span className="text-green-400 font-mono">$10M</span> budget. Acquire Magnets (3T-11.7T), Cooling Systems, and RF Coils.
                </p>
              </div>

              <div className="space-y-3 group">
                <div className="bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-purple-400 font-bold border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform">2</div>
                <h3 className="text-lg font-bold text-slate-200">Safety Console</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Calibrate the <span className="text-white">VOP Algorithm</span>. Monitor SAR levels and adjust virtual models to ensure patient safety at 11.7T.
                </p>
              </div>

              <div className="space-y-3 group">
                <div className="bg-emerald-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">3</div>
                <h3 className="text-lg font-bold text-slate-200">Experiment Review</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Analyze signal-to-noise ratio (SNR) and artifacts. Publish results to gain Prestige and unlock advanced tech.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex gap-4 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <strong className="text-slate-200 block mb-1 text-xs uppercase tracking-wide">Physics Simulation Note</strong>
                This module simulates real-world MRI physics, including B0 inhomogeneity, specific absorption rates (SAR), and parallel transmission requirements for ultra-high field imaging.
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Enter Lab <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartScreen;