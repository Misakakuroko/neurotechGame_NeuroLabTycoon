import { create } from 'zustand';

export type Chapter = 'intro' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'end_good' | 'end_bad';

interface OpticalGameState {
  // Global Variables
  knowledgePoints: number;
  evidenceCollected: string[];
  suspicionLevel: number;
  currentChapter: Chapter;
  
  // Chapter 1 State
  c1_wires: {
    inputA: { source: string | null; target: string | null };
    inputB: { source: string | null; mediator: string | null; target: string | null };
  };
  c1_config: {
    sourceX: number; // Laser source X position
    targetX: number;
    targetY: number;
    vessels: {x: number, y: number}[];
  };

  // Chapter 2 State
  c2_config: {
    ledSpacing: number; // mm
  };
  c2_mouse: {
    x: number;
    y: number;
    angle: number;
    isFrozen: boolean;
  };
  c2_status: 'setup' | 'active' | 'failed' | 'complete';
  
  // Chapter 3 State
  c3_diagnosis: {
    pathwayIdentified: boolean;
  };
  c3_treatment: {
    selectedMethod: 'fiber' | 'ucnp' | null;
    opsinType: 'ChR2' | 'NpHR' | null;
    targetWavelength: number;
    laserPower: number;
    monitoringDays: number;
  };
  c3_result: {
    success: boolean;
    tissueIntegrity: number; // 0-100
    treatmentStability: number; // 0-100
  };

  // Chapter 4 State
  c4_debate: {
    currentClaimIndex: number;
    ceoCredibility: number;
    playerCredibility: number;
    history: string[]; // Log of moves
  };

  // Actions
  setChapter: (chapter: Chapter) => void;
  addKnowledgePoints: (points: number) => void;
  addEvidence: (evidence: string) => void;
  increaseSuspicion: (amount: number) => void;
  
  // Chapter 1 Actions
  setC1Wire: (path: 'inputA' | 'inputB', part: string, value: string) => void;
  resetC1: () => void;
  initC1Level: () => void;

  // Chapter 2 Actions
  setC2LedSpacing: (spacing: number) => void;
  updateMouse: (params: Partial<OpticalGameState['c2_mouse']>) => void;
  setC2Status: (status: OpticalGameState['c2_status']) => void;
  resetC2: () => void;
  
  // Chapter 3 Actions
  identifyPathway: () => void;
  selectTreatment: (method: 'fiber' | 'ucnp') => void;
  setTreatmentConfig: (config: Partial<OpticalGameState['c3_treatment']>) => void;
  setMonitoringDays: (days: number) => void;
  completeChapter3: (result: OpticalGameState['c3_result']) => void;

  // Chapter 4 Actions
  playCard: (cardEffect: { damage: number, selfHeal: number, log: string }) => void;
  nextClaim: () => void;
  resetC4: () => void;
  
  resetGame: () => void;
}

