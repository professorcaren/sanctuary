import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { FileText, CheckCircle, XCircle, Stamp } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  body: string;
  cost: number;
  effects: {
    approve: { text: string; changes: any };
    deny: { text: string; changes: any };
  };
}

const DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Purchase Gold Candlesticks',
    body: 'The altar looks bare. We need more grandeur to impress the visitors.',
    cost: 50,
    effects: {
      approve: { text: 'The altar shines!', changes: { awe: 5, resources: -50 } },
      deny: { text: 'Frugality is a virtue.', changes: { resources: 0, awe: -2 } }
    }
  },
  {
    id: '2',
    title: 'Marriage Request',
    body: 'Brother Thomas wishes to marry Sister Mary. They are cousins.',
    cost: 10,
    effects: {
      approve: { text: 'Love wins (sort of).', changes: { cohesion: 5, purity: -5, resources: -10 } },
      deny: { text: 'Purity maintained.', changes: { purity: 5, cohesion: -5 } }
    }
  },
  {
    id: '3',
    title: 'Tax Exemption Form',
    body: 'The state requires us to file form 501(c)(3) to keep our status.',
    cost: 100,
    effects: {
      approve: { text: 'Legal status secured.', changes: { legitimacy: 10, resources: -100 } },
      deny: { text: 'We answer only to God.', changes: { legitimacy: -20, awe: 5 } }
    }
  },
  {
    id: '4',
    title: 'Missionary Expedition',
    body: 'Send missionaries to the neighboring town.',
    cost: 200,
    effects: {
      approve: { text: 'The word spreads.', changes: { congregationSize: 5, resources: -200 } },
      deny: { text: 'Focus on home first.', changes: { cohesion: 2 } }
    }
  }
];

export const BureaucracyGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [docIndex, setDocIndex] = useState(0);
  const [stamp, setStamp] = useState<'approved' | 'denied' | null>(null);

  const doc = DOCUMENTS[docIndex % DOCUMENTS.length];

  const handleStamp = (type: 'approved' | 'denied') => {
    if (stamp) return;
    setStamp(type);

    const effect = type === 'approved' ? doc.effects.approve : doc.effects.deny;
    
    // Apply changes
    Object.entries(effect.changes).forEach(([key, value]) => {
      if (key === 'resources') {
        dispatch({ type: 'ADD_RESOURCE', amount: value as number });
      } else if (key === 'congregationSize') {
        dispatch({ type: 'ADD_MEMBERS', amount: value as number });
      } else {
        dispatch({ type: 'UPDATE_METER', meter: key as any, value: value as number });
      }
    });

    setTimeout(() => {
      setStamp(null);
      setDocIndex(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 overflow-y-auto bg-slate-950 relative overflow-hidden">
      
      <div className="mb-6 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Bureaucracy</h2>
        <p className="text-xs text-slate-500 mt-1">Manage the Institution</p>
      </div>

      {/* Desk Surface */}
      <div className="relative w-full max-w-sm max-h-96 flex-1 bg-[#3e2723] rounded-xl shadow-2xl border-t-4 border-[#5d4037] p-6 pb-12 flex flex-col items-center">
        
        {/* Paper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={doc.id}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-[#f5f5dc] text-slate-900 p-6 rounded shadow-md w-full h-full flex flex-col relative rotate-1 overflow-hidden"
          >
            <div className="border-b border-slate-300 pb-2 mb-4 flex justify-between items-center">
              <span className="font-mono text-xs text-slate-500">REF: {doc.id}-{Date.now().toString().slice(-4)}</span>
              <FileText size={16} className="text-slate-400" />
            </div>
            
            <h3 className="font-serif font-bold text-lg mb-2">{doc.title}</h3>
            <p className="font-serif text-sm leading-relaxed flex-1">
              {doc.body}
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-300 text-xs font-mono flex justify-between">
              <span>Cost: {doc.cost} Resources</span>
              <span>Req: None</span>
            </div>

            {/* Stamp Mark */}
            {stamp && (
              <motion.div
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 rounded-lg p-2 font-black text-2xl uppercase tracking-wider opacity-80 mix-blend-multiply ${
                  stamp === 'approved' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                }`}
              >
                {stamp}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute bottom-2 flex gap-8">
          <button
            onClick={() => handleStamp('denied')}
            disabled={!!stamp}
            className="w-16 h-16 rounded-full bg-red-600 shadow-lg border-b-4 border-red-800 flex items-center justify-center text-white hover:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
          >
            <XCircle size={32} />
          </button>
          
          <button
            onClick={() => handleStamp('approved')}
            disabled={!!stamp || state.resources < doc.cost}
            className="w-16 h-16 rounded-full bg-green-600 shadow-lg border-b-4 border-green-800 flex items-center justify-center text-white hover:translate-y-1 active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={32} />
          </button>
        </div>

      </div>
    </div>
  );
};
