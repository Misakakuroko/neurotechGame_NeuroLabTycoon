import React, { useState } from 'react';
import { useOpticalGameStore } from '../../store/opticalGameStore';
import { Gavel, Shield, Scale, Users, Skull, FileWarning, BadgeHelp } from 'lucide-react';

const CLAIMS = [
    {
        id: 0,
        text: "Ladies and gentlemen of the jury, our technology simply helps organisms 'win'. In the food competition test, the controlled subjects were more successful. We are optimizing nature!",
        weakness: 'mkultra'
    },
    {
        id: 1,
        text: "Critics call this invasive, but look! No wires! The device weighs less than 2 grams. It's practically invisible compared to the barbarism of optical fibers.",
        weakness: 'viral_vector'
    },
    {
        id: 2,
        text: "And safety? These upconversion nanoparticles are harmless. They do their job and... well, they are biocompatible. There is absolutely no long-term risk.",
        weakness: 'clearance'
    }
];

const CARDS = [
    {
        id: 'mkultra',
        title: 'MKUltra Precedent',
        desc: 'Historical evidence of unethical behavioral control. Cites loss of free will.',
        icon: Users,
        color: 'border-amber-500 text-amber-500'
    },
    {
        id: 'viral_vector',
        title: 'Viral Vector Risk',
        desc: 'Requires AAV injection. Genetic modification is permanent and invasive.',
        icon: Skull,
        color: 'border-red-500 text-red-500'
    },
    {
        id: 'clearance',
        title: 'Clearance Unknown',
        desc: 'Cites Li et al., 2025: "UCNP clearance mechanism is not fully understood."',
        icon: BadgeHelp,
        color: 'border-purple-500 text-purple-500'
    }
];

const Chapter4: React.FC = () => {
  const { 
    c4_debate, playCard, nextClaim, resetC4,
    setChapter, addKnowledgePoints
  } = useOpticalGameStore();
  
  const [feedback, setFeedback] = useState<{type: 'hit'|'miss', msg: string} | null>(null);
  const [gameOver, setGameOver] = useState<'win' | 'loss' | null>(null);

  const currentClaim = CLAIMS[c4_debate.currentClaimIndex];

  const handleCardPlay = (cardId: string) => {
      if (!currentClaim) return;

      const isCounter = cardId === currentClaim.weakness;
      
      if (isCounter) {
          playCard({ 
              damage: 40, 
              selfHeal: 10, 
              log: `OBJECTION! ${CARDS.find(c => c.id === cardId)?.title} completely refutes the claim.` 
          });
          setFeedback({ type: 'hit', msg: "EFFECTIVE COUNTER! The CEO stammers." });
      } else {
          playCard({ 
              damage: 5, 
              selfHeal: -20, 
              log: `WEAK ARGUMENT. The card ${CARDS.find(c => c.id === cardId)?.title} is irrelevant here.` 
          });
          setFeedback({ type: 'miss', msg: "IRRELEVANT! The Judge sustains the CEO's point." });
      }

      // Delay then next round
      setTimeout(() => {
          setFeedback(null);
          if (c4_debate.currentClaimIndex < 2) {
             nextClaim();
          } else {
             // End Game Check
             if (c4_debate.ceoCredibility <= 0 || (c4_debate.ceoCredibility < c4_debate.playerCredibility)) {
                 setGameOver('win');
                 addKnowledgePoints(500);
             } else {
                 setGameOver('loss');
             }
          }
      }, 2000);
  };

  if (gameOver) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              {gameOver === 'win' ? (
                  <div className="bg-emerald-900/20 p-12 rounded-3xl border border-emerald-500 animate-in zoom-in duration-500">
                      <Scale className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                      <h1 className="text-5xl font-bold text-white mb-4">VERDICT: GUILTY</h1>
                      <p className="text-xl text-emerald-300 mb-8">
                          The court rules in favor of ethical oversight. The "Optical Conspiracy" is exposed.
                      </p>
                      <button 
                        onClick={() => setChapter('intro')}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                      >
                          RETURN TO MAIN MENU
                      </button>
                  </div>
              ) : (
                  <div className="bg-red-900/20 p-12 rounded-3xl border border-red-500 animate-in zoom-in duration-500">
                      <Gavel className="w-24 h-24 text-red-500 mx-auto mb-6" />
                      <h1 className="text-5xl font-bold text-white mb-4">CASE DISMISSED</h1>
                      <p className="text-xl text-red-300 mb-8">
                          You failed to provide sufficient evidence. The corporation continues unchecked.
                      </p>
                      <button 
                        onClick={resetC4}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
                      >
                          APPEAL (RETRY)
                      </button>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-200 font-mono h-full flex flex-col">
      <div className="mb-6 border-b border-slate-700 pb-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-purple-400 mb-2">CHAPTER 4: THE VERDICT</h1>
            <p className="text-slate-400 text-sm">OBJECTIVE: Expose the ethical violations in the public hearing.</p>
        </div>
        
        <div className="flex gap-8">
            <div className="text-center">
                <div className="text-xs text-red-400 font-bold mb-1">CEO CREDIBILITY</div>
                <div className="w-48 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                    <div 
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${c4_debate.ceoCredibility}%` }}
                    ></div>
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs text-blue-400 font-bold mb-1">YOUR CREDIBILITY</div>
                <div className="w-48 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${c4_debate.playerCredibility}%` }}
                    ></div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-grow grid grid-rows-[auto_1fr_auto] gap-6">
        
        {/* CEO AREA */}
        <div className="flex gap-6 items-start">
            <div className="w-32 h-32 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center shrink-0 shadow-2xl">
                <div className="text-6xl">???</div>
            </div>
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 relative flex-grow">
                <div className="absolute -left-3 top-8 w-6 h-6 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
                <h3 className="text-red-400 font-bold text-sm mb-2 uppercase tracking-widest">NeuroTech CEO Testimony</h3>
                <p className="text-xl text-white leading-relaxed italic">"{currentClaim?.text}"</p>
            </div>
        </div>

        {/* BATTLEFIELD / FEEDBACK */}
        <div className="flex items-center justify-center relative min-h-[200px]">
            {feedback && (
                <div className={`text-center animate-in zoom-in duration-300 p-8 rounded-3xl border-2 bg-black/80 backdrop-blur-md z-20
                    ${feedback.type === 'hit' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                    <h2 className="text-4xl font-bold mb-2">{feedback.type === 'hit' ? 'COUNTER SUCCESSFUL!' : 'OBJECTION OVERRULED'}</h2>
                    <p className="text-lg text-white">{feedback.msg}</p>
                </div>
            )}
            
            <div className="absolute inset-0 flex flex-col justify-end opacity-30 pointer-events-none">
                <div className="h-px bg-slate-700 w-full mb-4"></div>
                <div className="text-center text-slate-600 text-xs">COURTROOM RECORDING IN PROGRESS</div>
            </div>
        </div>

        {/* PLAYER HAND */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CARDS.map((card) => (
                <button
                    key={card.id}
                    onClick={() => handleCardPlay(card.id)}
                    disabled={!!feedback}
                    className={`group relative p-6 bg-slate-900 border-2 rounded-xl text-left transition-all hover:-translate-y-2 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0
                        ${card.color} ${feedback ? 'grayscale' : ''}`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg group-hover:text-white transition-colors">{card.title}</h4>
                        <card.icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {card.desc}
                    </p>
                    <div className="mt-4 text-[10px] uppercase tracking-widest opacity-50 border-t border-current pt-2">
                        Evidence Card
                    </div>
                </button>
            ))}
        </div>

      </div>
    </div>
  );
};

export default Chapter4;
