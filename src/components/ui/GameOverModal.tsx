import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Skull, RefreshCw, GraduationCap, Sparkles, Shield, Crown, Users, Trophy } from 'lucide-react';

const TRAITS = [
  { id: 'charismatic', label: 'Charismatic Founder', icon: <Sparkles size={16} />, cost: 1, description: '+20 Starting Awe' },
  { id: 'organized', label: 'Organized Scribe', icon: <Crown size={16} />, cost: 2, description: '+20 Starting Legitimacy' },
  { id: 'zealous', label: 'Zealous Inquisitor', icon: <Shield size={16} />, cost: 3, description: '+20 Starting Purity' },
  { id: 'communal', label: 'Communal Elder', icon: <Users size={16} />, cost: 1, description: '+20 Starting Cohesion' },
];

export const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!state.isGameOver) return null;

  const points = state.archive.length;
  const spentPoints = TRAITS.filter(t => selectedTraits.includes(t.id)).reduce((acc, t) => acc + t.cost, 0);
  const remainingPoints = points - spentPoints;

  const toggleTrait = (id: string, cost: number) => {
    if (selectedTraits.includes(id)) {
      setSelectedTraits(selectedTraits.filter(t => t !== id));
    } else if (remainingPoints >= cost) {
      setSelectedTraits([...selectedTraits, id]);
    }
  };

  const submitScore = () => {
    // Live Google Apps Script Web App URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgjp-X-d-byC-LQGiGiB5-kQXkCH_VWiOUdpL3yTA8D1pmmIqXZiMbBjcWzIGdsbfYEg/exec";

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: state.churchName || 'Unnamed',
        stage: state.stage,
        members: state.congregationSize,
        resources: state.resources
      })
    });

    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center my-8"
        >
          <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Skull size={40} className="text-red-500" />
          </div>

          <h2 className="text-3xl font-serif text-white mb-4">The End</h2>
          
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {state.gameOverReason}
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700">
             <div className="flex items-center justify-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">
                <GraduationCap size={14} /> Theory Points: {remainingPoints}
             </div>
             
             <div className="grid grid-cols-1 gap-2 mt-4">
                {TRAITS.map(trait => (
                  <button
                    key={trait.id}
                    onClick={() => toggleTrait(trait.id, trait.cost)}
                    disabled={!selectedTraits.includes(trait.id) && remainingPoints < trait.cost}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTraits.includes(trait.id) 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-glow-sm' 
                        : 'bg-slate-800/30 border-slate-700 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                        {trait.icon} {trait.label}
                      </div>
                      <div className="text-[10px] font-mono">{trait.cost} Pts</div>
                    </div>
                    <div className="text-[10px] opacity-70 italic">{trait.description}</div>
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'RESET_GAME', traits: selectedTraits })}
              className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg"
            >
              <RefreshCw size={18} /> Resurrect Group
            </button>
            
            {state.churchName && !submitted && (
              <button
                onClick={submitScore}
                className="w-full py-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600/30 transition-all"
              >
                <Trophy size={16} /> Submit to Hall
              </button>
            )}
            {submitted && (
              <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest py-2">
                Manifestation Recorded
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
