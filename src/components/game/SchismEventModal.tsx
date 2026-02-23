import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { AlertTriangle } from 'lucide-react';

export const SchismEventModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const event = state.activeEvent;

  if (!event) return null;

  const handleChoice = (choiceIndex: number) => {
    const choice = event.choices[choiceIndex];
    
    // Apply effects
    Object.entries(choice.effects).forEach(([meter, value]) => {
      if (meter === 'congregationSize') {
        dispatch({ type: 'ADD_MEMBERS', amount: value as number });
      } else if (meter === 'resources') {
        dispatch({ type: 'ADD_RESOURCE', amount: value as number });
      } else {
        dispatch({ type: 'UPDATE_METER', meter: meter as any, value: value as number });
      }
    });

    dispatch({ type: 'RESOLVE_EVENT' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-amber-600" />
          
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold uppercase tracking-wider">Crisis Event</h3>
          </div>

          <h2 className="text-xl font-serif text-slate-100 mb-2">{event.title}</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-3">
            {event.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                className="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group"
              >
                <div className="text-slate-200 font-medium text-sm group-hover:text-amber-400 transition-colors">
                  {choice.text}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {/* Preview effects? Or keep hidden? Let's show vague hint */}
                  Outcome: {choice.outcome}
                </div>
              </button>
            ))}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
