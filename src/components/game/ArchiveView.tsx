import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Book, GraduationCap, ArrowRight, Sparkles, UserCheck, ShieldAlert, GraduationCap as CapIcon } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  connections: string[];
}

const SHORT_LABELS: Record<string, string> = {
  'effervescence': 'Efferv.',
  'socialization': 'Social.',
  'sacred_profane': 'Sacred',
  'purity_danger': 'Purity',
  'routinization': 'Routin.',
};

const NODES: Record<string, Node> = {
  'effervescence': { id: 'effervescence', x: 50, y: 15, connections: ['socialization'] },
  'socialization': { id: 'socialization', x: 20, y: 40, connections: [] },
  'sacred_profane': { id: 'sacred_profane', x: 80, y: 40, connections: ['purity_danger'] },
  'purity_danger': { id: 'purity_danger', x: 70, y: 70, connections: ['routinization'] },
  'routinization': { id: 'routinization', x: 40, y: 85, connections: [] },
};

export const ArchiveView: React.FC = () => {
  const { state } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTheory = state.archive.find(t => t.id === selectedId);

  return (
    <div className="h-full flex flex-col p-4 bg-slate-950 overflow-y-auto relative">
      <div className="mb-4 text-center shrink-0">
        <h2 className="text-2xl font-serif text-amber-100 flex items-center justify-center gap-2">
          <Book className="text-amber-500" /> Web of Knowledge
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Discover the connections between society's secrets</p>
      </div>

      {/* The Web Visualizer */}
      <div className="flex-1 relative bg-slate-900/30 rounded-3xl border border-slate-800/50 shadow-inner overflow-visible pb-8">
        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {Object.values(NODES).map(node => 
            node.connections.map(targetId => {
              const target = NODES[targetId];
              return (
                <line 
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`} y1={`${node.y}%`}
                  x2={`${target.x}%`} y2={`${target.y}%`}
                  stroke="currentColor" strokeWidth="1"
                  className={state.archive.find(a => a.id === node.id) && state.archive.find(a => a.id === targetId) ? 'text-amber-500 opacity-100' : 'text-slate-700'}
                />
              );
            })
          )}
        </svg>

        {/* Theory Nodes */}
        {Object.values(NODES).map(node => {
          const isUnlocked = state.archive.find(a => a.id === node.id);
          return (
            <motion.button
              key={node.id}
              onClick={() => isUnlocked && setSelectedId(node.id)}
              initial={false}
              animate={{ 
                scale: selectedId === node.id ? 1.2 : 1,
                backgroundColor: isUnlocked ? (selectedId === node.id ? '#f59e0b' : '#1e293b') : '#0f172a'
              }}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors shadow-lg ${
                isUnlocked ? 'border-amber-500 text-amber-100 cursor-pointer' : 'border-slate-800 text-slate-800 cursor-not-allowed'
              }`}
            >
              {isUnlocked ? <Sparkles size={20} /> : <Book size={20} />}
              
              {/* Label */}
              <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-tighter ${isUnlocked ? 'text-slate-400' : 'text-slate-800'}`}>
                {isUnlocked ? (SHORT_LABELS[node.id] ?? node.id) : 'Locked'}
              </div>
            </motion.button>
          );
        })}

        {/* Floating Detail Panel */}
        <AnimatePresence>
          {selectedTheory && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl z-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-amber-400 font-bold text-lg leading-none">{selectedTheory.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">{selectedTheory.concept}</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-500 hover:text-white p-2">✕</button>
              </div>
              <p className="text-xs text-slate-200 italic mb-3">"{selectedTheory.theory}"</p>
              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
                {selectedTheory.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state.archive.length === 0 && (
        <div className="mt-4 text-center px-12 animate-pulse pointer-events-none shrink-0">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest italic">
            Perform rituals and teach the flock to manifest the web
          </p>
        </div>
      )}
    </div>
  );
};
