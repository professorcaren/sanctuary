import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Trash2, Sparkles, AlertCircle, Clock } from 'lucide-react';

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
  // Cult/Sect Era
  { id: '1', name: 'Old Boot', type: 'profane', category: 'junk', icon: '👢', description: 'Discarded waste.' },
  { id: '2', name: 'Scripture', type: 'sacred', category: 'icon', icon: '📖', description: 'The word made manifest.' },
  { id: '3', name: 'Wine', type: 'liminal', category: 'food', icon: '🍷', description: 'Sinful juice or holy blood?' },
  { id: '4', name: 'Tattered Robe', type: 'sacred', category: 'icon', icon: '👘', description: 'Worn by the founder.' },
  { id: '5', name: 'Wild Berries', type: 'liminal', category: 'food', icon: '🫐', description: 'Natures bounty.' },
  
  // Denomination/Megachurch Era
  { id: '6', name: 'Coffee Cup', type: 'liminal', category: 'modern', icon: '☕', description: 'Fuel for the faithful.' },
  { id: '7', name: 'Gold Coin', type: 'liminal', category: 'junk', icon: '💰', description: 'Mammon or a gift?' },
  { id: '8', name: 'LED Screen', type: 'profane', category: 'modern', icon: '📺', description: 'The distraction of the world.' },
  { id: '9', name: 'Credit Card', type: 'profane', category: 'modern', icon: '💳', description: 'A trap of debt.' },
  { id: '10', name: 'Electric Guitar', type: 'liminal', category: 'modern', icon: '🎸', description: 'Used for praise or vanity?' },
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

export const SortingGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [cards, setCards] = useState<Item[]>([]);
  const [currentLaw, setCurrentLaw] = useState<Law | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    refreshDeck();
  }, [state.stage]);

  const refreshDeck = () => {
    // Filter items based on stage logic
    const filtered = ALL_ITEMS.filter(item => {
      if (state.stage === 'cult' || state.stage === 'sect') return item.category !== 'modern';
      return true;
    }).map(item => ({
      ...item,
      id: Math.random().toString(), // Force unique IDs for animation
      isCursed: Math.random() < 0.15 // 15% chance to be cursed
    }));
    
    setCards(filtered.sort(() => Math.random() - 0.5));
    
    // 30% chance to trigger a new Law
    if (Math.random() < 0.3) {
      setCurrentLaw(LAWS[Math.floor(Math.random() * LAWS.length)]);
    } else {
      setCurrentLaw(null);
    }
  };

  const activeCard = cards[0];

  const getItemType = (item: Item): 'sacred' | 'profane' => {
    // 1. Check Law first
    if (currentLaw) {
      const lawResult = currentLaw.check(item);
      if (lawResult) return lawResult;
    }

    // 2. Standard Logic
    if (item.type !== 'liminal') return item.type;
    return (state.stage === 'cult' || state.stage === 'sect') ? 'profane' : 'sacred';
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard || state.activeEvent) return;

    const targetType = getItemType(activeCard);
    const isCorrect = (direction === 'right' && targetType === 'sacred') || 
                      (direction === 'left' && targetType === 'profane');

    if (isCorrect) {
      setResult('correct');
      setCombo(prev => prev + 1);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 3 });
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 1 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'sacred_profane' });
    } else {
      setResult('wrong');
      setCombo(0);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -10 });
    }

    setTimeout(() => {
      setResult(null);
      setCards(prev => {
        const next = prev.slice(1);
        if (next.length === 0) refreshDeck();
        return next;
      });
    }, 400);
  };

  const handleCurseExplode = () => {
    setResult('wrong');
    setCombo(0);
    dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -15 });
    setCards(prev => prev.slice(1));
    setTimeout(() => setResult(null), 500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      
      {/* Law Announcement */}
      <AnimatePresence>
        {currentLaw && !state.activeEvent && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-50 bg-amber-600 text-black p-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-amber-400"
          >
            <AlertCircle size={24} />
            <div>
              <div className="font-black text-[10px] uppercase tracking-tighter">Current Law</div>
              <div className="font-bold text-sm leading-none">{currentLaw.title}</div>
              <div className="text-[10px] opacity-80 mt-1">{currentLaw.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Sacred Sorting</h2>
        <div className="text-[10px] text-amber-500 font-mono mt-1">Chain: x{combo}</div>
      </div>

      <div className="relative w-64 h-96 flex items-center justify-center">
        <div className="absolute left-0 -translate-x-16 text-red-900/40 flex flex-col items-center"><Trash2 size={48} /></div>
        <div className="absolute right-0 translate-x-16 text-amber-900/40 flex flex-col items-center"><Sparkles size={48} /></div>

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

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} className={`absolute z-50 text-5xl font-black italic ${result === 'correct' ? 'text-amber-400' : 'text-red-600'}`}>
            {result === 'correct' ? 'PURE' : 'POLLUTED'}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ item: Item; onSwipe: (dir: 'left' | 'right') => void, onExplode: () => void }> = ({ item, onSwipe, onExplode }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const [timeLeft, setTimeLeft] = useState(2.5);

  useEffect(() => {
    if (!item.isCursed) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) { clearInterval(timer); onExplode(); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [item]);

  return (
    <motion.div
      style={{ x, rotate, backgroundColor: useTransform(x, [-150, 0, 150], ['#450a0a', '#0f172a', '#451a03']) }}
      drag="x" dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => { if (info.offset.x > 100) onSwipe('right'); else if (info.offset.x < -100) onSwipe('left'); }}
      animate={item.isCursed ? { x: [0, -2, 2, -2, 0], transition: { repeat: Infinity, duration: 0.1 } } : {}}
      className={`absolute w-64 h-80 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden ${item.isCursed ? 'border-red-600' : 'border-slate-800'}`}
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