export const useOpticalGameStore = create<OpticalGameState>((set) => ({
  knowledgePoints: 0,
  evidenceCollected: [],
  suspicionLevel: 0,
  currentChapter: 'chapter1',

  c1_wires: {
    inputA: { source: null, target: null },
    inputB: { source: null, mediator: null, target: null },
  },
  c1_config: {
    sourceX: 10,
    targetX: 10,
    targetY: 12,
    vessels: []
  },

  c2_config: { ledSpacing: 0.5 },
  c2_mouse: { x: 50, y: 90, angle: 0, isFrozen: false },
  c2_status: 'setup',

  c3_diagnosis: {
    pathwayIdentified: false,
  },
  c3_treatment: {
    selectedMethod: null,
    opsinType: null,
    targetWavelength: 470, // Default to blue light
    laserPower: 0,
    monitoringDays: 0,
  },
  c3_result: {
    success: false,
    tissueIntegrity: 100,
    treatmentStability: 0
  },

  c4_debate: {
    currentClaimIndex: 0,
    ceoCredibility: 100,
    playerCredibility: 100,
    history: [],
  },

  setChapter: (chapter) => set({ currentChapter: chapter }),
  
  addKnowledgePoints: (points) => set((state) => ({ 
    knowledgePoints: state.knowledgePoints + points 
  })),
  
  addEvidence: (evidence) => set((state) => {
    if (state.evidenceCollected.includes(evidence)) return state;
    return { evidenceCollected: [...state.evidenceCollected, evidence] };
  }),
  
  increaseSuspicion: (amount) => set((state) => ({ 
    suspicionLevel: Math.min(100, state.suspicionLevel + amount) 
  })),

  // Chapter 1
  setC1Wire: (path, part, value) => set((state) => ({
    c1_wires: {
      ...state.c1_wires,
      [path]: {
        ...state.c1_wires[path],
        [part]: value
      }
    }
  })),
  resetC1: () => set((state) => ({
    c1_wires: {
      inputA: { source: null, target: null },
      inputB: { source: null, mediator: null, target: null },
    }
  })),
  initC1Level: () => {
    // --- 智能地图生成器 v3: 保证可解性 & 安全缓冲 ---
    
    // 1. 随机光源位置 (稍微收缩范围，避免太靠边射不到)
    const sourceX = Math.floor(Math.random() * 10) + 5; // 5-14
    
    // 2. 随机目标位置
    const targetY = Math.floor(Math.random() * 4) + 10; // 10-13
    const targetX = Math.max(2, Math.min(17, Math.floor(Math.random() * 16) + 2));

    // 3. 生成血管 (障碍物)
    const vessels: {x: number, y: number}[] = [];
    const numVesselGroups = 5; 
    
    // 安全区判定函数 (关键修复)
    const isSafeZone = (vx: number, vy: number) => {
        // 1. 绝对禁区：目标本身及其周围 1 格 (3x3区域)
        //    这保证了目标旁边一定有空位放 UCNP，且血管不会贴脸
        if (Math.abs(vx - targetX) <= 1 && Math.abs(vy - targetY) <= 1) return true;
        
        // 2. 顶部入口保护：光源正下方前 2 格不生成血管，防止还没射出就堵死
        if (Math.abs(vx - sourceX) <= 1 && vy <= 3) return true;

        return false;
    };

    for(let i=0; i<numVesselGroups; i++) {
        const startX = Math.floor(Math.random() * 18) + 1;
        const startY = Math.floor(Math.random() * 9) + 3; // 3-11层
        const length = Math.floor(Math.random() * 4) + 2;
        const isHorizontal = Math.random() > 0.6;

        for(let j=0; j<length; j++) {
            const x = isHorizontal ? startX + j : startX;
            const y = isHorizontal ? startY : startY + j;
            
            if (x < 20 && y < 14 && !isSafeZone(x, y)) {
                     vessels.push({x, y});
            }
        }
    }

    return set({
        c1_config: {
            sourceX,
            targetX,
            targetY,
            vessels
        }
    });
  },

  // Chapter 2
  setC2LedSpacing: (spacing) => set((state) => ({
    c2_config: { ...state.c2_config, ledSpacing: spacing }
  })),
  updateMouse: (params) => set((state) => ({
    c2_mouse: { ...state.c2_mouse, ...params }
  })),
  setC2Status: (status) => set({ c2_status: status }),
  resetC2: () => set({
    c2_config: { ledSpacing: 0.5 },
    c2_mouse: { x: 50, y: 90, angle: 0, isFrozen: false },
    c2_status: 'setup'
  }),

  // Chapter 3
  identifyPathway: () => set((state) => ({
    c3_diagnosis: { ...state.c3_diagnosis, pathwayIdentified: true }
  })),

  selectTreatment: (method) => set((state) => ({
    c3_treatment: { ...state.c3_treatment, selectedMethod: method }
  })),

  setTreatmentConfig: (config) => set((state) => ({
    c3_treatment: { ...state.c3_treatment, ...config }
  })),
  
  setMonitoringDays: (days) => set((state) => ({
    c3_treatment: { ...state.c3_treatment, monitoringDays: days }
  })),

  completeChapter3: (result) => set((state) => ({
    c3_result: result,
    // Auto-update CEO credibility based on result
    c4_debate: {
        ...state.c4_debate,
        ceoCredibility: result.success ? state.c4_debate.ceoCredibility + 10 : state.c4_debate.ceoCredibility - 10
    }
  })),

  // Chapter 4
  playCard: ({ damage, selfHeal, log }) => set((state) => ({
    c4_debate: {
        ...state.c4_debate,
        ceoCredibility: Math.max(0, state.c4_debate.ceoCredibility - damage),
        playerCredibility: Math.min(100, state.c4_debate.playerCredibility + selfHeal),
        history: [...state.c4_debate.history, log]
    }
  })),
  nextClaim: () => set((state) => ({
      c4_debate: {
          ...state.c4_debate,
          currentClaimIndex: state.c4_debate.currentClaimIndex + 1
      }
  })),
  resetC4: () => set({
      c4_debate: {
        currentClaimIndex: 0,
        ceoCredibility: 100,
        playerCredibility: 100,
        history: [],
      }
  }),

  resetGame: () => set({
    knowledgePoints: 0,
    evidenceCollected: [],
    suspicionLevel: 0,
    currentChapter: 'chapter1',
    c1_wires: {
        inputA: { source: null, target: null },
        inputB: { source: null, mediator: null, target: null },
    },
    c1_config: { sourceX: 10, targetX: 10, targetY: 12, vessels: [] },
    c2_config: { ledSpacing: 0.5 },
    c2_mouse: { x: 50, y: 90, angle: 0, isFrozen: false },
    c2_status: 'setup',
    c3_diagnosis: { pathwayIdentified: false },
    c3_treatment: { selectedMethod: null, opsinType: null, targetWavelength: 470, laserPower: 0, monitoringDays: 0 },
    c3_result: { success: false, tissueIntegrity: 100, treatmentStability: 0 },
    c4_debate: {
        currentClaimIndex: 0,
        ceoCredibility: 100,
        playerCredibility: 100,
        history: [],
      }
  }),
}));
