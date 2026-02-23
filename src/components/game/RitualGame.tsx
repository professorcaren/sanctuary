import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimationFrame } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Zap, Users, Shield, Sparkles } from 'lucide-react';

interface RitualOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  theory: string;
  effect: string;
  meter: 'cohesion' | 'purity' | 'awe';
  bonus: number;
}

const RITUAL_OPTIONS: RitualOption[] = [
  {
    id: 'chant',
    name: 'Communal Chant',
    icon: <Users size={20} />,
    theory: 'Synchronized behavior creates shared emotional states.',
    effect: 'Increases Cohesion',
    meter: 'cohesion',
    bonus: 10
  },
  {
    id: 'dress',
    name: 'Strict Dress Code',
    icon: <Shield size={20} />,
    theory: 'Uniformity erases individual identity for the collective.',
    effect: 'Increases Purity',
    meter: 'purity',
    bonus: 8
  },
  {
    id: 'incense',
    name: 'Sacred Incense',
    icon: <Sparkles size={20} />,
    theory: 'Sensory overload marks the space as "Set Apart".',
    effect: 'Increases Awe',
    meter: 'awe',
    bonus: 12
  }
];

export const RitualGame: React.FC = () => {
  const { dispatch } = useGame();
  const [phase, setPhase] = useState<'prep' | 'action'>('prep');
  const [selectedOption, setSelectedOption] = useState<RitualOption | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState<'perfect' | 'good' | 'miss' | null>(null);
  const [combo, setCombo] = useState(0);
  
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 1], [0.2, 1.2]);
  const opacity = useTransform(progress, [0, 0.8, 1], [0, 1, 0]);
  
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 2000; 

  useAnimationFrame((time) => {
    if (!isActive) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    const currentProgress = (elapsed % DURATION) / DURATION;
    progress.set(currentProgress);
  });

  const startRitual = (option: RitualOption) => {
    setSelectedOption(option);
    setPhase('action');
    // We don't start the motion yet, wait for first tap
  };

  const handleTap = () => {
    if (phase === 'prep') return;

    if (!isActive) {
      setIsActive(true);
      setCombo(0);
      startTimeRef.current = null;
      return;
    }

    const currentP = progress.get();
    const diff = Math.abs(1 - currentP);
    
    let result: 'perfect' | 'good' | 'miss' = 'miss';
    
    if (diff < 0.05) {
      result = 'perfect';
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 5 });
      if (selectedOption) {
        dispatch({ type: 'UPDATE_METER', meter: selectedOption.meter, value: selectedOption.bonus / 2 });
      }
      
      dispatch({ type: 'UNLOCK_THEORY', id: 'effervescence' });
      dispatch({ 
        type: 'SHOW_PROMPT', 
        prompt: { id: 'effervescence', text: 'The energy you feel is "Collective Effervescence" — the glue of society.', trigger: 'first_ritual' } 
      });
    } else if (diff < 0.15) {
      result = 'good';
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 2 });
    } else {
      result = 'miss';
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: -2 });
    }

    setFeedback(result);
    if (result === 'miss') {
      setCombo(0);
    } else {
      setCombo(c => c + 1);
      if (combo >= 5) { // Reward for sustained focus
         setPhase('prep'); // End ritual and return to prep
         setIsActive(false);
         if (selectedOption) {
            dispatch({ type: 'UPDATE_METER', meter: selectedOption.meter, value: selectedOption.bonus });
         }
      }
    }

    setTimeout(() => setFeedback(null), 500);
  };

  if (phase === 'prep') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-serif text-amber-100">Prepare the Ritual</h2>
          <p className="text-sm text-slate-500 mt-2">Choose the focus of today's gathering</p>
        </div>

        <div className="w-full space-y-4">
          {RITUAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => startRitual(option)}
              className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl text-left hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
                  {option.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-100">{option.name}</div>
                  <div className="text-[10px] text-amber-500 uppercase tracking-widest">{option.effect}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                "{option.theory}"
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden touch-none select-none" 
      onPointerDown={handleTap}
    >
      <div className="absolute top-8 text-center z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-amber-100">{selectedOption?.name}</h2>
        <p className="text-xs text-amber-500/60 mt-1">Tap 5 times in rhythm to complete</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]" />
        {isActive && (
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-amber-200 bg-amber-500/10"
            style={{ scale, opacity }}
          />
        )}
        <motion.div 
          className={`w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center shadow-lg z-20`}
          animate={{ scale: feedback ? 1.2 : 1 }}
        >
          <Zap className={isActive ? "text-white" : "text-amber-900"} />
        </motion.div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={Date.now()} 
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -50, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className={`absolute font-bold text-2xl z-30 ${
                feedback === 'perfect' ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 
                feedback === 'good' ? 'text-blue-300' : 'text-red-400'
              }`}
            >
              {feedback.toUpperCase()}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 text-center h-16 pointer-events-none">
        {isActive ? (
          <div className="text-amber-500 font-mono">
            <div className="text-4xl font-bold">{combo} / 5</div>
            <div className="text-xs uppercase tracking-widest opacity-50">Focus Level</div>
          </div>
        ) : (
          <div className="text-slate-500 animate-pulse">Tap anywhere to Pulse</div>
        )}
      </div>
    </div>
  );
};
