import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { User, Sparkles, BookOpen, Crown, UserPlus, GraduationCap, ArrowUpCircle, ShieldAlert, UserCheck, ChevronRight } from 'lucide-react';
import { Disciple } from '../../types/game';

const SPECIALTIES = {
  resources: { icon: '💰', label: 'Steward', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  purity: { icon: '🛡️', label: 'Purist', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  awe: { icon: '✨', label: 'Mystic', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const TrainingSession: React.FC<{ disciple: Disciple; onClose: () => void }> = ({ disciple, onClose }) => {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState(0);
  
  const [scenario] = useState(() => {
    const scenarios = [
      { id: 'suffer', q: "Master, why do we suffer?", options: [
          { id: 'faith', text: "To test our faith.", points: 15 },
          { id: 'flaw', text: "Because the world is flawed.", points: 10 },
          { id: 'character', text: "Suffering builds character.", points: 5 },
      ]},
      { id: 'outsiders', q: "How should we treat the non-believers?", options: [
          { id: 'compassion', text: "With radical compassion.", points: 10 },
          { id: 'sheep', text: "As lost sheep to be guided.", points: 15 },
          { id: 'distance', text: "With cautious distance.", points: 5 },
      ]},
      { id: 'ritual', q: "What is the true purpose of our rituals?", options: [
          { id: 'divine', text: "To manifest the divine energy.", points: 15 },
          { id: 'unity', text: "To unify our collective heart.", points: 15 },
          { id: 'ancient', text: "To honor the ancient ways.", points: 10 },
      ]},
      { id: 'purity', q: "The world is full of distractions. How do we stay pure?", options: [
          { id: 'prayer', text: "Through constant prayer.", points: 15 },
          { id: 'noise', text: "By ignoring the secular noise.", points: 10 },
          { id: 'light', text: "By focusing on our inner light.", points: 15 },
      ]}
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });

  const shuffledOptions = useMemo(() => {
    return [...scenario.options].sort(() => Math.random() - 0.5);
  }, [scenario.id]);

  const handleChoice = (option: any) => {
    dispatch({ type: 'TRAIN_DISCIPLE', id: disciple.id, questionId: scenario.id, answerId: option.id, points: option.points });
    setStep(1);
    setTimeout(() => onClose(), 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto"
    >
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black" />
      
      <div className="w-full max-w-sm z-10 flex flex-col items-center pb-8">
        {/* Disciple Presence */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center text-5xl mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
             <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent" />
             {disciple.role === 'elder' ? '👑' : disciple.role === 'acolyte' ? '🕯️' : '👤'}
          </div>
          <h3 className="text-2xl font-serif text-slate-100">{disciple.name}</h3>
          <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${SPECIALTIES[disciple.specialty].color} mt-1`}>
            {SPECIALTIES[disciple.specialty].label} {disciple.role}
          </p>
        </motion.div>

        {step === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl relative shadow-2xl">
              <p className="text-slate-200 text-center text-lg font-serif leading-relaxed italic">"{scenario.q}"</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-slate-800 rotate-45" />
            </div>
            
            <div className="space-y-3">
              {shuffledOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(opt)}
                  className="w-full p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-amber-500/50 rounded-2xl text-sm text-slate-300 transition-all text-left flex justify-between items-center group"
                >
                  <span className="group-hover:text-amber-100 transition-colors">{opt.text}</span>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <AnimatePresence mode="wait">
              {state.lastTrainingResult === 'contradiction' && (
                <motion.div key="bad" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500">
                   <ShieldAlert size={64} className="mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                   <div className="font-bold text-2xl uppercase tracking-tighter">Contradiction!</div>
                   <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed">The Sacred Canopy is torn. The disciple questions your path.</p>
                </motion.div>
              )}
              {state.lastTrainingResult === 'consistent' && (
                <motion.div key="good" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-amber-400">
                   <UserCheck size={64} className="mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                   <div className="font-bold text-2xl uppercase tracking-tighter">Steadfast</div>
                   <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Your consistency reinforces the Truth.</p>
                </motion.div>
              )}
              {state.lastTrainingResult === 'new' && (
                <motion.div key="new" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-green-500">
                   <Sparkles size={64} className="mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                   <div className="font-bold text-2xl uppercase tracking-tighter">New Doctrine</div>
                   <p className="text-xs text-slate-500 mt-2">The Word is planted in fertile soil.</p>
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
      layoutId={disciple.id} onClick={onClick}
      className="w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-4 rounded-2xl flex items-center gap-4 text-left hover:border-amber-500/30 transition-all group relative overflow-hidden active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform shadow-lg z-10 relative">
        {disciple.role === 'elder' ? '👑' : disciple.role === 'acolyte' ? '🕯️' : '👤'}
        <svg className="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] -rotate-90 pointer-events-none" viewBox="0 0 36 36">
           <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1.5" />
           <path className={spec.color} strokeDasharray={`${disciple.loyalty}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1 z-10">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-200">{disciple.name}</h3>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${spec.color} ${spec.bg} border border-current opacity-80 uppercase tracking-widest`}>{spec.label}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-tighter">
           <span>{disciple.role}</span>
           <span className="font-mono opacity-50">Loyalty: {disciple.loyalty}%</span>
        </div>
      </div>
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
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black" />
      
      <div className="mb-6 text-center shrink-0 z-10">
        <h2 className="text-3xl font-serif text-amber-100">Inner Circle</h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.3em]">Shape the future leaders</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 space-y-3 z-10 pr-1">
          <button
            onClick={handleRecruit} disabled={state.congregationSize < 5}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center gap-3 text-slate-500 hover:text-amber-400 hover:border-amber-500/40 hover:bg-slate-900/50 transition-all disabled:opacity-30 group"
          >
            <UserPlus size={20} />
            <div className="text-left">
              <div className="font-bold text-sm">Recruit Novice</div>
              <div className="text-[9px] font-mono uppercase opacity-60">Cost: 5 Members</div>
            </div>
          </button>

          <AnimatePresence>
            {state.disciples.map(disciple => (
              <DiscipleCard key={disciple.id} disciple={disciple} onClick={() => setSelectedId(disciple.id)} />
            ))}
          </AnimatePresence>
          
          {state.disciples.length === 0 && (
            <div className="text-center text-slate-700 text-xs mt-12 italic px-12 leading-relaxed">
              "A shepherd cannot watch the flock alone."<br/>Recruit from the congregation to build your hierarchy.
            </div>
          )}
      </div>

      <AnimatePresence>
        {selectedId && selectedDisciple && (
          <TrainingSession key="session" disciple={selectedDisciple} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
