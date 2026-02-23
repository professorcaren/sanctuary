import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Crown, Sparkles, Home, Landmark, Building2, Church } from 'lucide-react';
import { OracleGuide } from '../ui/OracleGuide';

const UPGRADES = [
  { id: 'basement', name: 'Basement', icon: <Home size={14} />, cost: 50, aweBonus: 5, minStage: 'movement' },
  { id: 'chapel', name: 'Chapel', icon: <Landmark size={14} />, cost: 300, aweBonus: 10, minStage: 'sect' },
  { id: 'cathedral', name: 'Cathedral', icon: <Church size={14} />, cost: 1500, aweBonus: 20, minStage: 'denomination' },
  { id: 'megacomplex', name: 'Tabernacle', icon: <Building2 size={14} />, cost: 5000, aweBonus: 40, minStage: 'megachurch' },
];

const SPECIALTY_COLORS: Record<string, string> = {
  resources: 'bg-yellow-400',
  purity: 'bg-blue-400',
  awe: 'bg-purple-400',
};

export const HubView: React.FC = () => {
  const { state, dispatch } = useGame();

  const getBuildingIcon = () => {
    if (state.stage === 'cult') return '🏰';
    if (state.buildings.includes('megacomplex')) return '🏟️';
    if (state.buildings.includes('cathedral')) return '⛪';
    if (state.buildings.includes('chapel')) return '🛖';
    if (state.buildings.includes('basement')) return '🏠';
    return '⛺';
  };

  const getBackgroundGradient = () => {
    if (state.stage === 'cult') return 'from-slate-950 via-slate-900 to-black';
    if (state.buildings.includes('megacomplex')) return 'from-indigo-900/40 to-slate-950';
    if (state.buildings.includes('cathedral')) return 'from-amber-900/30 to-slate-950';
    return 'from-slate-900 to-slate-950';
  };

  // Generate random stable properties for the flock dots
  const flockDots = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    const genericCount = Math.max(0, state.congregationSize - state.disciples.length);
    const dots = [];

    // Add Disciples
    state.disciples.forEach((d, i) => {
      dots.push({
        id: d.id,
        color: SPECIALTY_COLORS[d.specialty] || 'bg-white',
        size: d.role === 'elder' ? 'w-2 h-2' : 'w-1.5 h-1.5',
        orbitRadius: 110 + (i * 5),
        duration: 15 + (i * 2),
        isDisciple: true
      });
    });

    // Add Generic Flock (capped at 30 visuals to avoid lag)
    for (let i = 0; i < Math.min(genericCount, 30); i++) {
      dots.push({
        id: `gen-${i}`,
        color: 'bg-amber-400/60',
        size: 'w-1 h-1',
        orbitRadius: 100 + (seededRandom(i) * 40),
        duration: 20 + (seededRandom(i + 1000) * 20),
        isDisciple: false
      });
    }
    return dots;
  }, [state.congregationSize, state.disciples]);

  return (
    <div className={`h-full flex flex-col items-center p-4 bg-gradient-to-b ${getBackgroundGradient()} overflow-y-auto relative`}>
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <OracleGuide />

      {/* Main Building Visualization */}
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0 mt-8">

        {/* Orbiting Flock */}
        {flockDots.map((dot) => (
          dot.isDisciple ? (
            <motion.div
              key={dot.id}
              className="absolute rounded-full pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: dot.duration, repeat: Infinity, ease: "linear" }}
              style={{
                width: dot.orbitRadius * 2,
                height: dot.orbitRadius * 2,
                zIndex: 20
              }}
            >
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dot.color} ${dot.size} shadow-[0_0_8px_currentColor]`} />
            </motion.div>
          ) : (
            <div
              key={dot.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: dot.orbitRadius * 2,
                height: dot.orbitRadius * 2,
                zIndex: 1,
                animation: `orbit ${dot.duration}s linear infinite`,
              }}
            >
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dot.color} ${dot.size}`} />
            </div>
          )
        ))}

        {/* The Building */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center bg-slate-800/30 rounded-full border-2 border-slate-700/50 shadow-xl z-10"
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
        </motion.div>
      </div>

      {/* Material Religion */}
      <div className="mt-12 w-full px-2">
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

      {/* Evolution Button */}
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
    case 'movement':
      cost = 100;
      requirement = { meter: 'awe', value: 60 };
      const highTensionDecisions = ['barred_gates', 'strict_purity', 'doubled_down'];
      const isHighTension = highTensionDecisions.some(id => state.decisionHistory.includes(id));
      nextStage = isHighTension ? 'cult' : 'sect';
      break;
    case 'cult':
      cost = 500;
      requirement = { meter: 'cohesion', value: 80 };
      nextStage = 'denomination';
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
      dispatch({ type: 'UNLOCK_THEORY', id: state.stage === 'movement' ? 'church_sect' : 'routinization' });
      dispatch({ type: 'TRIGGER_ORACLE' });
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
          {cost} Resources • {requirement.value}% {requirement.meter.substring(0,3)}
        </span>
      </div>
    </button>
  );
};
