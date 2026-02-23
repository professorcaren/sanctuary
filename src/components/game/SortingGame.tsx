import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Trash2, Sparkles } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  type: 'sacred' | 'profane' | 'liminal';
  icon: string;
  description: string;
}

const ITEMS: Item[] = [
  { id: 1, name: 'Old Boot', type: 'profane', icon: '👢', description: 'Discarded waste.' },
  { id: 2, name: 'Scripture', type: 'sacred', icon: '📖', description: 'The word made manifest.' },
  { id: 3, name: 'Wine', type: 'liminal', icon: '🍷', description: 'Sinful juice or holy blood?' },
  { id: 4, name: 'Chalice', type: 'sacred', icon: '🏆', description: 'A vessel for the divine.' },
  { id: 5, name: 'Candle', type: 'sacred', icon: '🕯️', description: 'Light in the darkness.' },
  { id: 6, name: 'Gravel', type: 'profane', icon: '🪨', description: 'Common earth.' },
  { id: 7, name: 'Relic', type: 'sacred', icon: '🦴', description: 'The remains of the holy.' },
  { id: 8, name: 'Gold Coin', type: 'liminal', icon: '💰', description: 'Mammon or a gift for the temple?' },
  { id: 9, name: 'Thorns', type: 'liminal', icon: '🌿', description: 'A nuisance or a crown?' },
  { id: 10, name: 'Incense', type: 'sacred', icon: '💨', description: 'Prayers rising up.' },
];

export const SortingGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [cards, setCards] = useState<Item[]>(() => [...ITEMS].sort(() => Math.random() - 0.5));
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);

  const activeCard = cards[0];

  const getItemType = (item: Item): 'sacred' | 'profane' => {
    if (item.type !== 'liminal') return item.type;
    
    // Logic for Liminal items based on stage
    // Cults/Sects are strict (everything is profane), Megachurches are inclusive
    if (state.stage === 'cult' || state.stage === 'sect') return 'profane';
    return 'sacred';
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard) return;

    const targetType = getItemType(activeCard);
    const isCorrect = (direction === 'right' && targetType === 'sacred') || 
                      (direction === 'left' && targetType === 'profane');

    if (isCorrect) {
      setResult('correct');
      const comboBonus = Math.floor(combo / 3);
      setCombo(prev => prev + 1);
      
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: 2 + comboBonus });
      dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 1 + comboBonus });
      
      dispatch({ type: 'UNLOCK_THEORY', id: 'sacred_profane' });
      if (activeCard.type === 'liminal') {
        dispatch({ type: 'UNLOCK_THEORY', id: 'purity_danger' });
        dispatch({ 
          type: 'SHOW_PROMPT', 
          prompt: { 
            id: 'purity_danger', 
            text: `"${activeCard.name}" is "matter out of place." Its meaning depends on the group's boundaries.`, 
            trigger: 'liminal_sort' 
          } 
        });
      }
    } else {
      setResult('wrong');
      setCombo(0);
      dispatch({ type: 'UPDATE_METER', meter: 'purity', value: -10 });
      dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: -5 });
    }

    setTimeout(() => {
      setResult(null);
      setCards((prev) => {
        const remaining = prev.slice(1);
        if (remaining.length === 0) {
          return [...ITEMS].sort(() => Math.random() - 0.5);
        }
        return remaining;
      });
    }, 400);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black" />

      <div className="mb-8 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-2xl font-serif text-slate-200">Sacred Sorting</h2>
          {combo > 2 && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              x{combo} CHAIN
            </motion.div>
          )}
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Purity or Pollution?</p>
      </div>

      <div className="relative w-64 h-96 flex items-center justify-center">
        {/* Drop Zones Visuals */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 text-red-900/40 flex flex-col items-center group">
          <Trash2 size={48} className="group-hover:text-red-600 transition-colors" />
          <span className="text-[10px] uppercase mt-2 font-bold tracking-widest rotate-[-90deg]">Profane</span>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-amber-900/40 flex flex-col items-center group">
          <Sparkles size={48} className="group-hover:text-amber-500 transition-colors" />
          <span className="text-[10px] uppercase mt-2 font-bold tracking-widest rotate-[90deg]">Sacred</span>
        </div>

        {/* Card Stack */}
        <AnimatePresence>
          {cards.length > 0 && (
            <Card
              key={activeCard.id}
              item={activeCard}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none`}
            >
              <div className={`text-5xl font-black italic tracking-tighter ${result === 'correct' ? 'text-amber-400' : 'text-red-600'}`}>
                {result === 'correct' ? 'PURE' : 'POLLUTED'}
              </div>
              {result === 'correct' && combo > 1 && (
                <div className="text-amber-200 font-mono text-sm mt-2">+{combo} Awe</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Context Hint */}
      <div className="mt-8 text-center max-w-xs">
        <p className="text-[10px] text-slate-600 uppercase tracking-tight leading-relaxed italic">
          Currently in <span className="text-slate-400">{state.stage}</span> stage. 
          {state.stage === 'cult' ? " The boundaries are tight." : " The boundaries are widening."}
        </p>
      </div>
    </div>
  );
};

const Card: React.FC<{ item: Item; onSwipe: (dir: 'left' | 'right') => void }> = ({ item, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Dynamic Background based on drag direction
  const bg = useTransform(
    x, 
    [-150, 0, 150], 
    ['rgba(127, 29, 29, 0.4)', 'rgba(15, 23, 42, 1)', 'rgba(120, 53, 15, 0.4)']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, backgroundColor: bg }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute w-64 h-80 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden ${
        item.type === 'sacred' ? 'border-amber-900/50 shadow-amber-900/20' : 
        item.type === 'profane' ? 'border-slate-800 shadow-black' : 
        'border-purple-900/30'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Aura Glow */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none ${
        item.type === 'sacred' ? 'bg-amber-500' : 
        item.type === 'profane' ? 'bg-slate-800' : 
        'bg-gradient-to-tr from-red-500 to-amber-500'
      }`} />

      <motion.div 
        className="text-7xl mb-6 relative z-10"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {item.icon}
      </motion.div>
      <h3 className="text-xl font-bold text-slate-100 z-10">{item.name}</h3>
      <p className="text-[10px] text-slate-500 mt-2 px-6 text-center italic z-10">
        {item.description}
      </p>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30">
         <div className="h-1 w-12 bg-slate-700 rounded-full" />
      </div>
    </motion.div>
  );
};
