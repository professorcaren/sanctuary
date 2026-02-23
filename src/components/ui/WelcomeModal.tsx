import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Sparkles, Shield, Scale, Users, Zap } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { state, dispatch } = useGame();

  if (state.hasSeenWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <Sparkles size={32} className="text-amber-500" />
          </div>

          <h2 className="text-3xl font-serif text-white mb-2">Welcome, Founder</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            You have been chosen to lead a new spiritual movement. Your goal is to grow from a humble cult into a global institution.
          </p>

          <div className="space-y-4 mb-8 text-left">
             <div className="flex gap-3 items-start">
                <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                   <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Maintain the Sacred</div>
                   <div className="text-[10px] text-slate-500">Balance Awe, Purity, and Cohesion. If any hit zero, your movement collapses.</div>
                </div>
             </div>
             <div className="flex gap-3 items-start">
                <Scale size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                   <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gain Legitimacy</div>
                   <div className="text-[10px] text-slate-500">To grow, you must convince the world you are a legitimate institution.</div>
                </div>
             </div>
             <div className="flex gap-3 items-start">
                <Users size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                   <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Evolve the Flock</div>
                   <div className="text-[10px] text-slate-500">Train disciples and build architecture to survive the test of time.</div>
                </div>
             </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'DISMISS_WELCOME' })}
            className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
          >
            Manifest the Sanctuary
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
