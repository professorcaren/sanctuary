import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimationFrame } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Zap, Users, Shield, Sparkles, Moon, Fingerprint, CheckCircle2, XCircle } from 'lucide-react';

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
    name: 'Chant',
    icon: <Users size={20} />,
    theory: 'Synchronized behavior creates shared emotional states.',
    effect: 'Increases Cohesion',
    meter: 'cohesion',
    bonus: 10,
    mode: 'sequence'
  },
  {
    id: 'meditation',
    name: 'Meditate',
    icon: <Moon size={20} />,
    theory: 'Asceticism and silence mark the boundary of the sacred.',
    effect: 'Increases Purity',
    meter: 'purity',
    bonus: 12,
    mode: 'focus'
  },
  {
    id: 'incense',
    name: 'Incense',
    icon: <Sparkles size={20} />,
    theory: 'Sensory overload marks the space as "Set Apart".',
    effect: 'Increases Awe',
    meter: 'awe',
    bonus: 15,
    mode: 'rhythm'
  }
];

export const RitualGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<'prep' | 'action' | 'result'>('prep');
  const [selectedOption, setSelectedOption] = useState<RitualOption | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastResult, setLastResult] = useState<boolean>(false);

  const isSacred = state.meters.awe > 80;
  const isExhausted = selectedOption ? (state.ritualCounts[selectedOption.id] || 0) > 2 : false;

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 400,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
      left: `${Math.random() * 100}%`,
    })),
  []);

  const handleComplete = (success: boolean) => {
    setLastResult(success);
    if (success && selectedOption) {
      if (isSacred) setIsFlashing(true);
      dispatch({ type: 'COMPLETE_RITUAL', ritualId: selectedOption.id, meter: selectedOption.meter, bonus: selectedOption.bonus });
      dispatch({ type: 'UNLOCK_THEORY', id: 'effervescence' });
      
      if (isSacred) {
        setTimeout(() => setIsFlashing(false), 1000);
      }
    }
    setPhase('result');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-y-auto">
      {/* Sacred Sorting Style Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black" />
      
      <AnimatePresence mode="wait">
        {phase === 'prep' && (
          <motion.div 
            key="prep"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full flex flex-col items-center justify-center p-4 z-10"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-serif text-amber-100">Sacred Ritual</h2>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Generate collective effervescence</p>
            </div>

            <div className="w-full space-y-3 max-w-sm">
              {RITUAL_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => { setSelectedOption(option); setPhase('action'); }}
                  className="w-full p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl text-left hover:border-amber-500/50 hover:bg-slate-800 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="flex items-center gap-4 mb-2 relative z-10">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">{option.name}</div>
                      <div className="text-[10px] text-amber-500 uppercase tracking-widest">{option.effect}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic relative z-10 leading-relaxed">"{option.theory}"</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'action' && (
          <motion.div 
            key="action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full flex flex-col items-center justify-center p-4 relative transition-colors duration-1000 ${isSacred ? 'bg-amber-950/10' : ''}`}
          >
            <AnimatePresence>
              {isFlashing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white pointer-events-none" />
              )}
            </AnimatePresence>

            {isSacred && (
              <div className="absolute inset-0 pointer-events-none">
                {particles.map((p, i) => (
                  <motion.div key={i} className="absolute w-1 h-1 bg-amber-400 rounded-full"
                    animate={{ y: [-20, -500], x: p.x, opacity: [0, 1, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                    style={{ left: p.left, bottom: '0%' }}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-12 text-center z-10">
              <h2 className={`text-2xl font-serif transition-colors ${isSacred ? 'text-amber-300' : 'text-amber-100'}`}>
                {selectedOption?.name}
              </h2>
              {isSacred && <p className="text-[8px] uppercase tracking-[0.4em] text-amber-500 mt-1 animate-pulse">Collective Effervescence</p>}
            </div>

            {selectedOption?.mode === 'rhythm' && <RhythmGame onComplete={handleComplete} isSacred={isSacred} />}
            {selectedOption?.mode === 'sequence' && <SequenceGame onComplete={handleComplete} isSacred={isSacred} />}
            {selectedOption?.mode === 'focus' && <BreathGame onComplete={handleComplete} isSacred={isSacred} />}
            
            <button
              onClick={() => setPhase('prep')}
              className="absolute bottom-4 text-[10px] text-slate-600 uppercase tracking-widest hover:text-slate-400 z-10 py-3 px-4"
            >
              Cancel Ritual
            </button>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center p-8 z-10"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl w-full max-w-xs text-center">
              {lastResult ? (
                <>
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-serif text-white mb-2">Ritual Complete</h2>
                  <p className="text-slate-400 text-sm mb-6">The group experiences collective effervescence.</p>
                  <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700">
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Rewards</div>
                     <div className="text-amber-400 font-bold">+{selectedOption?.bonus} {selectedOption?.meter}</div>
                     <div className="text-amber-500 font-bold">+5 Awe</div>
                     {isExhausted && (
                       <div className="text-[10px] text-red-400 uppercase tracking-widest mt-2 font-bold animate-pulse">Ritual Exhaustion: Effectiveness Reduced</div>
                     )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <XCircle size={48} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-serif text-white mb-2">Ritual Failed</h2>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">The collective focus was broken. Without synchrony, effervescence cannot emerge.</p>
                </>
              )}
              
              <button 
                onClick={() => { setPhase('prep'); setSelectedOption(null); }}
                className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- MINI GAMES --- */

const RhythmGame: React.FC<{ onComplete: (s: boolean) => void, isSacred?: boolean }> = ({ onComplete, isSacred }) => {
  const { state } = useGame();
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inZone, setInZone] = useState(false);
  const progress = useMotionValue(0);
  
  // Dynamic Window: Movement=0.25 (50% total), Megachurch=0.05 (10% total)
  const timingWindow = useMemo(() => {
    switch (state.stage) {
      case 'movement': return 0.25;
      case 'cult': return 0.15;
      case 'sect': return 0.15;
      case 'congregation': return 0.10;
      case 'megachurch': return 0.05;
      default: return 0.15;
    }
  }, [state.stage]);

  // Animation: Pulse hits the 'boundary' at 0.5 progress
  const scale = useTransform(progress, [0, 0.5, 1], [0.4, 1.1, 0.4]);
  const opacity = useTransform(progress, [0, 0.5, 1], [0.2, 1, 0.2]);
  
  // Fill logic: rises as we approach 0.5, capped at 100% when inZone
  const fillLevel = useTransform(progress, p => {
    const dist = Math.abs(p - 0.5);
    if (dist < timingWindow) return 0; // Fully filled (inset 0%)
    const normalizedDist = (dist - timingWindow) / (0.5 - timingWindow);
    return Math.min(100, Math.max(0, normalizedDist * 100));
  });

  const fillClipPath = useTransform(fillLevel, v => `inset(${v}% 0 0 0)`);

  const startTimeRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useAnimationFrame((time) => {
    if (!isActive) return;
    if (startTimeRef.current === null) startTimeRef.current = time;
    const currentProgress = ((time - startTimeRef.current) % 2000) / 2000;
    progress.set(currentProgress);
    
    // Visual feedback for 'the zone'
    const isHit = Math.abs(currentProgress - 0.5) < timingWindow;
    if (isHit !== inZone) setInZone(isHit);
  });

  const handleTap = () => {
    if (!isActive) { setIsActive(true); return; }
    
    const p = progress.get();
    const isHit = Math.abs(p - 0.5) < timingWindow;

    if (isHit) {
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      setCombo(c => {
        const next = c + 1;
        if (next >= 5) onComplete(true);
        return next;
      });
      setFeedback('PERFECT');
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
      setCombo(c => Math.max(0, c - 1));
      setFeedback('MISS');
    }
    setTimeout(() => setFeedback(null), 400);
  };

  return (
    <button className="w-full flex flex-col items-center gap-6 outline-none touch-none" onPointerDown={handleTap} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleTap(); } }}>
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-48 h-48 flex items-center justify-center"
      >
        {/* Stationary Target Ring */}
        <div className={`absolute inset-0 rounded-full border-4 transition-all duration-200 ${inZone ? 'border-amber-400 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'border-slate-800 scale-100 shadow-none'}`} />
        
        {/* The Pulsing Core */}
        {isActive && <motion.div className="absolute inset-0 rounded-full border-2 border-amber-300 bg-amber-500/20" style={{ scale, opacity }} />}
        
        <div className="relative z-10 flex flex-col items-center">
           <div className="relative">
              {/* Base Background Icon */}
              <Zap className="text-slate-800" size={64} />
              {/* Filling Overlay Icon */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 text-amber-400"
                  style={{ clipPath: fillClipPath }}
                >
                  <Zap size={64} style={{ filter: inZone ? 'drop-shadow(0 0 15px #f59e0b)' : 'none' }} />
                </motion.div>
              )}
           </div>
           {!isActive && <p className="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-2 animate-pulse">Tap to Begin</p>}
        </div>
      </motion.div>
      <div className="text-center h-12">
        <div className="text-3xl font-black text-amber-500 tracking-tighter">{combo} / 5</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">{feedback || (isActive ? 'Tap when full' : 'Prepare yourself')}</div>
      </div>
    </button>
  );
};

