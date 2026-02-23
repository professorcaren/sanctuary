import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Trash2, Sparkles, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

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

export const SortingGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [cards, setCards] = useState<Item[]>([]);
  const [activeLaws, setActiveLaws] = useState<Law[]>([]);
  const [result, setResult] = useState<{ type: 'correct' | 'wrong', label: string } | null>(null);
  const [combo, setCombo] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<'start' | 'playing' | 'end'>('start');
  const [sessionScore, setSessionScore] = useState(0);

  const startSession = () => {
    const filtered = ALL_ITEMS.filter(item => {
      if (state.stage === 'movement') return item.category !== 'modern' && item.type !== 'liminal';
      if (state.stage === 'sect' || state.stage === 'cult') return item.category !== 'modern';
      return true;
    });

    const sessionCards = Array.from({ length: ITEMS_PER_SESSION }, () => {
      const base = filtered[Math.floor(Math.random() * filtered.length)];
      return {
        ...base,
        id: Math.random().toString(),
        isCursed: Math.random() < 0.15
      };
    });

    setCards(sessionCards);
    setCombo(0);
    setSessionScore(0);
    setSessionPhase('playing');
  };

  // Generate laws whenever we enter the 'start' phase
  useEffect(() => {
    if (sessionPhase === 'start') {
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
  }, [sessionPhase]);

  const activeCard = cards[0];

  const getItemType = (item: Item): 'sacred' | 'profane' => {
    // Check all active laws
    for (const law of activeLaws) {
      const lawResult = law.check(item);
      if (lawResult) return lawResult;
    }
    
    if (item.type !== 'liminal') return item.type;
    return (state.stage === 'movement' || state.stage === 'cult' || state.stage === 'sect') ? 'profane' : 'sacred';
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard || state.activeEvent) return;

    const targetType = getItemType(activeCard);
    const isCorrect = (direction === 'right' && targetType === 'sacred') || 
                      (direction === 'left' && targetType === 'profane');

    if (isCorrect) {
      setResult({ type: 'correct', label: targetType.toUpperCase() });
      setCombo(prev => prev + 1);
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
        if (next.length === 0) setSessionPhase('end');
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
        if (next.length === 0) setSessionPhase('end');
        return next;
    });
    setTimeout(() => setResult(null), 500);
  };

  if (sessionPhase === 'start') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
           <Sparkles size={40} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif text-amber-100 mb-4">Sacred Sorting</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The law is written in the stars, but it is practiced on the earth. Sort the items to maintain the group's purity.
        </p>

        {activeLaws.length > 0 && (
          <div className="w-full max-w-xs mb-8 space-y-2">
            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2">Active Decrees</div>
            {activeLaws.map(law => (
              <div key={law.id} className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl text-left">
                <div className="text-xs font-bold text-amber-200">{law.title}</div>
                <div className="text-[10px] text-slate-400">{law.description}</div>
              </div>
            ))}
          </div>
        )}

        {state.stage === 'sect' && activeLaws.length === 0 && (
          <p className="text-amber-500/70 text-xs mb-4 italic">
            "New objects have appeared... not all things are clearly sacred or profane."
          </p>
        )}
        <button
          onClick={startSession}
          className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-lg hover:bg-amber-500 transition-colors"
        >
          Begin Sorting
        </button>
      </div>
    );
  }

  if (sessionPhase === 'end') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-white mb-2">Sorting Complete</h2>
          <div className="text-4xl font-black text-amber-500 mb-2">{sessionScore} / {ITEMS_PER_SESSION}</div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-8">Items Correctly Classified</p>
          
          <div className="space-y-3">
            <button 
              onClick={startSession}
              className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors"
            >
              Start New Batch
            </button>
            <button 
              onClick={() => setSessionPhase('start')}
              className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Return to Sanctuary
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      
      <div className="mb-8 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Sacred Sorting</h2>
        <div className="flex justify-center gap-4 mt-1">
           <div className="text-[10px] text-slate-500 font-mono">Progress: {ITEMS_PER_SESSION - cards.length} / {ITEMS_PER_SESSION}</div>
           <div className="text-[10px] text-amber-500 font-mono">Chain: x{combo}</div>
        </div>
      </div>

      <div className="relative w-full max-w-[256px] h-96 flex items-center justify-center">
        <div className="absolute left-0 -translate-x-10 text-red-900/40 flex flex-col items-center"><Trash2 size={48} /></div>
        <div className="absolute right-0 translate-x-10 text-amber-900/40 flex flex-col items-center"><Sparkles size={48} /></div>

        <AnimatePresence>
          {cards.length > 0 && (
            <Card
              key={activeCard.id}
              item={activeCard}
              onSwipe={handleSwipe}
              onExplode={handleCurseExplode}
            />
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
                <div className="text-5xl font-black italic text-center uppercase tracking-tighter">
                  {result.label}
                </div>
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

const Card: React.FC<{ item: Item; onSwipe: (dir: 'left' | 'right') => void, onExplode: () => void }> = ({ item, onSwipe, onExplode }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
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
      style={{ x, rotate, backgroundColor: useTransform(x, [-150, 0, 150], ['#450a0a', '#0f172a', '#451a03']) }}
      drag="x" dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={(_, info) => { if (info.offset.x > 100) onSwipe('right'); else if (info.offset.x < -100) onSwipe('left'); }}
      animate={item.isCursed ? { x: [0, -2, 2, -2, 0], transition: { repeat: Infinity, duration: 0.1 } } : {}}
      className={`absolute w-full max-w-[256px] h-80 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden ${item.isCursed ? 'border-red-600' : 'border-slate-800'}`}
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
