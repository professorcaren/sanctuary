import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Crown, Sparkles, Home, Landmark, Building2, Church } from 'lucide-react';

const UPGRADES = [
  { id: 'basement', name: 'Secret Basement', icon: <Home size={16} />, cost: 50, aweBonus: 5, minStage: 'cult' },
  { id: 'chapel', name: 'Stone Chapel', icon: <Landmark size={16} />, cost: 300, aweBonus: 10, minStage: 'sect' },
  { id: 'cathedral', name: 'Gilded Cathedral', icon: <Church size={16} />, cost: 1500, aweBonus: 20, minStage: 'denomination' },
  { id: 'megacomplex', name: 'Digital Tabernacle', icon: <Building2 size={16} />, cost: 5000, aweBonus: 40, minStage: 'megachurch' },
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
    if (state.buildings.includes('megacomplex')) return 'from-indigo-900 to-slate-950';
    if (state.buildings.includes('cathedral')) return 'from-amber-900/40 to-slate-950';
    if (state.buildings.includes('chapel')) return 'from-slate-800 to-slate-950';
    return 'from-slate-900 to-slate-950';
  };

  return (
    <div className={`h-full flex flex-col items-center p-6 bg-gradient-to-b ${getBackgroundGradient()} overflow-y-auto pb-24`}>
      
      {/* Stage Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 shrink-0"
      >
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2">Current Manifestation</div>
        <h1 className="text-4xl font-serif text-amber-100 capitalize tracking-tight">{state.stage}</h1>
      </motion.div>

      {/* Main Building Visualization */}
      <motion.div 
        className="relative w-56 h-56 flex items-center justify-center bg-slate-800/30 rounded-full border-4 border-slate-700/50 shadow-2xl shrink-0"
        animate={{ 
          boxShadow: `0 0 ${state.meters.awe}px rgba(251,191,36,${state.meters.awe / 200})`,
          borderColor: state.meters.awe > 80 ? 'rgba(251,191,36,0.5)' : 'rgba(51,65,85,0.5)'
        }}
      >
        <motion.span 
          key={getBuildingIcon()}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-9xl filter drop-shadow-2xl"
        >
          {getBuildingIcon()}
        </motion.span>
        
        {/* Orbiting Awe Particles */}
        <motion.div 
          className="absolute inset-[-20px] rounded-full border border-amber-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
        </motion.div>
      </motion.div>

      {/* Material Religion: Architecture Upgrades */}
      <div className="mt-10 w-full">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Landmark size={12} /> Material Culture
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {UPGRADES.map(upgrade => {
            const isOwned = state.buildings.includes(upgrade.id);
            const canAfford = state.resources >= upgrade.cost;
            const isUnlocked = state.stage === upgrade.minStage || state.buildings.length >= UPGRADES.findIndex(u => u.id === upgrade.id);

            return (
              <button
                key={upgrade.id}
                disabled={isOwned || !canAfford || !isUnlocked}
                onClick={() => dispatch({ type: 'PURCHASE_UPGRADE', ...upgrade })}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isOwned 
                    ? 'bg-amber-500/10 border-amber-500/30 opacity-100' 
                    : !isUnlocked ? 'opacity-20 grayscale border-slate-800'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${isOwned ? 'text-amber-400' : 'text-slate-500'}`}>{upgrade.icon}</div>
                  <div className={`text-[10px] font-bold ${isOwned ? 'text-amber-200' : 'text-slate-300'}`}>{upgrade.name}</div>
                </div>
                {!isOwned ? (
                  <div className="text-[10px] font-mono text-amber-500/80">{upgrade.cost} Res</div>
                ) : (
                  <div className="text-[10px] font-mono text-green-500 flex items-center gap-1">
                    <Sparkles size={8} /> Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Congregation Stats */}
      <div className="mt-8 w-full">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Users size={12} /> The Flock
          </h2>
          <span className="text-[10px] font-mono text-slate-400">{state.congregationSize} Members</span>
        </div>
        
        <div className="bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 min-h-[80px] flex flex-wrap gap-1.5 justify-center content-start overflow-hidden">
          {Array.from({ length: Math.min(state.congregationSize, 40) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: (i % 20) * 0.02 }}
              className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] opacity-60"
            >
              👤
            </motion.div>
          ))}
          {state.congregationSize > 40 && (
            <div className="w-4 h-4 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-[6px] text-slate-500">
              +
            </div>
          )}
        </div>
      </div>

      {/* Evolution Button */}
      <div className="mt-8 mb-4">
        <UpgradeButton />
      </div>
    </div>
  );
};

const UpgradeButton: React.FC = () => {
// ... existing UpgradeButton logic
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
