import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimationFrame } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Trash2, Sparkles, AlertCircle, Clock, CheckCircle2, XCircle, Lock, Shield, Flame } from 'lucide-react';

// --- Shared Types & Data ---

interface Item {
  id: string;
  name: string;
  type: 'sacred' | 'profane' | 'liminal';
  category: 'food' | 'icon' | 'modern' | 'junk';
  icon: string;
  description: string;
  isCursed?: boolean;
}

const ALL_ITEMS: Item[] = [
  { id: '1', name: 'Old Boot', type: 'profane', category: 'junk', icon: '👢', description: 'Discarded waste.' },
  { id: '2', name: 'Scripture', type: 'sacred', category: 'icon', icon: '📖', description: 'The word made manifest.' },
  { id: '3', name: 'Wine', type: 'liminal', category: 'food', icon: '🍷', description: 'Sinful juice or holy blood?' },
  { id: '4', name: 'Tattered Robe', type: 'sacred', category: 'icon', icon: '👘', description: 'Worn by the founder.' },
  { id: '5', name: 'Wild Berries', type: 'liminal', category: 'food', icon: '🫐', description: 'Natures bounty.' },
  { id: '11', name: 'Dead Crow', type: 'profane', category: 'junk', icon: '🐦‍⬛', description: 'A dark omen.' },
  { id: '12', name: 'Altar Candle', type: 'sacred', category: 'icon', icon: '🕯️', description: 'Light for the way.' },
  { id: '13', name: 'Stone Idol', type: 'sacred', category: 'icon', icon: '🗿', description: 'An ancient face.' },
  { id: '14', name: 'Poison Ivy', type: 'profane', category: 'junk', icon: '🌿', description: 'Deceptive growth.' },
  { id: '15', name: 'Dry Bread', type: 'liminal', category: 'food', icon: '🍞', description: 'The humble meal.' },
  { id: '16', name: 'Human Skull', type: 'sacred', category: 'icon', icon: '💀', description: 'Memento mori.' },
  { id: '17', name: 'River Rock', type: 'profane', category: 'junk', icon: '🪨', description: 'Common earth.' },
  { id: '18', name: 'Sacred Oil', type: 'sacred', category: 'icon', icon: '🧪', description: 'For the anointing.' },
  { id: '6', name: 'Coffee Cup', type: 'liminal', category: 'modern', icon: '☕', description: 'Fuel for the faithful.' },
  { id: '7', name: 'Gold Coin', type: 'liminal', category: 'junk', icon: '💰', description: 'Mammon or a gift?' },
  { id: '8', name: 'LED Screen', type: 'profane', category: 'modern', icon: '📺', description: 'The distraction of the world.' },
  { id: '9', name: 'Credit Card', type: 'profane', category: 'modern', icon: '💳', description: 'A trap of debt.' },
  { id: '10', name: 'Electric Guitar', type: 'liminal', category: 'modern', icon: '🎸', description: 'Used for praise or vanity?' },
  { id: '19', name: 'Smartphone', type: 'profane', category: 'modern', icon: '📱', description: 'The digital tether.' },
  { id: '20', name: 'Megaphone', type: 'liminal', category: 'modern', icon: '📢', description: 'To spread the word.' },
  { id: '21', name: 'Plastic Bag', type: 'profane', category: 'junk', icon: '🛍️', description: 'Eternal waste.' },
  { id: '22', name: 'Sports Car', type: 'profane', category: 'modern', icon: '🏎️', description: 'The pride of life.' },
  { id: '23', name: 'Glazed Donut', type: 'liminal', category: 'food', icon: '🍩', description: 'The sweet temptation.' },
  { id: '24', name: 'Designer Watch', type: 'profane', category: 'modern', icon: '⌚', description: 'Counting secular time.' },
  { id: '25', name: 'Microchip', type: 'liminal', category: 'modern', icon: '💾', description: 'Cold knowledge.' },
  { id: '26', name: 'Flower Bouquet', type: 'sacred', category: 'icon', icon: '💐', description: 'Beauty for the altar.' },
];

interface Law {
  id: string;
  title: string;
  description: string;
  check: (item: Item) => 'sacred' | 'profane' | null;
}

const LAWS: Law[] = [
  { id: 'fast', title: 'The Great Fast', description: 'All Food and Drink is now Profane.', check: (i) => i.category === 'food' ? 'profane' : null },
  { id: 'modernity', title: 'The Luddite Law', description: 'All Modern objects are Profane.', check: (i) => i.category === 'modern' ? 'profane' : null },
  { id: 'celebration', title: 'The Feast', description: 'All Food is now Sacred.', check: (i) => i.category === 'food' ? 'sacred' : null },
  { id: 'iconoclasm', title: 'Iconoclasm', description: 'Symbols are vanity. Icons are Profane.', check: (i) => i.category === 'icon' ? 'profane' : null },
];

