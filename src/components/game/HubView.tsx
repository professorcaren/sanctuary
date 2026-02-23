import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Crown, Sparkles, Home, Landmark, Building2, Church } from 'lucide-react';

const UPGRADES = [
  { id: 'basement', name: 'Basement', icon: <Home size={14} />, cost: 50, aweBonus: 5, minStage: 'cult' },
  { id: 'chapel', name: 'Chapel', icon: <Landmark size={14} />, cost: 300, aweBonus: 10, minStage: 'sect' },
  { id: 'cathedral', name: 'Cathedral', icon: <Church size={14} />, cost: 1500, aweBonus: 20, minStage: 'denomination' },
  { id: 'megacomplex', name: 'Tabernacle', icon: <Building2 size={14} />, cost: 5000, aweBonus: 40, minStage: 'megachurch' },
];

export const HubView: React.FC = () => {
  const { state, dispatch } = useGame();

  const getBuildingIcon = () => {
    if (state.buildings.includes('megacomplex')) return '🏟️';
    if (state.buildings.includes('cathedral')) return '⛪';
    if (state.buildings.includes('chapel')) return '🛖';
    if (state.buildings.includes('basement')) return '🏠';
    return '⛺';
  };

  const getBackgroundGradient = () => {
    if (state.buildings.includes('megacomplex')) return 'from-indigo-900/40 to-slate-950';
    if (state.buildings.includes('cathedral')) return 'from-amber-900/30 to-slate-950';
    return 'from-slate-900 to-slate-950';
  };

  return (
    <div className={`h-full flex flex-col items-center p-4 bg-gradient-to-b ${getBackgroundGradient()} overflow-hidden`}>
      
      {/* Main Building Visualization - Shrunk */}
      <motion.div 
        className="relative w-40 h-40 flex items-center justify-center bg-slate-800/30 rounded-full border-2 border-slate-700/50 shadow-xl shrink-0 mt-2"
        animate={{ 
          boxShadow: `0 0 ${state.meters.awe/2}px rgba(251,191,36,${state.meters.awe / 300})`,
        }}
      >
        <motion.span 
          key={getBuildingIcon()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl filter drop-shadow-xl"
        >
          {getBuildingIcon()}
        </motion.span>
        
        {/* Orbiting Awe Particles */}
        <motion.div 
          className="absolute inset-[-10px] rounded-full border border-amber-500/5"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
        </motion.div>
      </motion.div>

      {/* Material Religion - Shrunk Cards */}
      <div className="mt-6 w-full px-2">
        <h2 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Landmark size={10} /> Material Culture
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {UPGRADES.map(upgrade => {
            const isOwned = state.buildings.includes(upgrade.id);
            const canAfford = state.resources >= upgrade.cost;
            const isUnlocked = state.stage === upgrade.minStage || state.buildings.length >= UPGRADES.findIndex(u => u.id === upgrade.id);

            return (
              <button
                key={upgrade.id}
                disabled={isOwned || !canAfford || !isUnlocked}
                onClick={() => dispatch({ type: 'PURCHASE_UPGRADE', ...upgrade })}
                className={`p-2 rounded-xl border text-left transition-all relative ${
                  isOwned 
                    ? 'bg-amber-500/10 border-amber-500/30 opacity-100' 
                    : !isUnlocked ? 'opacity-10 grayscale border-slate-800'
                    : 'bg-slate-900 border-slate-800 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`${isOwned ? 'text-amber-400' : 'text-slate-500'}`}>{upgrade.icon}</div>
                  <div className={`text-[9px] font-bold ${isOwned ? 'text-amber-200' : 'text-slate-300'}`}>{upgrade.name}</div>
                </div>
                {!isOwned && <div className="text-[8px] font-mono text-amber-500/80 ml-5">{upgrade.cost}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Congregation Stats - Tiny */}
      <div className="mt-6 w-full px-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Users size={10} /> The Flock
          </h2>
          <span className="text-[9px] font-mono text-slate-500">{state.congregationSize} Members</span>
        </div>
        
        <div className="bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50 min-h-[40px] flex flex-wrap gap-1 justify-center content-start overflow-hidden">
          {Array.from({ length: Math.min(state.congregationSize, 30) }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[5px] opacity-40">👤</div>
          ))}
        </div>
      </div>

      {/* Evolution Button - Compact */}
      <div className="mt-auto mb-2 w-full flex justify-center">
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
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={!canUpgrade}
      className={`
        w-full max-w-[240px] py-3 rounded-xl font-bold text-xs tracking-wide transition-all
        ${canUpgrade 
          ? 'bg-amber-500 text-slate-900 shadow-lg' 
          : 'bg-slate-800 text-slate-500 border border-slate-700'}
      `}
    >
      <div className="flex flex-col items-center">
        <span>Evolve to {nextStage.toUpperCase()}</span>
        <span className="text-[8px] opacity-70 mt-0.5">
          {cost} Res • {requirement.value}% {requirement.meter.substring(0,3)}
        </span>
      </div>
    </button>
  );
};
