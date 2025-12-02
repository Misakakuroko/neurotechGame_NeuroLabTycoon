import { create } from 'zustand';

// Types
export type MagnetType = '3T' | '7T' | '11.7T';
export type CoolingType = 'Standard' | 'Superfluid';
export type CoilType = 'Birdcage' | 'Avanti2';
export type GradientType = 'Standard' | 'HighPerf' | 'Connectome';
export type SubjectType = 'Phantom' | 'Adult' | 'Pediatric' | 'Neonate';
export type SequenceType = 'GRE' | 'SE' | 'EPI';

interface LabSetup {
  magnetType: MagnetType | null;
  coolingSystem: CoolingType | null;
  coilType: CoilType | null;
  gradientType: GradientType;
  pTxEnabled: boolean;
}

interface ScanParams {
  sequence: SequenceType;
  resolution: number; // mm (0.5 - 3.0)
  scanDuration: number; // minutes (1 - 20)
}

interface ShimmingParams {
  x: number; // -100 to 100, target 0
  y: number;
  z: number;
}

interface GameState {
  // Resources
  budget: number;
  prestige: number;
  day: number;

  // Inventory & Unlocks
  unlockedMagnets: MagnetType[];
  labSetup: LabSetup;

  // Experiment Config
  subjectType: SubjectType;
  experimentParams: {
    modelCountN: number;
    checklist: {
      physiological: boolean;
      vestibular: boolean;
      metallicImplants: boolean;
    };
  };
  
  // Advanced Mechanics
  scanParams: ScanParams;
  shimming: ShimmingParams;
  
  // Game State
  gameStage: 'start' | 'procurement' | 'safety' | 'review';
  lastResult: {
    success: boolean;
    snr: number;
    artifacts: boolean;
    message: string;
    prestigeGain: number;
    moneyGain: number;
  } | null;

  // Tutorial State (New)
  tutorialActive: boolean;
  tutorialStep: number;

  // Actions
  setBudget: (amount: number) => void;
  purchaseItem: (cost: number, item: Partial<LabSetup>) => void;
  setExperimentParam: (params: Partial<GameState['experimentParams']>) => void;
  setScanParam: (params: Partial<ScanParams>) => void;
  setShimming: (params: Partial<ShimmingParams>) => void;
  setSubjectType: (type: SubjectType) => void;
  toggleChecklist: (item: keyof GameState['experimentParams']['checklist']) => void;
  setGameStage: (stage: GameState['gameStage']) => void;
  completeExperiment: (result: GameState['lastResult']) => void;
  nextRound: () => void;
  resetGame: () => void;
  
  // Tutorial Actions (New)
  nextTutorialStep: () => void;
  skipTutorial: () => void;
}

// Costs & Config
export const COSTS = {
  magnet: { '3T': 1000000, '7T': 3000000, '11.7T': 8000000 },
  cooling: { 'Standard': 500000, 'Superfluid': 2000000 },
  coil: { 'Birdcage': 100000, 'Avanti2': 500000 },
  gradient: { 'Standard': 0, 'HighPerf': 800000, 'Connectome': 2500000 },
  pTx: 1500000,
};

export const UNLOCK_THRESHOLDS = {
  '3T': 0,
  '7T': 50,
  '11.7T': 200,
};

const INITIAL_STATE = {
  budget: 2000000,
  prestige: 0,
  day: 1,
  unlockedMagnets: ['3T'] as MagnetType[],
  
  labSetup: {
    magnetType: null,
    coolingSystem: null,
    coilType: null,
    gradientType: 'Standard' as GradientType,
    pTxEnabled: false,
  },
  
  subjectType: 'Phantom' as SubjectType,
  
  experimentParams: {
    modelCountN: 2,
    checklist: {
      physiological: false,
      vestibular: false,
      metallicImplants: false,
    },
  },

  scanParams: {
    sequence: 'GRE' as SequenceType,
    resolution: 2.0,
    scanDuration: 5,
  },

  shimming: { x: 20, y: -30, z: 15 },

  gameStage: 'start' as const,
  lastResult: null,

  // Tutorial Initial State
  tutorialActive: true,
  tutorialStep: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...INITIAL_STATE,

  setBudget: (amount) => set({ budget: amount }),

  purchaseItem: (cost, item) => set((state) => {
    if (state.budget < cost) return state;
    // Auto-advance tutorial if purchasing 3T magnet (Step 2 -> 3)
    let nextStep = state.tutorialStep;
    if (state.tutorialActive && state.tutorialStep === 2 && item.magnetType === '3T') {
       nextStep = 3;
    }
    // Auto-advance if cooling purchased (Step 3 -> 4)
    if (state.tutorialActive && state.tutorialStep === 3 && item.coolingSystem) {
        nextStep = 4;
    }
     // Auto-advance if coil purchased (Step 4 -> 5)
    if (state.tutorialActive && state.tutorialStep === 4 && item.coilType) {
        nextStep = 5;
    }

    return {
      budget: state.budget - cost,
      labSetup: { ...state.labSetup, ...item },
      tutorialStep: nextStep,
    };
  }),

  setExperimentParam: (params) => set((state) => ({
    experimentParams: { ...state.experimentParams, ...params },
  })),

  setScanParam: (params) => set((state) => ({
    scanParams: { ...state.scanParams, ...params },
  })),

  setShimming: (params) => set((state) => ({
    shimming: { ...state.shimming, ...params },
  })),

  setSubjectType: (type) => set({ subjectType: type }),

  toggleChecklist: (item) => set((state) => ({
    experimentParams: {
      ...state.experimentParams,
      checklist: {
        ...state.experimentParams.checklist,
        [item]: !state.experimentParams.checklist[item],
      },
    },
  })),

  setGameStage: (stage) => set((state) => {
     // Tutorial hook: entering safety console
     let nextStep = state.tutorialStep;
     if (state.tutorialActive && state.tutorialStep === 5 && stage === 'safety') {
         nextStep = 6;
     }
     return { gameStage: stage, tutorialStep: nextStep };
  }),

  completeExperiment: (result) => set((state) => {
    const newPrestige = state.prestige + (result?.prestigeGain || 0);
    const newBudget = state.budget + (result?.moneyGain || 0);
    
    // Unlock logic
    const newUnlocks = [...state.unlockedMagnets];
    if (newPrestige >= UNLOCK_THRESHOLDS['7T'] && !newUnlocks.includes('7T')) newUnlocks.push('7T');
    if (newPrestige >= UNLOCK_THRESHOLDS['11.7T'] && !newUnlocks.includes('11.7T')) newUnlocks.push('11.7T');

    return {
      lastResult: result,
      prestige: newPrestige,
      budget: newBudget,
      unlockedMagnets: newUnlocks,
      tutorialStep: state.tutorialActive ? 99 : state.tutorialStep, // End tutorial after first experiment
    };
  }),

  nextRound: () => set((state) => ({
    day: state.day + 1,
    gameStage: 'procurement',
    lastResult: null,
    shimming: { 
      x: Math.floor(Math.random() * 60) - 30, 
      y: Math.floor(Math.random() * 60) - 30,
      z: Math.floor(Math.random() * 60) - 30 
    }
  })),

  resetGame: () => set(INITIAL_STATE),

  nextTutorialStep: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),
  skipTutorial: () => set({ tutorialActive: false, tutorialStep: 99 }),
}));