const SEQUENCE_ICONS = [
  { icon: <Users size={24} />, color: 'border-amber-800/30' },
  { icon: <Zap size={24} />, color: 'border-emerald-800/30' },
  { icon: <Shield size={24} />, color: 'border-blue-800/30' },
  { icon: <Moon size={24} />, color: 'border-purple-800/30' },
];

const SequenceGame: React.FC<{ onComplete: (s: boolean) => void, isSacred?: boolean }> = ({ onComplete, isSacred }) => {
  const { state } = useGame();
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const TOTAL_ROUNDS = useMemo(() => {
    switch (state.stage) {
      case 'movement': return 3;
      case 'cult': return 4;
      case 'sect': return 4;
      case 'congregation': return 5;
      case 'megachurch': return 5;
      default: return 4;
    }
  }, [state.stage]);

  useEffect(() => {
    generateSequence(round);
  }, [round]);

  const generateSequence = (r: number) => {
    const length = 1 + r; 
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setPlayerInput([]);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    await new Promise(r => setTimeout(r, 800));
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(seq[i]);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
      await new Promise(r => setTimeout(r, 500));
      setActiveIndex(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsPlaying(false);
  };

  const handleInput = (idx: number) => {
    if (isPlaying) return;
    
    setActiveIndex(idx);
    setTimeout(() => setActiveIndex(null), 150);

    const nextInput = [...playerInput, idx];
    setPlayerInput(nextInput);

    if (sequence[playerInput.length] !== idx) {
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
      onComplete(false);
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      if (nextInput.length === sequence.length) {
        if (round >= TOTAL_ROUNDS) {
          onComplete(true);
        } else {
          setTimeout(() => setRound(r => r + 1), 600);
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${round > i ? 'bg-amber-500' : 'bg-slate-800'}`} />
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(i => (
          <motion.button
            key={i}
            animate={{
              scale: activeIndex === i ? 1.1 : 1,
              backgroundColor: activeIndex === i ? '#f59e0b' : '#0f172a',
              borderColor: activeIndex === i ? '#fbbf24' : undefined
            }}
            onPointerDown={() => handleInput(i)}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-amber-500 active:scale-95 transition-transform touch-none shadow-xl ${activeIndex !== i ? SEQUENCE_ICONS[i].color : ''}`}
          >
            {SEQUENCE_ICONS[i].icon}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold h-4">
        {isPlaying ? 'Watch the Pattern' : 'Repeat the Pattern'}
      </p>
    </div>
  );
};

const BreathGame: React.FC<{ onComplete: (s: boolean) => void, isSacred?: boolean }> = ({ onComplete, isSacred }) => {
  const { state } = useGame();
  const [isActive, setIsActive] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [focus, setFocus] = useState(100);
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  const isHoldingRef = useRef(false);
  const focusRef = useRef(100);
  const breathCountRef = useRef(0);
  const phaseRef = useRef<'inhale' | 'exhale'>('inhale');
  const startTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const doneRef = useRef(false);

  const { totalBreaths, drainRate, recoverRate } = useMemo(() => {
    switch (state.stage) {
      case 'movement': return { totalBreaths: 4, drainRate: 0.3, recoverRate: 0.15 };
      case 'cult': return { totalBreaths: 5, drainRate: 0.5, recoverRate: 0.12 };
      case 'sect': return { totalBreaths: 5, drainRate: 0.5, recoverRate: 0.12 };
      case 'congregation': return { totalBreaths: 6, drainRate: 0.7, recoverRate: 0.08 };
      case 'megachurch': return { totalBreaths: 7, drainRate: 0.9, recoverRate: 0.05 };
      default: return { totalBreaths: 5, drainRate: 0.5, recoverRate: 0.12 };
    }
  }, [state.stage]);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { isHoldingRef.current = isHolding; }, [isHolding]);
  useEffect(() => { focusRef.current = focus; }, [focus]);
  useEffect(() => { breathCountRef.current = breathCount; }, [breathCount]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const CYCLE_MS = 4000; // 2s inhale + 2s exhale

  useAnimationFrame((time) => {
    if (!isActive || doneRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = time;

    const elapsed = time - startTimeRef.current;
    const cycleProgress = (elapsed % CYCLE_MS) / CYCLE_MS; // 0..1
    const currentPhase: 'inhale' | 'exhale' = cycleProgress < 0.5 ? 'inhale' : 'exhale';

    // Detect breath completion (transition from exhale back to inhale)
    if (phaseRef.current === 'exhale' && currentPhase === 'inhale') {
      const next = breathCountRef.current + 1;
      if (next >= totalBreaths) {
        doneRef.current = true;
        onCompleteRef.current(true);
        return;
      }
      setBreathCount(next);
    }

    setPhase(currentPhase);

    // Check sync: holding during inhale = good, releasing during exhale = good
    const inSync = (currentPhase === 'inhale' && isHoldingRef.current) ||
                   (currentPhase === 'exhale' && !isHoldingRef.current);

    if (inSync) {
      setFocus(prev => Math.min(100, prev + recoverRate));
    } else {
      setFocus(prev => {
        const next = prev - drainRate;
        if (next <= 0) {
          doneRef.current = true;
          onCompleteRef.current(false);
          return 0;
        }
        return next;
      });
    }
  });

  // Circle scale: 0.6 exhaled, 1.2 inhaled
  const circleScale = useMemo(() => {
    if (!isActive) return 0.6;
    return phase === 'inhale' ? 1.2 : 0.6;
  }, [isActive, phase]);

  const inSync = isActive && (
    (phase === 'inhale' && isHolding) || (phase === 'exhale' && !isHolding)
  );

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Focus bar */}
      <div className="w-full max-w-[200px]">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Focus</span>
          <span className="text-[10px] text-slate-500 font-bold">{Math.round(focus)}%</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${focus}%`,
              backgroundColor: focus > 50 ? '#f59e0b' : focus > 25 ? '#f97316' : '#ef4444',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Breathing circle */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow ring when in sync */}
        {isActive && inSync && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: circleScale, opacity: 0.3 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 40px rgba(251,191,36,0.5)' }}
          />
        )}
        {/* Main breathing circle */}
        <motion.div
          className={`absolute rounded-full border-2 ${inSync ? 'border-amber-400 bg-amber-500/20' : 'border-slate-700 bg-slate-800/30'}`}
          animate={{
            scale: circleScale,
            width: 160,
            height: 160,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ originX: 0.5, originY: 0.5 }}
        />

        {/* Phase label */}
        <div className="relative z-10 text-center">
          {!isActive ? (
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">Hold to Begin</p>
          ) : (
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-serif tracking-wide ${inSync ? 'text-amber-300' : 'text-slate-500'}`}
            >
              {phase === 'inhale' ? 'Inhale...' : 'Exhale...'}
            </motion.p>
          )}
        </div>
      </div>

      {/* Fingerprint hold button */}
      <motion.button
        onPointerDown={() => {
          setIsHolding(true);
          if (!isActive) setIsActive(true);
        }}
        onPointerUp={() => setIsHolding(false)}
        onPointerLeave={() => setIsHolding(false)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsHolding(true); if (!isActive) setIsActive(true); } }}
        onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') setIsHolding(false); }}
        animate={{
          scale: isHolding ? 0.9 : 1,
          backgroundColor: isHolding ? '#f59e0b' : '#0f172a',
          borderColor: isHolding ? '#fbbf24' : '#1e293b',
        }}
        className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center text-amber-500 shadow-2xl active:shadow-none relative overflow-hidden touch-none outline-none"
      >
        <Fingerprint size={48} />
        {isHolding && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 bg-amber-400 rounded-full"
          />
        )}
      </motion.button>

      {/* Breath counter */}
      <div className="text-center">
        <div className="text-3xl font-black text-amber-500 tracking-tighter">{breathCount} / {totalBreaths}</div>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Breaths</p>
      </div>
    </div>
  );
};
