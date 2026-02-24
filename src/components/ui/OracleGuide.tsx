import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const OracleGuide: React.FC = () => {
  const { state, dispatch } = useGame();

  if (!state.isOracleActive) return null;

  const getAdvice = () => {
    let cost = 0;
    let req = { meter: '' as any, value: 0 };
    let next = '';

    switch (state.stage) {
      case 'movement': cost = 100; req = { meter: 'awe', value: 60 }; next = 'the next stage'; break;
      case 'cult': cost = 500; req = { meter: 'cohesion', value: 80 }; next = 'Congregation'; break;
      case 'sect': cost = 500; req = { meter: 'cohesion', value: 80 }; next = 'Congregation'; break;
      case 'congregation': cost = 2000; req = { meter: 'legitimacy', value: 75 }; next = 'Megachurch'; break;
      default: return "You have reached the final stage of institutional development.";
    }

    const needsRes = state.resources < cost;
    const needsMeter = state.meters[req.meter] < req.value;

    if (needsRes && needsMeter) return `To evolve to ${next}, generate more collective effervescence through rituals and build your resource base.`;
    if (needsRes) return `The collective energy is strong, but resources are insufficient. Focus on rituals or recruit Steward disciples.`;
    if (needsMeter) return `Resources are sufficient, but ${req.meter} is low. ${req.meter === 'awe' ? 'Perform rituals to rebuild collective effervescence.' : req.meter === 'cohesion' ? 'Socialize your members to strengthen group bonds.' : 'Submit forms in Admin to build institutional legitimacy.'}`;

    return `The conditions for institutional evolution are met. Advance to the next stage.`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-20 left-4 right-4 z-[60] bg-indigo-900/90 backdrop-blur-md border border-indigo-400/30 p-4 rounded-2xl shadow-2xl flex gap-4 items-start"
      >
        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 border border-indigo-400/20">
           <Sparkles size={20} className="text-indigo-300" />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-[10px] font-black uppercase tracking-tighter text-indigo-300">The Spirit Oracle</h4>
            <button onClick={() => dispatch({ type: 'DISMISS_ORACLE' })} className="text-indigo-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed italic">
            "{getAdvice()}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
