import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Lightbulb } from 'lucide-react';

export const LearningPromptModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const prompt = state.activePrompt;

  if (!prompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 pointer-events-none flex justify-center"
      >
        <div className="bg-slate-800 border border-amber-500/30 text-slate-200 p-4 rounded-xl shadow-2xl max-w-sm pointer-events-auto flex gap-4 items-start">
          <div className="bg-amber-500/20 p-2 rounded-full text-amber-400 shrink-0">
            <Lightbulb size={20} />
          </div>
          <div>
            <p className="text-sm font-medium leading-relaxed mb-2">
              {prompt.text}
            </p>
            <button
              onClick={() => dispatch({ type: 'DISMISS_PROMPT' })}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
