import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion } from 'motion/react';
import { Book, GraduationCap } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="h-full flex flex-col p-6 bg-slate-950 overflow-y-auto pb-20">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-serif text-amber-100 flex items-center justify-center gap-2">
          <Book className="text-amber-500" /> Theory Archive
        </h2>
        <p className="text-xs text-slate-500 mt-2">Documenting the mechanics of the sacred</p>
      </div>

      {state.archive.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 italic text-center px-8">
          <GraduationCap size={48} className="mb-4 opacity-20" />
          <p>No sociological theories unlocked yet. Perform rituals and manage your flock to discover the secrets of society.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {state.archive.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-amber-100">{entry.title}</h3>
                <span className="text-[10px] font-mono text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {entry.concept}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">
                "{entry.theory}"
              </p>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
