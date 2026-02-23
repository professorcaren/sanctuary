import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion } from 'motion/react';
import { Users, Crown, Sparkles } from 'lucide-react';

export const HubView: React.FC = () => {
  const { state } = useGame();

  const getBuildingIcon = () => {
    switch (state.stage) {
      case 'cult': return '⛺';
      case 'sect': return '🛖';
      case 'denomination': return '⛪';
      case 'megachurch': return '🏟️';
      default: return '⛺';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950">
      
      {/* Stage Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Current Stage</div>
        <h1 className="text-3xl font-serif text-amber-100 capitalize">{state.stage}</h1>
      </motion.div>

      {/* Main Building Visualization */}
      <motion.div 
        className="relative w-48 h-48 flex items-center justify-center bg-slate-800/50 rounded-full border-4 border-slate-700 shadow-[0_0_50px_rgba(251,191,36,0.1)]"
        animate={{ 
          boxShadow: `0 0 ${state.meters.awe / 2}px rgba(251,191,36,${state.meters.awe / 200})`
        }}
      >
        <span className="text-8xl filter drop-shadow-lg">{getBuildingIcon()}</span>
        
        {/* Orbiting Particles (Awe) */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-amber-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-glow" />
        </motion.div>
      </motion.div>

      {/* Congregation Area */}
      <div className="mt-12 w-full">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Users size={14} /> Congregation
          </h2>
          <span className="text-xs text-slate-500">{state.congregationSize} Members</span>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[100px] flex flex-wrap gap-2 justify-center">
          {Array.from({ length: Math.min(state.congregationSize, 20) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px]"
            >
              👤
            </motion.div>
          ))}
          {state.congregationSize > 20 && (
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
              +{state.congregationSize - 20}
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 italic mb-4">
          "The sacred is that which is set apart."
        </p>
        
        <UpgradeButton />
      </div>
    </div>
  );
};

const UpgradeButton: React.FC = () => {
  const { state, dispatch } = useGame();
  
  let cost = 0;
  let requirement = { meter: '' as any, value: 0 };
  let nextStage = '' as any;
  let canUpgrade = false;

  switch (state.stage) {
    case 'cult':
      cost = 100;
      requirement = { meter: 'awe', value: 60 };
      nextStage = 'sect';
      break;
    case 'sect':
      cost = 500;
      requirement = { meter: 'cohesion', value: 80 };
      nextStage = 'denomination';
      break;
    case 'denomination':
      cost = 2000;
      requirement = { meter: 'legitimacy', value: 90 };
      nextStage = 'megachurch';
      break;
    default:
      return null;
  }

  canUpgrade = state.resources >= cost && state.meters[requirement.meter] >= requirement.value;

  const handleUpgrade = () => {
    if (canUpgrade) {
      dispatch({ type: 'ADD_RESOURCE', amount: -cost });
      dispatch({ type: 'ADVANCE_STAGE', stage: nextStage });
      dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: 10 });
      dispatch({ type: 'UNLOCK_THEORY', id: 'routinization' });
      // Increase congregation cap or size
      // For prototype, just bump size
      dispatch({ type: 'ADD_RESOURCE', amount: 0 }); // Dummy dispatch to force re-render if needed, but state update does it
      // Actually we should probably have an action to increase congregation
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={!canUpgrade}
      className={`
        px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all
        ${canUpgrade 
          ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
      `}
    >
      <div className="flex flex-col items-center">
        <span>Evolve to {nextStage.toUpperCase()}</span>
        <span className="text-[10px] opacity-70 mt-1">
          Cost: {cost} Res • Req: {requirement.value}% {requirement.meter}
        </span>
      </div>
    </button>
  );
};
