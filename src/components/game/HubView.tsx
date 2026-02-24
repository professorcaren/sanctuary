import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Home, Landmark, Building2, Church } from 'lucide-react';
import { OracleGuide } from '../ui/OracleGuide';

const UPGRADES = [
  { id: 'basement', name: 'Basement', icon: <Home size={14} />, cost: 50, aweBonus: 5, minStage: 'movement' },
  { id: 'chapel', name: 'Chapel', icon: <Landmark size={14} />, cost: 300, aweBonus: 10, minStage: 'sect' },
  { id: 'cathedral', name: 'Cathedral', icon: <Church size={14} />, cost: 1500, aweBonus: 20, minStage: 'congregation' },
  { id: 'megacomplex', name: 'Tabernacle', icon: <Building2 size={14} />, cost: 5000, aweBonus: 40, minStage: 'megachurch' },
];

const SPECIALTY_COLORS: Record<string, string> = {
  resources: 'bg-yellow-400',
  purity: 'bg-blue-400',
  awe: 'bg-purple-400',
};

const STAGE_ORDER = ['movement', 'cult', 'sect', 'congregation', 'megachurch'];

export const HubView: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

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
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mt-4">

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
            className="text-6xl filter drop-shadow-xl"
          >
            {getBuildingIcon()}
          </motion.span>
        </motion.div>
      </div>

      {/* Material Culture — single next-upgrade button */}
      {(() => {
        const nextUpgrade = UPGRADES.find(u => {
          if (state.buildings.includes(u.id)) return false;
          const stageIdx = STAGE_ORDER.indexOf(state.stage);
          const reqIdx = STAGE_ORDER.indexOf(u.minStage);
          return stageIdx >= reqIdx;
        });
        if (!nextUpgrade) return null;
        const canAfford = state.resources >= nextUpgrade.cost;
        return (
          <div className="mt-6 w-full px-2">
            <button
              onClick={() => setShowUpgradeConfirm(true)}
              disabled={!canAfford}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                canAfford
                  ? 'bg-slate-900 border-amber-500/40 active:scale-95'
                  : 'bg-slate-900 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-amber-400">{nextUpgrade.icon}</div>
                <div className="text-xs font-bold text-slate-200">Upgrade to {nextUpgrade.name}</div>
                <div className="ml-auto text-[10px] font-mono text-amber-500/80">{nextUpgrade.cost} res</div>
              </div>
            </button>

            {/* Upgrade confirmation overlay */}
            <AnimatePresence>
              {showUpgradeConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                  onClick={() => setShowUpgradeConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 max-w-xs w-full text-center"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="text-amber-400 mb-2">{nextUpgrade.icon}</div>
                    <h3 className="text-lg font-serif text-white mb-1">{nextUpgrade.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">+{nextUpgrade.aweBonus} Awe bonus</p>
                    <p className="text-sm font-mono text-amber-500 mb-4">{nextUpgrade.cost} Resources</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUpgradeConfirm(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          dispatch({ type: 'PURCHASE_UPGRADE', ...nextUpgrade });
                          setShowUpgradeConfirm(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold disabled:opacity-30"
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Evolution Modal */}
      {(() => {
        let evolveCost = 0;
        let requirement = { meter: '' as string, value: 0 };
        let nextStage = '' as string;
        let canEvolve = false;

        switch (state.stage) {
          case 'movement': {
            evolveCost = 100;
            requirement = { meter: 'awe', value: 60 };
            const highTensionDecisions = ['barred_gates', 'strict_purity', 'doubled_down'];
            const isHighTension = highTensionDecisions.some(id => state.decisionHistory.includes(id));
            nextStage = isHighTension ? 'cult' : 'sect';
            break;
          }
          case 'cult':
            evolveCost = 500;
            requirement = { meter: 'cohesion', value: 80 };
            nextStage = 'congregation';
            break;
          case 'sect':
            evolveCost = 500;
            requirement = { meter: 'cohesion', value: 80 };
            nextStage = 'congregation';
            break;
          case 'congregation':
            evolveCost = 2000;
            requirement = { meter: 'legitimacy', value: 75 };
            nextStage = 'megachurch';
            break;
          default:
            return null;
        }

        canEvolve = state.resources >= evolveCost && state.meters[requirement.meter as keyof typeof state.meters] >= requirement.value;

        return <EvolveWatcher canEvolve={canEvolve} nextStage={nextStage} cost={evolveCost} requirement={requirement} />;
      })()}
    </div>
  );
};

const EvolveWatcher: React.FC<{
  canEvolve: boolean;
  nextStage: string;
  cost: number;
  requirement: { meter: string; value: number };
}> = ({ canEvolve, nextStage, cost, requirement }) => {
  const { state, dispatch } = useGame();
  const [showEvolve, setShowEvolve] = useState(false);
  const prevCanEvolve = useRef(false);

  useEffect(() => {
    if (canEvolve && !prevCanEvolve.current) {
      setShowEvolve(true);
    }
    prevCanEvolve.current = canEvolve;
  }, [canEvolve]);

  const handleEvolve = () => {
    dispatch({ type: 'ADD_RESOURCE', amount: -cost });
    dispatch({ type: 'ADVANCE_STAGE', stage: nextStage });
    dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: 10 });
    dispatch({ type: 'UNLOCK_THEORY', id: state.stage === 'movement' ? 'church_sect' : 'routinization' });
    dispatch({ type: 'TRIGGER_ORACLE' });
    setShowEvolve(false);
  };

  return (
    <AnimatePresence>
      {showEvolve && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-xs w-full text-center"
          >
            <Crown size={28} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-xl font-serif text-white mb-2">Ready to Evolve</h3>
            <p className="text-sm text-slate-300 mb-4">
              Your movement is ready to evolve into <span className="font-bold text-amber-400">{nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}</span>.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {cost} Resources &bull; {requirement.value}% {requirement.meter.charAt(0).toUpperCase() + requirement.meter.slice(1)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEvolve(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold"
              >
                Not Yet
              </button>
              <button
                onClick={handleEvolve}
                className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                Evolve
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
