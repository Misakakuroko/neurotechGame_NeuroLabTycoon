import React from 'react';
import { useGameStore } from '../store/gameStore';
import { HelpCircle, Check, X, Lightbulb } from 'lucide-react';

const TutorialOverlay: React.FC = () => {
  const { tutorialActive, tutorialStep, nextTutorialStep, skipTutorial, gameStage } = useGameStore();

  if (!tutorialActive || tutorialStep >= 99) return null;

  // Only show overlay on Start or valid game stages
  if (gameStage === 'start') return null;

  // Check if the current step matches the current game stage.
  // If the tutorial expects 'safety' stage (step 6+) but we are in 'procurement', don't show it yet.
  // Or if tutorial expects 'procurement' (step < 6) but we are in 'safety', hide it.
  
  // Step 0-5: Procurement (MagnetShop)
  // Step 6-11: Safety (SafetyConsole)
  
  const isStepForCurrentStage = () => {
      if (tutorialStep <= 5 && gameStage === 'procurement') return true;
      if (tutorialStep >= 6 && tutorialStep <= 11 && gameStage === 'safety') return true;
      return false;
  };

  if (!isStepForCurrentStage()) return null;

  // Content for each step
  const steps = [
    {
      title: "Welcome, Researcher!",
      content: "Welcome to the NeuroLab. Your goal is to set up an MRI experiment and acquire high-quality brain images (SNR). I'll guide you through your first scan.",
      target: null,
      position: "center"
    },
    {
      title: "1. Select a Subject",
      content: "First, we need something to scan. Start with a 'Phantom' (a water bottle). It's easy to scan and good for calibration.",
      target: "research-target",
      position: "top-left"
    },
    {
      title: "2. Buy a Magnet",
      content: "The Magnet is the heart of the MRI. You have $2M budget. Buy the '3T' Magnet to start. It's reliable and affordable.",
      target: "magnet-section",
      position: "center-right"
    },
    {
      title: "3. Cooling System",
      content: "Magnets get hot! You need liquid helium. Buy the 'Standard 4.2K' Cooling system.",
      target: "cooling-section",
      position: "center-right"
    },
    {
      title: "4. RF Coil",
      content: "The Coil sends and receives signals. The 'Birdcage' coil is standard for head imaging. Buy it.",
      target: "coil-section",
      position: "center-right"
    },
    {
      title: "5. Enter Control Room",
      content: "Great! Your lab is equipped. Now click 'Enter Control Room' to configure your scan parameters.",
      target: "enter-btn",
      position: "bottom-right"
    },
    {
      title: "6. Safety & Physics",
      content: "This is the console. Here you balance image quality (SNR) vs. safety. Don't worry about the complex graphs yet.",
      target: null,
      position: "center"
    },
    {
      title: "7. Resolution vs. Signal",
      content: "Try moving the Resolution slider. Higher resolution (smaller mm) means better detail, but MUCH less signal (SNR). Keep it around 2.0mm for now.",
      target: "resolution-slider",
      position: "bottom-left"
    },
    {
      title: "8. Gradient Load (dB/dt)",
      content: "This monitors the stress on your gradient coils. High resolution or fast sequences (EPI) increase load. If it hits 100%, your hardware fails.",
      target: "gradient-panel",
      position: "bottom-left"
    },
    {
      title: "9. VOP Safety Model",
      content: "The VOP count (N) controls safety margins. Higher N = tighter safety = more power allowed (Better SNR). But computing load increases.",
      target: "vop-panel",
      position: "bottom-left"
    },
    {
      title: "10. Shimming (Focus)",
      content: "Magnetic fields aren't perfect. Adjust X/Y/Z shims until the error (Δ Hz) is close to 0. This 'focuses' the image.",
      target: "shim-controls",
      position: "bottom-left"
    },
    {
      title: "11. Run the Scan",
      content: "Check the safety checklist items, then click 'Acquire Data' to see your results!",
      target: "acquire-btn",
      position: "bottom-right"
    }
  ];

  const currentStep = steps[tutorialStep] || null;
  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-sans">
      {/* Backdrop - only blocks clicks if we are in a 'modal' step (target=null), otherwise lets clicks through but dims */}
      <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${currentStep.target ? 'pointer-events-none opacity-20' : 'pointer-events-auto opacity-80'}`} />

      {/* Floating Card */}
      <div className={`
        pointer-events-auto
        bg-slate-900 p-6 rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-blue-500/50 w-96 max-w-[90vw]
        transform transition-all duration-500 ease-in-out
        flex flex-col gap-4 relative overflow-hidden
        ${currentStep.position === 'center' ? 'scale-100' : ''}
        ${currentStep.position === 'top-left' ? 'absolute top-32 left-10' : ''}
        ${currentStep.position === 'center-right' ? 'absolute top-1/3 right-10' : ''}
        ${currentStep.position === 'bottom-right' ? 'absolute bottom-32 right-10' : ''}
        ${currentStep.position === 'bottom-left' ? 'absolute bottom-32 left-10' : ''}
      `}>
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="flex items-start gap-4 relative z-10">
            <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 border border-blue-500/30 shadow-lg">
                <Lightbulb className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-white tracking-tight">{currentStep.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-1">{currentStep.content}</p>
            </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-2 relative z-10">
            <div className="flex gap-1.5">
                {steps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-blue-500' : i < tutorialStep ? 'w-1.5 bg-blue-800' : 'w-1.5 bg-slate-800'}`} />
                ))}
            </div>
            <div className="flex gap-3">
                <button onClick={skipTutorial} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 font-medium transition-colors">
                    Skip
                </button>
                <button 
                    onClick={nextTutorialStep}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                    {currentStep.target ? 'Okay' : 'Next'} <Check className="w-3 h-3" />
                </button>
            </div>
        </div>
        
        {/* Pointer Arrow (Visual only, simplistic) */}
        {currentStep.target && (
             <div className={`absolute w-4 h-4 bg-slate-900 border-b border-r border-blue-500/50 transform rotate-45
                ${currentStep.position.includes('top') ? '-bottom-2 left-10' : ''}
                ${currentStep.position.includes('bottom') ? '-top-2 right-10' : ''}
                ${currentStep.position.includes('left') ? '-right-2 top-10' : ''}
                ${currentStep.position.includes('right') ? '-left-2 top-10' : ''}
             `}></div>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;