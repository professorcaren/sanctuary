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
    description: 'A natural leader whose charismatic authority draws followers.',
    bonus: 'Slower Awe decay — effervescence comes naturally'
  },
  { 
    id: 'mystic', 
    label: 'The Mystic', 
    icon: <Zap size={18} />, 
    description: 'A visionary whose ecstatic experiences generate collective effervescence.',
    bonus: 'Slowest Awe decay — visions sustain collective energy'
  },
  { 
    id: 'scholar', 
    label: 'The Scholar', 
    icon: <BookOpen size={18} />, 
    description: 'A theologian who constructs the Sacred Canopy through doctrine.',
    bonus: 'Start with 2 Theories, faster Purity gain' 
  },
  { 
    id: 'administrator', 
    label: 'The Administrator', 
    icon: <Crown size={18} />, 
    description: 'An organizer who routinizes charisma into lasting institutions.',
    bonus: 'Bureaucracy unlocked, +2 Resources/tick'
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
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center my-auto"
        >
          {step === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Sparkles size={28} className="text-amber-500" />
              </div>

              <h2 className="text-3xl font-serif text-white mb-2">Who are you?</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                You are founding a new religious movement. Guide it from a small circle of seekers through the stages of institutional development — sect, congregation, megachurch.
              </p>

              <div className="space-y-3 mb-6 text-left">
                 <div className="flex gap-3 items-start">
                    <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sustain Collective Effervescence</div>
                       <div className="text-[10px] text-slate-500">Balance Awe, Purity, and Cohesion. If any hit zero, your movement collapses.</div>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <Scale size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Build Legitimacy</div>
                       <div className="text-[10px] text-slate-500">To evolve, you must reduce tension with the surrounding society.</div>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <Users size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                       <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Routinize Charisma</div>
                       <div className="text-[10px] text-slate-500">Socialize members, build hierarchy, and institutionalize to survive.</div>
                    </div>
                 </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <h2 className="text-2xl font-serif text-white mb-4">How did your movement begin?</h2>

               <div className="space-y-2 mb-6">
                  {ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all ${
                        selectedArchetype === arch.id
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-100 shadow-glow-sm'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-amber-500/30 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`${selectedArchetype === arch.id ? 'text-amber-400' : 'text-slate-400'}`}>
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
                className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg disabled:opacity-30 disabled:bg-slate-700"
              >
                Found the Movement
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