const ITEMS_PER_SESSION = 10;

type SortingMode = 'classify' | 'boundary' | 'consecrate';

interface SortingOption {
  id: string;
  name: string;
  mode: SortingMode;
  effect: string;
  icon: React.ReactNode;
  minStage: 'movement' | 'sect' | 'congregation';
}

const STAGE_ORDER = ['movement', 'cult', 'sect', 'congregation', 'megachurch'] as const;

function stageAtLeast(current: string, required: string): boolean {
  return STAGE_ORDER.indexOf(current as typeof STAGE_ORDER[number]) >= STAGE_ORDER.indexOf(required as typeof STAGE_ORDER[number]);
}

const SORTING_OPTIONS: SortingOption[] = [
  { id: 'classify', name: 'Classification', mode: 'classify', effect: 'Maintains Purity', icon: <Sparkles size={20} />, minStage: 'movement' },
  { id: 'boundary', name: 'Boundary Maintenance', mode: 'boundary', effect: 'Defends Purity', icon: <Shield size={20} />, minStage: 'sect' },
  { id: 'consecrate', name: 'Consecration', mode: 'consecrate', effect: 'Transforms the Liminal', icon: <Flame size={20} />, minStage: 'congregation' },
];

function stageName(s: string): string {
  if (s === 'sect') return 'Sect/Cult';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Shared getItemType ---

function getItemType(item: Item, activeLaws: Law[], stage: string): 'sacred' | 'profane' {
  for (const law of activeLaws) {
    const lawResult = law.check(item);
    if (lawResult) return lawResult;
  }
  if (item.type !== 'liminal') return item.type;
  return (stage === 'movement' || stage === 'cult' || stage === 'sect') ? 'profane' : 'sacred';
}

// --- Parent Orchestrator ---

export const SortingGame: React.FC = () => {
  const { state } = useGame();
  const [phase, setPhase] = useState<'prep' | 'action' | 'result'>('prep');
  const [selectedMode, setSelectedMode] = useState<SortingMode | null>(null);
  const [activeLaws, setActiveLaws] = useState<Law[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(ITEMS_PER_SESSION);

  // Generate laws in prep phase
  useEffect(() => {
    if (phase === 'prep') {
      const newLaws: Law[] = [];
      if (Math.random() < 0.5) {
        newLaws.push(LAWS[Math.floor(Math.random() * LAWS.length)]);
        if (Math.random() < 0.3) {
          const secondLaw = LAWS[Math.floor(Math.random() * LAWS.length)];
          if (secondLaw.id !== newLaws[0].id) newLaws.push(secondLaw);
        }
      }
      setActiveLaws(newLaws);
    }
  }, [phase]);

  const handleModeSelect = (mode: SortingMode) => {
    setSelectedMode(mode);
    setSessionScore(0);
    setPhase('action');
  };

  const handleComplete = (score: number, total: number) => {
    setSessionScore(score);
    setSessionTotal(total);
    setPhase('result');
  };

  const modeLabel = selectedMode === 'classify' ? 'Classification' : selectedMode === 'boundary' ? 'Boundary Maintenance' : 'Consecration';

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black" />

      <AnimatePresence mode="wait">
        {phase === 'prep' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full flex flex-col items-center justify-start pt-8 p-4 z-10 overflow-y-auto"
          >
            <div className="text-center mb-4">
              <h2 className="text-3xl font-serif text-amber-100">Sacred Sorting</h2>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Maintain the boundary</p>
            </div>

            <div className="w-full space-y-3 max-w-sm">
              {SORTING_OPTIONS.map((option) => {
                const unlocked = stageAtLeast(state.stage, option.minStage);
                return (
                  <button
                    key={option.id}
                    onClick={() => unlocked && handleModeSelect(option.mode)}
                    disabled={!unlocked}
                    className={`w-full p-3 rounded-2xl text-left transition-all group relative overflow-hidden ${
                      unlocked
                        ? 'bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800'
                        : 'bg-slate-900/20 border border-slate-800/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                      <div className={`p-2 rounded-lg ${unlocked ? 'bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform' : 'bg-slate-800/50 text-slate-600'}`}>
                        {unlocked ? option.icon : <Lock size={20} />}
                      </div>
                      <div>
                        <div className={`font-bold ${unlocked ? 'text-slate-100' : 'text-slate-600'}`}>{option.name}</div>
                        <div className={`text-[10px] uppercase tracking-widest ${unlocked ? 'text-amber-500' : 'text-slate-700'}`}>
                          {unlocked ? option.effect : `Unlocks at ${stageName(option.minStage)}`}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeLaws.length > 0 && (
              <div className="w-full max-w-sm mt-4 space-y-2">
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2">Active Decrees</div>
                {activeLaws.map(law => (
                  <div key={law.id} className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl text-left">
                    <div className="text-xs font-bold text-amber-200">{law.title}</div>
                    <div className="text-[10px] text-slate-400">{law.description}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {phase === 'action' && selectedMode && (
          <motion.div
            key="action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full z-10"
          >
            {selectedMode === 'classify' && (
              <ClassifyGame
                onComplete={handleComplete}
                activeLaws={activeLaws}
                stage={state.stage}
              />
            )}
            {selectedMode === 'boundary' && (
              <BoundaryGame
                onComplete={handleComplete}
                activeLaws={activeLaws}
                stage={state.stage}
              />
            )}
            {selectedMode === 'consecrate' && (
              <ConsecrateGame
                onComplete={handleComplete}
                activeLaws={activeLaws}
                stage={state.stage}
              />
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full flex flex-col items-center justify-center p-8 z-10"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl w-full max-w-xs text-center">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-white mb-2">{modeLabel} Complete</h2>
              <div className="text-4xl font-black text-amber-500 mb-2">{sessionScore} / {sessionTotal}</div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-8">Items Correctly Sorted</p>

              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedMode(null); setPhase('action'); handleModeSelect(selectedMode!); }}
                  className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => { setPhase('prep'); setSelectedMode(null); }}
                  className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Choose Mode
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Mode 1: ClassifyGame (extracted existing mechanic) ---

interface MiniGameProps {
  onComplete: (score: number, total: number) => void;
  activeLaws: Law[];
  stage: string;
}

const ClassifyGame: React.FC<MiniGameProps> = ({ onComplete, activeLaws, stage }) => {
  const { dispatch } = useGame();
  const [cards, setCards] = useState<Item[]>([]);
  const [result, setResult] = useState<{ type: 'correct' | 'wrong'; label: string } | null>(null);
  const [combo, setCombo] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    const filtered = ALL_ITEMS.filter(item => {
      if (stage === 'movement') return item.category !== 'modern' && item.type !== 'liminal';
      if (stage === 'sect' || stage === 'cult') return item.category !== 'modern';
      return true;
    });

    // Shuffle and slice to avoid duplicates within a session
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const sessionCards = shuffled.slice(0, ITEMS_PER_SESSION).map(base => ({
      ...base, id: Math.random().toString(), isCursed: Math.random() < 0.15
    }));

    setCards(sessionCards);
    setCombo(0);
    setSessionScore(0);
    scoreRef.current = 0;
  }, [stage]);

  const activeCard = cards[0];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard) return;

    const targetType = getItemType(activeCard, activeLaws, stage);
    const isCorrect = (direction === 'right' && targetType === 'sacred') ||
                      (direction === 'left' && targetType === 'profane');

    if (isCorrect) {
      setResult({ type: 'correct', label: targetType.toUpperCase() });
      setCombo(prev => prev + 1);
      scoreRef.current += 1;
      setSessionScore(s => s + 1);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 3 });
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 1 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'sacred_profane' });
    } else {
      setResult({ type: 'wrong', label: '' });
      setCombo(0);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -10 });
    }

    setTimeout(() => {
      setResult(null);
      setCards(prev => {
        const next = prev.slice(1);
        if (next.length === 0) onComplete(scoreRef.current + (isCorrect ? 0 : 0), ITEMS_PER_SESSION);
        return next;
      });
    }, 400);
  };

  const handleCurseExplode = () => {
    setResult({ type: 'wrong', label: '' });
    setCombo(0);
    dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -15 });
    setCards(prev => {
      const next = prev.slice(1);
      if (next.length === 0) onComplete(scoreRef.current, ITEMS_PER_SESSION);
      return next;
    });
    setTimeout(() => setResult(null), 500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="mb-4 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Classification</h2>
        <div className="flex justify-center gap-4 mt-1">
          <div className="text-[10px] text-slate-500 font-mono">Progress: {ITEMS_PER_SESSION - cards.length} / {ITEMS_PER_SESSION}</div>
          <div className="text-[10px] text-amber-500 font-mono">Chain: x{combo}</div>
        </div>
      </div>

      <div className="relative w-full max-w-[256px] h-72 flex items-center justify-center">
        <div className="absolute left-0 -translate-x-10 text-red-900/40 flex flex-col items-center"><Trash2 size={48} /></div>
        <div className="absolute right-0 translate-x-10 text-amber-900/40 flex flex-col items-center"><Sparkles size={48} /></div>

        <AnimatePresence>
          {cards.length > 0 && (
            <Card key={activeCard.id} item={activeCard} onSwipe={handleSwipe} onExplode={handleCurseExplode} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              key={result.type + result.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.3, y: -20 }}
              transition={{ exit: { duration: 0.3 } }}
              className={`absolute z-50 flex flex-col items-center gap-2 ${result.type === 'correct' ? 'text-amber-400' : 'text-red-600'}`}
            >
              {result.type === 'correct' && (
                <div className="text-5xl font-black italic text-center uppercase tracking-tighter">{result.label}</div>
              )}
              {result.type === 'correct' ? <CheckCircle2 size={64} /> : <XCircle size={80} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeCard && !result && (
        <div className="flex gap-8 mt-6 mb-4 z-10">
          <button
            onClick={() => handleSwipe('left')}
            className="px-4 py-2 bg-red-900/30 border border-red-800/50 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-900/50 transition-colors"
          >
            ← Profane
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="px-4 py-2 bg-amber-900/30 border border-amber-800/50 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-900/50 transition-colors"
          >
            Sacred →
          </button>
        </div>
      )}
    </div>
  );
};

// --- Card Component (used by ClassifyGame and ConsecrateGame) ---

const Card: React.FC<{ item: Item; onSwipe: (dir: 'left' | 'right') => void; onExplode: () => void }> = ({ item, onSwipe, onExplode }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const backgroundColor = useTransform(x, [-150, 0, 150], ['#450a0a', '#0f172a', '#451a03']);
  const timeRef = useRef(2.5);
  const [timeLeft, setTimeLeft] = useState(2.5);

  useEffect(() => {
    if (!item.isCursed) return;
    const timer = setInterval(() => {
      timeRef.current -= 0.1;
      if (timeRef.current <= 0.1) {
        clearInterval(timer);
        onExplode();
        return;
      }
      setTimeLeft(timeRef.current);
    }, 100);
    return () => clearInterval(timer);
  }, [item]);

  return (
    <motion.div
      style={{ x, rotate, backgroundColor }}
      drag="x" dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={(_, info) => { if (info.offset.x > 100) onSwipe('right'); else if (info.offset.x < -100) onSwipe('left'); }}
      animate={item.isCursed ? { x: [0, -2, 2, -2, 0], transition: { repeat: Infinity, duration: 0.1 } } : {}}
      className={`absolute w-full max-w-[256px] h-64 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden ${item.isCursed ? 'border-red-600' : 'border-slate-800'}`}
    >
      {item.isCursed && (
        <div className="absolute top-4 flex items-center gap-1 text-red-500 animate-pulse">
          <Clock size={14} />
          <span className="font-mono text-xs font-bold">{timeLeft.toFixed(1)}s</span>
        </div>
      )}
      <div className="text-7xl mb-6">{item.icon}</div>
      <h3 className="text-xl font-bold text-slate-100">{item.name}</h3>
      <p className="text-[10px] text-slate-500 mt-2 px-6 text-center italic">{item.description}</p>
    </motion.div>
  );
};

// --- Mode 2: BoundaryGame (defense mode) ---

interface DriftingItem {
  id: string;
  item: Item;
  resolvedType: 'sacred' | 'profane';
  x: number;
  y: number;
  angle: number;
  speed: number;
  isResolved: boolean;
  resultFlash: 'correct' | 'wrong' | null;
}

const BOUNDARY_CONFIG: Record<string, { speed: number; maxSimultaneous: number; spawnInterval: number; totalItems: number }> = {
  sect:         { speed: 35, maxSimultaneous: 2, spawnInterval: 2500, totalItems: 12 },
  cult:         { speed: 35, maxSimultaneous: 2, spawnInterval: 2500, totalItems: 12 },
  congregation: { speed: 50, maxSimultaneous: 3, spawnInterval: 2000, totalItems: 15 },
  megachurch:   { speed: 65, maxSimultaneous: 4, spawnInterval: 1500, totalItems: 15 },
};

const SANCTUARY_RADIUS = 50;
const SPAWN_RADIUS = 160;
const ARENA_SIZE = 360;

const BoundaryGame: React.FC<MiniGameProps> = ({ onComplete, activeLaws, stage }) => {
  const { dispatch } = useGame();
  const config = BOUNDARY_CONFIG[stage] || BOUNDARY_CONFIG.sect;

  const [driftingItems, setDriftingItems] = useState<DriftingItem[]>([]);
  const [score, setScore] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [sanctuaryFlash, setSanctuaryFlash] = useState<'correct' | 'wrong' | null>(null);
  const [gameActive, setGameActive] = useState(true);

  const scoreRef = useRef(0);
  const spawnedRef = useRef(0);
  const resolvedCountRef = useRef(0);
  const driftingRef = useRef<DriftingItem[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const gameActiveRef = useRef(true);
  const recentSpawnIds = useRef<string[]>([]);

  const filteredItems = useRef(
    ALL_ITEMS.filter(item => {
      if (stage === 'movement') return item.category !== 'modern' && item.type !== 'liminal';
      if (stage === 'sect' || stage === 'cult') return item.category !== 'modern';
      return true;
    })
  );

  const spawnItem = useCallback(() => {
    if (spawnedRef.current >= config.totalItems) return;
    const activeCount = driftingRef.current.filter(d => !d.isResolved).length;
    if (activeCount >= config.maxSimultaneous) return;

    // Pick a base item, rerolling up to 3 times to avoid recent repeats
    let base = filteredItems.current[Math.floor(Math.random() * filteredItems.current.length)];
    for (let attempt = 0; attempt < 3; attempt++) {
      if (!recentSpawnIds.current.includes(base.id)) break;
      base = filteredItems.current[Math.floor(Math.random() * filteredItems.current.length)];
    }
    recentSpawnIds.current = [...recentSpawnIds.current.slice(-2), base.id];

    const angle = Math.random() * Math.PI * 2;
    const resolvedType = getItemType(base, activeLaws, stage);

    const newItem: DriftingItem = {
      id: Math.random().toString(),
      item: { ...base, id: Math.random().toString() },
      resolvedType,
      x: Math.cos(angle) * SPAWN_RADIUS,
      y: Math.sin(angle) * SPAWN_RADIUS,
      angle,
      speed: config.speed,
      isResolved: false,
      resultFlash: null,
    };

    driftingRef.current = [...driftingRef.current, newItem];
    spawnedRef.current += 1;
    setSpawned(spawnedRef.current);
    setDriftingItems([...driftingRef.current]);
  }, [activeLaws, config, stage]);

  // Animation loop
  useAnimationFrame((time) => {
    if (!gameActiveRef.current) return;
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      lastSpawnRef.current = time;
      return;
    }

    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Spawn check
    if (time - lastSpawnRef.current > config.spawnInterval) {
      lastSpawnRef.current = time;
      spawnItem();
    }

    // Update positions
    let changed = false;
    const updated = driftingRef.current.map(d => {
      if (d.isResolved) return d;

      const dist = Math.sqrt(d.x * d.x + d.y * d.y);
      if (dist < 1) return { ...d, isResolved: true };

      // Move toward center
      const dx = -d.x / dist;
      const dy = -d.y / dist;
      const newX = d.x + dx * d.speed * dt;
      const newY = d.y + dy * d.speed * dt;

      // Check if reached sanctuary
      const newDist = Math.sqrt(newX * newX + newY * newY);
      if (newDist <= SANCTUARY_RADIUS) {
        changed = true;
        resolvedCountRef.current += 1;
        if (d.resolvedType === 'sacred') {
          // Sacred reached sanctuary = correct absorption
          scoreRef.current += 1;
          setScore(scoreRef.current);
          dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 2 });
          dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 2 });
          dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: 1 });
          setSanctuaryFlash('correct');
          setTimeout(() => setSanctuaryFlash(null), 300);
        } else {
          // Profane reached sanctuary = pollution
          dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -12 });
          setSanctuaryFlash('wrong');
          setTimeout(() => setSanctuaryFlash(null), 400);
        }
        // Check end
        if (resolvedCountRef.current >= config.totalItems && spawnedRef.current >= config.totalItems) {
          gameActiveRef.current = false;
          setGameActive(false);
          setTimeout(() => onComplete(scoreRef.current, config.totalItems), 500);
        }
        return { ...d, x: newX, y: newY, isResolved: true, resultFlash: d.resolvedType === 'sacred' ? 'correct' as const : 'wrong' as const };
      }

      if (newX !== d.x || newY !== d.y) changed = true;
      return { ...d, x: newX, y: newY };
    });

    if (changed) {
      driftingRef.current = updated;
      setDriftingItems([...updated]);
    }
  });

  const handleTapItem = (id: string) => {
    const idx = driftingRef.current.findIndex(d => d.id === id);
    if (idx === -1 || driftingRef.current[idx].isResolved) return;

    const d = driftingRef.current[idx];
    resolvedCountRef.current += 1;

    if (d.resolvedType === 'profane') {
      // Tapping profane = repel (correct)
      scoreRef.current += 1;
      setScore(scoreRef.current);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 3 });
      dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: 1 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'purity_danger' });
      driftingRef.current[idx] = { ...d, isResolved: true, resultFlash: 'correct' };
    } else {
      // Tapping sacred = wrong (sacred should be left to reach sanctuary)
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -5 });
      driftingRef.current[idx] = { ...d, isResolved: true, resultFlash: 'wrong' };
    }

    setDriftingItems([...driftingRef.current]);

    if (resolvedCountRef.current >= config.totalItems && spawnedRef.current >= config.totalItems) {
      gameActiveRef.current = false;
      setGameActive(false);
      setTimeout(() => onComplete(scoreRef.current, config.totalItems), 500);
    }
  };

  const centerX = ARENA_SIZE / 2;
  const centerY = ARENA_SIZE / 2;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="mb-3 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Boundary Maintenance</h2>
        <div className="flex justify-center gap-4 mt-1">
          <div className="text-[10px] text-slate-500 font-mono">Defended: {score}</div>
          <div className="text-[10px] text-amber-500 font-mono">Spawned: {spawned} / {config.totalItems}</div>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Tap profane items to repel them. Let sacred items reach the sanctuary.</p>
      </div>

      <div className="relative" style={{ width: ARENA_SIZE, height: ARENA_SIZE }}>
        {/* Sanctuary circle */}
        <motion.div
          animate={{
            boxShadow: sanctuaryFlash === 'wrong'
              ? '0 0 40px rgba(239,68,68,0.6)'
              : sanctuaryFlash === 'correct'
              ? '0 0 40px rgba(251,191,36,0.6)'
              : '0 0 20px rgba(251,191,36,0.2)',
            borderColor: sanctuaryFlash === 'wrong' ? '#ef4444' : '#f59e0b',
          }}
          transition={{ duration: 0.2 }}
          className="absolute rounded-full border-2 border-amber-500/50 bg-amber-500/10"
          style={{
            width: SANCTUARY_RADIUS * 2,
            height: SANCTUARY_RADIUS * 2,
            left: centerX - SANCTUARY_RADIUS,
            top: centerY - SANCTUARY_RADIUS,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full rounded-full flex items-center justify-center"
          >
            <Sparkles size={24} className="text-amber-500/60" />
          </motion.div>
        </motion.div>

        {/* Drifting items */}
        <AnimatePresence>
          {driftingItems.filter(d => !d.isResolved).map(d => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ exit: { duration: 0.2 } }}
              onPointerDown={() => handleTapItem(d.id)}
              className="absolute flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-slate-900/80 border border-slate-700 shadow-lg touch-none cursor-pointer active:scale-90 transition-transform"
              style={{
                left: centerX + d.x - 28,
                top: centerY + d.y - 28,
              }}
            >
              <span className="text-2xl leading-none">{d.item.icon}</span>
              <span className="text-[8px] text-slate-400 truncate max-w-[48px]">{d.item.name}</span>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Resolved flashes */}
        <AnimatePresence>
          {driftingItems.filter(d => d.isResolved && d.resultFlash).map(d => (
            <motion.div
              key={d.id + '-flash'}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute w-14 h-14 rounded-xl flex items-center justify-center pointer-events-none ${d.resultFlash === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'}`}
              style={{
                left: centerX + d.x - 28,
                top: centerY + d.y - 28,
              }}
            >
              {d.resultFlash === 'correct' ? <CheckCircle2 size={24} className="text-green-400" /> : <XCircle size={24} className="text-red-400" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Mode 3: ConsecrateGame (transformation mode) ---

interface ConsecrateItem extends Item {
  forcedType: 'sacred' | 'profane' | 'liminal';
}

const CONSECRATE_CONFIG: Record<string, { tapsRequired: number; timeLimit: number; liminalCount: number }> = {
  congregation: { tapsRequired: 8, timeLimit: 5, liminalCount: 5 },
  megachurch:   { tapsRequired: 12, timeLimit: 4, liminalCount: 6 },
};

const ConsecrateGame: React.FC<MiniGameProps> = ({ onComplete, activeLaws, stage }) => {
  const { dispatch } = useGame();
  const config = CONSECRATE_CONFIG[stage] || CONSECRATE_CONFIG.congregation;

  const [cards, setCards] = useState<ConsecrateItem[]>([]);
  const [consecrationProgress, setConsecrationProgress] = useState(0);
  const [isConsecrated, setIsConsecrated] = useState(false);
  const [timerProgress, setTimerProgress] = useState(1);
  const [result, setResult] = useState<{ type: 'correct' | 'wrong'; label: string } | null>(null);
  const [score, setScore] = useState(0);

  const scoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(config.timeLimit);

  // Generate cards
  useEffect(() => {
    const liminalItems = [...ALL_ITEMS.filter(i => i.type === 'liminal')];
    const nonLiminalItems = [...ALL_ITEMS.filter(i => i.type !== 'liminal')];

    // Shuffle each pool to avoid duplicates
    for (let i = liminalItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [liminalItems[i], liminalItems[j]] = [liminalItems[j], liminalItems[i]];
    }
    for (let i = nonLiminalItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonLiminalItems[i], nonLiminalItems[j]] = [nonLiminalItems[j], nonLiminalItems[i]];
    }

    const sessionCards: ConsecrateItem[] = [];

    // Add liminal items (no repeats up to pool size)
    for (let i = 0; i < config.liminalCount; i++) {
      const base = liminalItems[i % liminalItems.length];
      sessionCards.push({ ...base, id: Math.random().toString(), forcedType: 'liminal' });
    }

    // Add non-liminal items (no repeats up to pool size)
    const remaining = ITEMS_PER_SESSION - config.liminalCount;
    for (let i = 0; i < remaining; i++) {
      const base = nonLiminalItems[i % nonLiminalItems.length];
      sessionCards.push({ ...base, id: Math.random().toString(), forcedType: base.type as 'sacred' | 'profane' });
    }

    // Shuffle combined deck
    for (let i = sessionCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sessionCards[i], sessionCards[j]] = [sessionCards[j], sessionCards[i]];
    }

    setCards(sessionCards);
    setScore(0);
    scoreRef.current = 0;
  }, [config.liminalCount, stage]);

  const activeCard = cards[0];
  const isLiminal = activeCard?.forcedType === 'liminal';

  // Start timer for liminal items
  useEffect(() => {
    if (!activeCard || !isLiminal || isConsecrated) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timeLeftRef.current = config.timeLimit;
    setTimerProgress(1);
    setConsecrationProgress(0);
    setIsConsecrated(false);

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 0.05;
      const progress = Math.max(0, timeLeftRef.current / config.timeLimit);
      setTimerProgress(progress);

      if (timeLeftRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Time ran out — card becomes sortable but unconsecrated
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCard?.id, isLiminal, isConsecrated, config.timeLimit]);

  const handleConsecrateTap = () => {
    if (!activeCard || !isLiminal || isConsecrated) return;
    if (timerProgress <= 0) return; // Time's up

    const next = consecrationProgress + 1;
    setConsecrationProgress(next);

    if (next >= config.tapsRequired) {
      setIsConsecrated(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const canSwipe = !isLiminal || isConsecrated || timerProgress <= 0;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard || !canSwipe) return;

    const targetType = getItemType(activeCard, activeLaws, stage);
    const isCorrect = (direction === 'right' && targetType === 'sacred') ||
                      (direction === 'left' && targetType === 'profane');

    if (isLiminal && isConsecrated && isCorrect) {
      // Consecrated + sorted correctly
      scoreRef.current += 1;
      setScore(s => s + 1);
      setResult({ type: 'correct', label: 'CONSECRATED' });
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 5 });
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 3 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'consecration' });
    } else if (isLiminal && !isConsecrated && direction === 'left') {
      // Liminal sorted left without consecration (safe but weak)
      scoreRef.current += 1;
      setScore(s => s + 1);
      setResult({ type: 'correct', label: 'PROFANE' });
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 1 });
    } else if (!isLiminal && isCorrect) {
      // Non-liminal sorted correctly
      scoreRef.current += 1;
      setScore(s => s + 1);
      setResult({ type: 'correct', label: targetType.toUpperCase() });
      if (targetType === 'sacred') {
        dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 3 });
        dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 1 });
      } else {
        dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 2 });
      }
    } else {
      // Wrong sort
      setResult({ type: 'wrong', label: '' });
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -10 });
    }

    setTimeout(() => {
      setResult(null);
      setConsecrationProgress(0);
      setIsConsecrated(false);
      setTimerProgress(1);
      setCards(prev => {
        const next = prev.slice(1);
        if (next.length === 0) {
          onComplete(scoreRef.current, ITEMS_PER_SESSION);
        }
        return next;
      });
    }, 400);
  };

  if (!activeCard) return null;

  const progressPct = isLiminal ? Math.min(1, consecrationProgress / config.tapsRequired) : 0;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="mb-4 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Consecration</h2>
        <div className="flex justify-center gap-4 mt-1">
          <div className="text-[10px] text-slate-500 font-mono">Progress: {ITEMS_PER_SESSION - cards.length} / {ITEMS_PER_SESSION}</div>
          <div className="text-[10px] text-amber-500 font-mono">Score: {score}</div>
        </div>
      </div>

      <div className="relative w-full max-w-[256px] h-72 flex items-center justify-center">
        {/* SVG progress ring for liminal items */}
        {isLiminal && !canSwipe && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="4" />
            {/* Progress ring */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPct)}
              transform="rotate(-90 60 60)"
              className="transition-all duration-100"
            />
          </svg>
        )}

        {/* Consecration glow when complete */}
        <AnimatePresence>
          {isConsecrated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* The card area */}
        {canSwipe ? (
          <>
            <div className="absolute left-0 -translate-x-10 text-red-900/40 flex flex-col items-center z-0"><Trash2 size={48} /></div>
            <div className="absolute right-0 translate-x-10 text-amber-900/40 flex flex-col items-center z-0"><Sparkles size={48} /></div>
            <ConsecrateCard
              key={activeCard.id + '-swipe'}
              item={activeCard}
              onSwipe={handleSwipe}
              isConsecrated={isConsecrated}
            />
          </>
        ) : (
          <motion.button
            key={activeCard.id + '-tap'}
            onPointerDown={handleConsecrateTap}
            whileTap={{ scale: 0.95 }}
            className={`absolute w-full max-w-[256px] h-64 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center touch-none overflow-hidden cursor-pointer ${
              isConsecrated ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900/60'
            }`}
            style={{ filter: isConsecrated ? 'none' : 'saturate(0.4) brightness(0.7)' }}
          >
            <div className="text-7xl mb-4">{activeCard.icon}</div>
            <h3 className="text-xl font-bold text-slate-100">{activeCard.name}</h3>
            <p className="text-[10px] text-slate-500 mt-2 px-6 text-center italic">{activeCard.description}</p>
            <div className="mt-3 text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
              Tap to Consecrate ({consecrationProgress}/{config.tapsRequired})
            </div>
          </motion.button>
        )}

        {/* Result flash */}
        <AnimatePresence>
          {result && (
            <motion.div
              key={result.type + result.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.3, y: -20 }}
              transition={{ exit: { duration: 0.3 } }}
              className={`absolute z-50 flex flex-col items-center gap-2 ${result.type === 'correct' ? 'text-amber-400' : 'text-red-600'}`}
            >
              {result.type === 'correct' && (
                <div className="text-4xl font-black italic text-center uppercase tracking-tighter">{result.label}</div>
              )}
              {result.type === 'correct' ? <CheckCircle2 size={64} /> : <XCircle size={80} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer bar for liminal items */}
      {isLiminal && !isConsecrated && timerProgress > 0 && (
        <div className="w-full max-w-[256px] h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-500"
            animate={{ width: `${timerProgress * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}

      {/* Swipe buttons (only when card is sortable) */}
      {canSwipe && !result && (
        <div className="flex gap-8 mt-6 mb-4 z-10">
          <button
            onClick={() => handleSwipe('left')}
            className="px-4 py-2 bg-red-900/30 border border-red-800/50 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-900/50 transition-colors"
          >
            ← Profane
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="px-4 py-2 bg-amber-900/30 border border-amber-800/50 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-900/50 transition-colors"
          >
            Sacred →
          </button>
        </div>
      )}
    </div>
  );
};

// Swipeable card for ConsecrateGame (no cursed timer)
const ConsecrateCard: React.FC<{ item: Item; onSwipe: (dir: 'left' | 'right') => void; isConsecrated: boolean }> = ({ item, onSwipe, isConsecrated }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const backgroundColor = useTransform(x, [-150, 0, 150], ['#450a0a', isConsecrated ? '#451a03' : '#0f172a', '#451a03']);

  return (
    <motion.div
      style={{ x, rotate, backgroundColor }}
      drag="x" dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={(_, info) => { if (info.offset.x > 100) onSwipe('right'); else if (info.offset.x < -100) onSwipe('left'); }}
      className={`absolute w-full max-w-[256px] h-64 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden ${
        isConsecrated ? 'border-amber-500' : 'border-slate-800'
      }`}
    >
      {isConsecrated && (
        <div className="absolute top-4 flex items-center gap-1 text-amber-500">
          <Flame size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Consecrated</span>
        </div>
      )}
      <div className="text-7xl mb-6">{item.icon}</div>
      <h3 className="text-xl font-bold text-slate-100">{item.name}</h3>
      <p className="text-[10px] text-slate-500 mt-2 px-6 text-center italic">{item.description}</p>
    </motion.div>
  );
};
