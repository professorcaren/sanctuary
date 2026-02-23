import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { PenTool, Check } from 'lucide-react';

export const NamingModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [name, setName] = useState('');

  // Trigger when stage is not movement and name is empty
  const showModal = (state.stage !== 'movement') && !state.churchName && !state.isGameOver;

  if (!showModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch({ type: 'SET_CHURCH_NAME', name: name.trim() });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <PenTool size={32} className="text-amber-500" />
          </div>

          <h2 className="text-3xl font-serif text-white mb-2">A New Era</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your movement has grown beyond its informal roots. It is time to name your manifestation. How shall the world know you?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Sanctuary Name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white text-center font-bold focus:border-amber-500 focus:outline-none transition-all"
              maxLength={24}
            />

            <button
              disabled={!name.trim()}
              type="submit"
              className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors shadow-lg disabled:opacity-50"
            >
              <Check size={18} /> Seal the Name
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
