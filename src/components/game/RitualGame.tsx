import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimationFrame } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Zap, Users, Shield, Sparkles, Moon, Fingerprint } from 'lucide-react';

type RitualMode = 'rhythm' | 'sequence' | 'focus';

interface RitualOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  theory: string;
  effect: string;
  meter: 'cohesion' | 'purity' | 'awe';
  bonus: number;
  mode: RitualMode;
}

const RITUAL_OPTIONS: RitualOption[] = [
  {
    id: 'chant',
    name: 'Communal Chant',
    icon: <Users size={20} />,
    theory: 'Synchronized behavior creates shared emotional states.',
    effect: 'Increases Cohesion',
    meter: 'cohesion',
    bonus: 10,
    mode: 'sequence'
  },
  {
    id: 'meditation',
    name: 'Quiet Meditation',
    icon: <Moon size={20} />,
    theory: 'Asceticism and silence mark the boundary of the sacred.',
    effect: 'Increases Purity',
    meter: 'purity',
    bonus: 12,
    mode: 'focus'
  },
  {
    id: 'incense',
    name: 'Sacred Incense',
    icon: <Sparkles size={20} />,
    theory: 'Sensory overload marks the space as "Set Apart".',
    effect: 'Increases Awe',
    meter: 'awe',
    bonus: 15,
    mode: 'rhythm'
  }
];

export const RitualGame: React.FC = () => {
  const { dispatch } = useGame();
  const [phase, setPhase] = useState<'prep' | 'action'>('prep');
  const [selectedOption, setSelectedOption] = useState<RitualOption | null>(null);

  const handleComplete = (success: boolean) => {
    if (success && selectedOption) {
      dispatch({ type: 'UPDATE_METER', meter: selectedOption.meter, value: selectedOption.bonus });
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 5 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'effervescence' });
    }
    setPhase('prep');
    setSelectedOption(null);
  };

  if (phase === 'prep') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif text-amber-100">Prepare the Ritual</h2>
          <p className="text-sm text-slate-500 mt-2">How shall we reach the divine today?</p>
        </div>

        <div className="w-full space-y-4">
          {RITUAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => { setSelectedOption(option); setPhase('action'); }}
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
              <p className="text-xs text-slate-500 italic">"{option.theory}"</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-8 text-center">
        <h2 className="text-xl font-serif text-amber-100">{selectedOption?.name}</h2>
      </div>

      {selectedOption?.mode === 'rhythm' && <RhythmGame onComplete={handleComplete} />}
      {selectedOption?.mode === 'sequence' && <SequenceGame onComplete={handleComplete} />}
      {selectedOption?.mode === 'focus' && <FocusGame onComplete={handleComplete} />}
      
      <button 
        onClick={() => setPhase('prep')}
        className="absolute bottom-10 text-[10px] text-slate-600 uppercase tracking-widest hover:text-slate-400"
      >
        Cancel Ritual
      </button>
    </div>
  );
};

/* --- MINI GAMES --- */

const RhythmGame: React.FC<{ onComplete: (s: boolean) => void }> = ({ onComplete }) => {
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 1], [0.2, 1.2]);
  const opacity = useTransform(progress, [0, 0.8, 1], [0, 1, 0]);
  const startTimeRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useAnimationFrame((time) => {
    if (!isActive) return;
    if (startTimeRef.current === null) startTimeRef.current = time;
    const currentProgress = ((time - startTimeRef.current) % 2000) / 2000;
    progress.set(currentProgress);
  });

  const handleTap = () => {
    if (!isActive) { setIsActive(true); return; }
    const diff = Math.abs(1 - progress.get());
    if (diff < 0.1) {
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      setCombo(c => {
        if (c + 1 >= 5) onComplete(true);
        return c + 1;
      });
      setFeedback('PERFECT');
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
      setCombo(0);
      setFeedback('MISS');
    }
    setTimeout(() => setFeedback(null), 400);
  };

  return (
    <div className="w-full flex flex-col items-center gap-12" onPointerDown={handleTap}>
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
        {isActive && <motion.div className="absolute inset-0 rounded-full border-2 border-amber-300 bg-amber-500/10" style={{ scale, opacity }} />}
        <Zap className={isActive ? "text-amber-400" : "text-slate-800"} size={48} />
      </div>
      <div className="text-center h-12">
        <div className="text-2xl font-black text-amber-500">{combo} / 5</div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">{feedback || 'Tap in Rhythm'}</div>
      </div>
    </div>
  );
};

const SequenceGame: React.FC<{ onComplete: (s: boolean) => void }> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const newSeq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    playSequence(newSeq);
  }, []);

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setActiveIndex(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsPlaying(false);
  };

  const handleInput = (idx: number) => {
    if (isPlaying) return;
    const nextInput = [...playerInput, idx];
    setPlayerInput(nextInput);
    if (sequence[playerInput.length] !== idx) {
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
      onComplete(false);
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      if (nextInput.length === sequence.length) {
        onComplete(true);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(i => (
          <motion.button
            key={i}
            animate={{ scale: activeIndex === i ? 1.1 : 1, backgroundColor: activeIndex === i ? '#f59e0b' : '#0f172a' }}
            onClick={() => handleInput(i)}
            className="w-20 h-20 rounded-2xl border-2 border-slate-800 flex items-center justify-center text-amber-500"
          >
            <Users size={24} />
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-widest">
        {isPlaying ? 'Watch the Pattern' : 'Repeat the Pattern'}
      </p>
    </div>
  );
};

const FocusGame: React.FC<{ onComplete: (s: boolean) => void }> = ({ onComplete }) => {
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [drift, setDrift] = useState(50);
  const requestRef = useRef<number | null>(null);

  const animate = () => {
    if (isHolding) {
      if (holdTime % 60 === 0 && window.navigator.vibrate) window.navigator.vibrate(10);
      setHoldTime(prev => {
        if (prev + 1 >= 300) { onComplete(true); return 300; }
        return prev + 1;
      });
      // Gently drift back to center when holding
      setDrift(prev => prev + (50 - prev) * 0.05);
    } else {
      // Drift away randomly when not holding
      setDrift(prev => prev + (Math.random() - 0.5) * 4);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isHolding]);

  // Fail if drift goes too far
  useEffect(() => {
    if (drift < 10 || drift > 90) onComplete(false);
  }, [drift]);

  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="w-full max-w-[200px] h-4 bg-slate-900 rounded-full relative overflow-hidden border border-slate-800">
        <motion.div 
          className="absolute top-0 bottom-0 w-4 bg-amber-500 shadow-[0_0_15px_#f59e0b]"
          style={{ left: `${drift}%` }}
        />
        <div className="absolute inset-0 flex justify-center"><div className="w-0.5 h-full bg-slate-700" /></div>
      </div>

      <motion.button
        onPointerDown={() => setIsHolding(true)}
        onPointerUp={() => setIsHolding(false)}
        onPointerLeave={() => setIsHolding(false)}
        animate={{ scale: isHolding ? 0.9 : 1, backgroundColor: isHolding ? '#f59e0b' : '#0f172a' }}
        className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center text-amber-500"
      >
        <Fingerprint size={48} />
      </motion.button>

      <div className="text-center">
        <div className="text-2xl font-black text-amber-500">{Math.floor((holdTime / 300) * 100)}%</div>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Hold to Center the Mind</p>
      </div>
    </div>
  );
};
