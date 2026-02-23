import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { User, Sparkles, BookOpen, Crown, UserPlus, GraduationCap, ArrowUpCircle, ShieldAlert, UserCheck } from 'lucide-react';
import { Disciple } from '../../types/game';

const SPECIALTIES = {
  resources: { icon: '💰', label: 'Steward', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  purity: { icon: '🛡️', label: 'Purist', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  awe: { icon: '✨', label: 'Mystic', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const TrainingSession: React.FC<{ disciple: Disciple; onClose: () => void }> = ({ disciple, onClose }) => {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState(0);
  
  // Randomly select a scenario on component mount
  const [scenario] = useState(() => {
    const scenarios = [
      {
        id: 'suffer',
        q: "Master, why do we suffer?",
        options: [
          { id: 'faith', text: "To test our faith.", points: 15 },
          { id: 'flaw', text: "Because the world is flawed.", points: 10 },
          { id: 'character', text: "Suffering builds character.", points: 5 },
        ]
      },
      {
        id: 'outsiders',
        q: "How should we treat the non-believers?",
        options: [
          { id: 'compassion', text: "With radical compassion.", points: 10 },
          { id: 'sheep', text: "As lost sheep to be guided.", points: 15 },
          { id: 'distance', text: "With cautious distance.", points: 5 },
        ]
      },
      {
        id: 'ritual',
        q: "What is the true purpose of our rituals?",
        options: [
          { id: 'divine', text: "To manifest the divine energy.", points: 15 },
          { id: 'unity', text: "To unify our collective heart.", points: 15 },
          { id: 'ancient', text: "To honor the ancient ways.", points: 10 },
        ]
      },
      {
        id: 'purity',
        q: "The world is full of distractions. How do we stay pure?",
        options: [
          { id: 'prayer', text: "Through constant prayer.", points: 15 },
          { id: 'noise', text: "By ignoring the secular noise.", points: 10 },
          { id: 'light', text: "By focusing on our inner light.", points: 15 },
        ]
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });

  // Randomize option order so users can't memorize position
  const shuffledOptions = useMemo(() => {
    return [...scenario.options].sort(() => Math.random() - 0.5);
  }, [scenario.id]);

  const handleChoice = (option: any) => {
    dispatch({ 
      type: 'TRAIN_DISCIPLE', 
      id: disciple.id, 
      questionId: scenario.id, 
      answerId: option.id, 
      points: option.points 
    });
    setStep(1);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-3 border border-slate-700 shadow-inner">
             {disciple.role === 'elder' ? '👑' : disciple.role === 'acolyte' ? '🕯️' : '👤'}
          </div>
          <h3 className="text-xl font-bold text-slate-100">{disciple.name}</h3>
          <div className="flex justify-center gap-2 mt-1">
             <span className="text-[10px] uppercase tracking-widest text-slate-500">{disciple.role}</span>
             <span className="text-[10px] text-slate-600">•</span>
             <span className={`text-[10px] uppercase tracking-widest ${SPECIALTIES[disciple.specialty].color}`}>{SPECIALTIES[disciple.specialty].label}</span>
          </div>
        </div>

        {step === 0 ? (
          <>
            <div className="bg-slate-800/50 p-4 rounded-xl mb-6 relative border border-slate-700/50">
              <p className="italic text-slate-300 text-center text-lg font-serif leading-relaxed">"{scenario.q}"</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rotate-45 border-r border-b border-slate-700/50"></div>
            </div>
            
            <div className="space-y-3">
              {shuffledOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(opt)}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/30 rounded-xl text-sm text-slate-300 transition-all text-left flex justify-between items-center group"
                >
                  <span>{opt.text}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AnimatePresence mode="wait">
              {state.lastTrainingResult === 'contradiction' && (
                <motion.div key="bad" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500">
                   <ShieldAlert size={48} className="mx-auto mb-2" />
                   <div className="font-bold text-xl uppercase tracking-tighter">Contradiction!</div>
                   <p className="text-[10px] text-slate-500 mt-2">You gave a different answer last time. The disciple is confused and loyalty has plummeted.</p>
                </motion.div>
              )}
              {state.lastTrainingResult === 'consistent' && (
                <motion.div key="good" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-amber-400">
                   <UserCheck size={48} className="mx-auto mb-2" />
                   <div className="font-bold text-xl uppercase tracking-tighter">Consistent Doctrine</div>
                   <p className="text-[10px] text-slate-500 mt-2">Your steadfastness reinforces their faith. Bonus loyalty gained.</p>
                </motion.div>
              )}
              {state.lastTrainingResult === 'new' && (
                <motion.div key="new" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-green-500">
                   <Sparkles size={48} className="mx-auto mb-2" />
                   <div className="font-bold text-xl uppercase tracking-tighter">New Doctrine</div>
                   <p className="text-[10px] text-slate-500 mt-2">The disciple accepts your teaching into their heart.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DiscipleCard: React.FC<{ disciple: Disciple; onClick: () => void }> = ({ disciple, onClick }) => {
  const spec = SPECIALTIES[disciple.specialty];
  
  return (
    <motion.button
      layoutId={disciple.id}
      onClick={onClick}
      className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 text-left hover:border-amber-500/30 transition-all group relative overflow-hidden active:scale-[0.98]"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform shadow-lg z-10 relative`}>
        {disciple.role === 'elder' ? '👑' : disciple.role === 'acolyte' ? '🕯️' : '👤'}
        
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
           <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
           <path className={spec.color} strokeDasharray={`${disciple.loyalty}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      
      <div className="flex-1 z-10 relative">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-200 text-lg">{disciple.name}</h3>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${spec.color} ${spec.bg} border border-current opacity-80 uppercase tracking-wider`}>
            {spec.label}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
           <span className="capitalize">{disciple.role}</span>
           <span className="font-mono opacity-50">Lvl {Math.floor(disciple.loyalty / 10)}</span>
        </div>
      </div>
      
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${spec.bg.replace('/10', '/30')}`} />
    </motion.button>
  );
};

export const SocializationGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedDisciple = state.disciples.find(d => d.id === selectedId);

  const handleRecruit = () => {
    const names = ['Thomas', 'Sarah', 'John', 'Mary', 'Peter', 'Ruth', 'Paul', 'Esther', 'Luke', 'Martha'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const specialties: ('resources' | 'purity' | 'awe')[] = ['resources', 'purity', 'awe'];
    const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    
    dispatch({ type: 'RECRUIT_DISCIPLE', name: randomName, specialty: randomSpecialty });
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col relative overflow-hidden">
      
      <div className="mb-6 text-center shrink-0">
        <h2 className="text-2xl font-serif text-amber-100 flex items-center justify-center gap-2">
          <GraduationCap className="text-amber-500" /> Inner Circle
        </h2>
        <p className="text-xs text-slate-500 mt-1">Train disciples to secure the future</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 space-y-3 pr-1">
          <button
            onClick={handleRecruit}
            disabled={state.congregationSize < 5}
            className="w-full p-4 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center gap-3 text-slate-500 hover:text-amber-400 hover:border-amber-500/40 hover:bg-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
               <UserPlus size={18} />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Recruit Novice</div>
              <div className="text-[10px] font-mono opacity-70">Cost: 5 Members</div>
            </div>
          </button>

          <AnimatePresence>
            {state.disciples.map(disciple => (
              <DiscipleCard 
                key={disciple.id} 
                disciple={disciple} 
                onClick={() => setSelectedId(disciple.id)} 
              />
            ))}
          </AnimatePresence>
          
          {state.disciples.length === 0 && (
            <div className="text-center text-slate-700 text-xs mt-10 italic px-8 leading-relaxed">
              "A shepherd cannot watch the flock alone."<br/>Recruit from the congregation to begin building your hierarchy.
            </div>
          )}
      </div>

      <AnimatePresence>
        {selectedId && selectedDisciple && (
          <TrainingSession 
            key="session"
            disciple={selectedDisciple} 
            onClose={() => setSelectedId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
