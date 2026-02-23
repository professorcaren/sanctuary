import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Skull, RefreshCw, GraduationCap } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();

  if (!state.isGameOver) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Skull size={40} className="text-red-500" />
          </div>

          <h2 className="text-3xl font-serif text-white mb-4">The End</h2>
          
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {state.gameOverReason}
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-700">
             <div className="flex items-center justify-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">
                <GraduationCap size={14} /> Knowledge Retained
             </div>
             <p className="text-[10px] text-slate-500">
               Your discoveries in the Archive will persist in the next life.
             </p>
          </div>

          <button
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={18} /> Begin Anew
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
