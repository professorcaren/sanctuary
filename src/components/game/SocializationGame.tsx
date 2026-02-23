import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { MessageCircle, User, Check, X } from 'lucide-react';

interface DialogueScenario {
  id: string;
  npcName: string;
  question: string;
  template: string; // e.g. "We must _____ the sacred."
  options: {
    text: string;
    type: 'doctrinal' | 'pragmatic' | 'mystical' | 'heretical';
    outcome: string;
  }[];
}

const SCENARIOS: DialogueScenario[] = [
  {
    id: '1',
    npcName: 'Novice Thomas',
    question: 'Why do we wear these heavy robes?',
    template: 'To _____ our devotion.',
    options: [
      { text: 'demonstrate', type: 'doctrinal', outcome: 'The novice nods solemnly.' },
      { text: 'hide', type: 'pragmatic', outcome: 'The novice looks confused but accepts it.' },
      { text: 'feel', type: 'mystical', outcome: 'The novice eyes widen in understanding.' },
      { text: 'mock', type: 'heretical', outcome: 'The novice gasps in horror!' },
    ],
  },
  {
    id: '2',
    npcName: 'Sister Sarah',
    question: 'The villagers say our rituals are strange.',
    template: 'They are blind to the _____ .',
    options: [
      { text: 'Truth', type: 'doctrinal', outcome: 'She feels reassured.' },
      { text: 'Benefits', type: 'pragmatic', outcome: 'She shrugs and agrees.' },
      { text: 'Light', type: 'mystical', outcome: 'She smiles peacefully.' },
      { text: 'Joke', type: 'heretical', outcome: 'She frowns deeply.' },
    ],
  },
  {
    id: '3',
    npcName: 'Elder John',
    question: 'Our resources are dwindling.',
    template: 'Faith will _____ us.',
    options: [
      { text: 'sustain', type: 'doctrinal', outcome: 'He nods firmly.' },
      { text: 'feed', type: 'pragmatic', outcome: 'He looks skeptical.' },
      { text: 'transcend', type: 'mystical', outcome: 'He looks inspired.' },
      { text: 'fail', type: 'heretical', outcome: 'He is visibly shaken.' },
    ],
  },
];

export const SocializationGame: React.FC = () => {
  const { dispatch } = useGame();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenario = SCENARIOS[scenarioIndex % SCENARIOS.length];

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);

    const option = scenario.options[index];
    
    // Apply effects
    switch (option.type) {
      case 'doctrinal':
        dispatch({ type: 'UPDATE_METER', meter: 'cohesion', value: 5 });
        dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: 2 });
        dispatch({ type: 'UNLOCK_THEORY', id: 'socialization' });
        dispatch({ 
            type: 'SHOW_PROMPT', 
            prompt: { id: 'socialization', text: 'Doctrine isn\'t just rules; it\'s how we learn to see the world.', trigger: 'first_social' } 
        });
        break;
      case 'pragmatic':
        dispatch({ type: 'ADD_RESOURCE', amount: 5 });
        dispatch({ type: 'UPDATE_METER', meter: 'awe', value: -2 });
        break;
      case 'mystical':
        dispatch({ type: 'UPDATE_METER', meter: 'awe', value: 5 });
        dispatch({ type: 'UPDATE_METER', meter: 'cohesion', value: 2 });
        break;
      case 'heretical':
        dispatch({ type: 'UPDATE_METER', meter: 'cohesion', value: -10 });
        dispatch({ type: 'UPDATE_METER', meter: 'legitimacy', value: -5 });
        // Maybe unlock something weird?
        break;
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedOption(null);
      setScenarioIndex((prev) => prev + 1);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      
      <div className="mb-8 text-center z-10">
        <h2 className="text-2xl font-serif text-slate-200">Socialization</h2>
        <p className="text-xs text-slate-500 mt-1">Teach the flock</p>
      </div>

      <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative">
        
        {/* NPC Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
            <User size={24} className="text-slate-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-300">{scenario.npcName}</div>
            <div className="text-xs text-slate-500">Congregation Member</div>
          </div>
        </div>

        {/* Question Bubble */}
        <div className="bg-slate-800/50 p-4 rounded-xl rounded-tl-none mb-6 border border-slate-700/50 relative">
          <p className="text-slate-200 italic">"{scenario.question}"</p>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-slate-800/50 transform rotate-45 border-l border-t border-slate-700/50" />
        </div>

        {/* Response Builder */}
        <div className="mb-6 text-center">
          <p className="text-slate-400 text-lg font-serif">
            {scenario.template.split('_____')[0]}
            <span className="inline-block border-b-2 border-amber-500/50 min-w-[80px] text-amber-400 font-bold px-2 mx-1">
              {selectedOption !== null ? scenario.options[selectedOption].text : '?'}
            </span>
            {scenario.template.split('_____')[1]}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="wait">
            {!showResult ? (
              scenario.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelect(idx)}
                  className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors text-sm font-medium text-slate-300"
                >
                  {option.text}
                </motion.button>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 text-center py-4"
              >
                <div className={`text-sm font-bold mb-2 ${
                  scenario.options[selectedOption!].type === 'heretical' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {scenario.options[selectedOption!].outcome}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">
                  {scenario.options[selectedOption!].type} Effect Applied
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
