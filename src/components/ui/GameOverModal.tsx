import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Skull, RefreshCw, GraduationCap, Sparkles, Shield, Crown, Users, Trophy } from 'lucide-react';
import { LeaderboardView } from '../game/LeaderboardView';

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
  const [showHall, setShowHall] = useState(false);

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
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgjp-X-d-byC-LQGiGiB5-kQXkCH_VWiOUdpL3yTA8D1pmmIqXZiMbBjcWzIGdsbfYEg/exec";

    const formData = new FormData();
    formData.append('name', state.churchName || 'Unnamed');
    formData.append('stage', state.stage);
    formData.append('members', state.congregationSize.toString());
    formData.append('resources', state.resources.toString());

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
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
      {state.isGameOver && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 overflow-y-auto"
      >
        {showHall ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 w-full h-[80vh] rounded-3xl relative flex flex-col pt-12 overflow-hidden border border-amber-500/20 shadow-2xl"
          >
             <button 
               onClick={() => setShowHall(false)} 
               className="absolute top-4 left-4 z-50 bg-slate-800 px-3 py-1 rounded-full text-slate-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors"
             >
                ← Back
             </button>
             <LeaderboardView />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center my-8"
          >
            <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <Skull size={40} className="text-red-500" />
            </div>

            <h2 className="text-3xl font-serif text-white mb-4">The End</h2>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
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
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowHall(true)}
                  className="py-3 bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all border border-slate-700"
                >
                  <Trophy size={16} /> Hall
                </button>

                {state.churchName && !submitted ? (
                  <button
                    onClick={submitScore}
                    className="py-3 bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-lg"
                  >
                    Submit
                  </button>
                ) : submitted ? (
                  <div className="flex items-center justify-center text-[10px] text-green-500 font-bold uppercase tracking-widest border border-green-900/30 rounded-xl bg-green-950/10">
                    Recorded
                  </div>
                ) : (
                  <div className="bg-slate-800/20 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-[8px] text-slate-700 uppercase">
                    Needs Name
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      )}
    </AnimatePresence>
  );
};
