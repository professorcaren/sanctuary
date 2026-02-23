import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Shield, Scale, Users, Zap, BookOpen, Crown, UserCircle } from 'lucide-react';
import { ArchetypeType } from '../../types/game';

const ARCHETYPES: { id: ArchetypeType; label: string; icon: any; description: string; bonus: string }[] = [
  { 
    id: 'charismatic', 
    label: 'The Charismatic', 
    icon: <Sparkles size={18} />, 
    description: 'A natural leader with an magnetic presence.', 
    bonus: 'Balanced start' 
  },
  { 
    id: 'mystic', 
    label: 'The Mystic', 
    icon: <Zap size={18} />, 
    description: 'A visionary who speaks to the beyond.', 
    bonus: '+30 Awe, -20 Legitimacy' 
  },
  { 
    id: 'scholar', 
    label: 'The Scholar', 
    icon: <BookOpen size={18} />, 
    description: 'A deep thinker who knows the sacred texts.', 
    bonus: 'Start with 2 Theories, faster Purity gain' 
  },
  { 
    id: 'administrator', 
    label: 'The Administrator', 
    icon: <Crown size={18} />, 
    description: 'An organizer who builds lasting structures.', 
    bonus: 'Bureaucracy unlocked, +400 Resources' 
  },
];

export const WelcomeModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeType | null>(null);

  if (state.hasSeenWelcome) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center my-auto"
        >
          {step === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <Sparkles size={32} className="text-amber-500" />
              </div>

              <h2 className="text-3xl font-serif text-white mb-2">Welcome, Founder</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                You have been chosen to lead a new spiritual movement. Your goal is to grow from a humble "Circle of Seekers" into a global institution.
              </p>

              <div className="space-y-4 mb-8 text-left">
                 <div className="flex gap-3 items-start">
                    <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Maintain the Sacred</div>
                       <div className="text-[10px] text-slate-500">Balance Awe, Purity, and Cohesion. If any hit zero, your movement collapses.</div>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <Scale size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gain Legitimacy</div>
                       <div className="text-[10px] text-slate-500">To grow, you must convince the world you are a legitimate institution.</div>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <Users size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Evolve the Flock</div>
                       <div className="text-[10px] text-slate-500">Train disciples and build architecture to survive the test of time.</div>
                    </div>
                 </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
              >
                Choose Your Path
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <h2 className="text-2xl font-serif text-white mb-1">Founder Background</h2>
               <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest">Select your origin story</p>
               
               <div className="space-y-3 mb-8">
                  {ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        selectedArchetype === arch.id 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-100 shadow-glow-sm' 
                          : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`${selectedArchetype === arch.id ? 'text-amber-400' : 'text-slate-600'}`}>
                          {arch.icon}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider">{arch.label}</div>
                      </div>
                      <div className="text-[9px] opacity-70 mb-1">{arch.description}</div>
                      <div className="text-[8px] font-mono text-amber-500/80">{arch.bonus}</div>
                    </button>
                  ))}
               </div>

               <button
                disabled={!selectedArchetype}
                onClick={() => {
                  dispatch({ type: 'RESET_GAME', traits: [], archetype: selectedArchetype });
                  dispatch({ type: 'DISMISS_WELCOME' });
                }}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg disabled:opacity-50"
              >
                Manifest the Sanctuary
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
