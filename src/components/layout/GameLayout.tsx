import React from 'react';
import { useGame } from '../../context/GameContext';
import { MeterBar } from '../ui/MeterBar';
import { motion } from 'motion/react';

interface GameLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

import { SchismEventModal } from '../game/SchismEventModal';
import { LearningPromptModal } from '../ui/LearningPromptModal';
import { GameOverModal } from '../ui/GameOverModal';
import { WelcomeModal } from '../ui/WelcomeModal';
import { NamingModal } from '../ui/NamingModal';
import { StatsGlossaryModal } from '../ui/StatsGlossaryModal';

export const GameLayout: React.FC<GameLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { state } = useGame();
  const [isStatsOpen, setIsStatsOpen] = React.useState(false);
  const isProfane = state.meters.awe < 20 && state.stage !== 'cult';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col items-center transition-all duration-1000 ${isProfane ? 'grayscale sepia-[0.2] brightness-75' : ''}`}>
      <SchismEventModal />
      <LearningPromptModal />
      <GameOverModal />
      <WelcomeModal />
      <NamingModal />
      <StatsGlossaryModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      
      {/* Mobile Container Constraint */}
      <div className="w-full max-w-md h-[100dvh] flex flex-col relative bg-slate-900 shadow-2xl border-x border-slate-800 overflow-hidden">
        
        {/* Top Bar - Meters (Clickable) */}
        <button 
          onClick={() => setIsStatsOpen(true)}
          className="p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-10 shrink-0 text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-x-4">
               <MeterBar type="awe" value={state.meters.awe} label="Awe" />
               <MeterBar type="cohesion" value={state.meters.cohesion} label="Coh" />
            </div>
            <div className="grid grid-cols-2 gap-x-4">
               <MeterBar type="legitimacy" value={state.meters.legitimacy} label="Leg" />
               <MeterBar type="purity" value={state.meters.purity} label="Pur" />
            </div>
          </div>
          {/* Resources and Members separate or smaller */}
          <div className="mt-2 flex justify-between items-center px-1">
             <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex gap-3">
               <span>Resources: <span className="text-amber-400 font-bold">{state.resources}</span></span>
               <span>Flock: <span className="text-emerald-400 font-bold">{state.congregationSize}</span></span>
             </div>
             <div className="text-[9px] font-mono text-slate-500 uppercase">
               {state.churchName || state.stage}
             </div>
          </div>
        </button>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative min-h-0">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-slate-900 border-t border-slate-800 p-2 pb-[max(2rem,env(safe-area-inset-bottom))] shrink-0">
          <div className="flex justify-around items-center">
            <NavButton 
              active={activeTab === 'hub'} 
              onClick={() => onTabChange('hub')} 
              label="Sanctuary" 
              icon="🏰" 
            />
            <NavButton 
              active={activeTab === 'sorting'} 
              onClick={() => onTabChange('sorting')} 
              label="Sorting" 
              icon="⚖️" 
            />
            <NavButton 
              active={activeTab === 'ritual'} 
              onClick={() => onTabChange('ritual')} 
              label="Ritual" 
              icon="🕯️" 
            />
            <NavButton 
              active={activeTab === 'social'} 
              onClick={() => onTabChange('social')} 
              label="Teach" 
              icon="🗣️" 
            />
            <NavButton 
              active={activeTab === 'archive'} 
              onClick={() => onTabChange('archive')} 
              label="Archive" 
              icon="📚" 
            />
            
            {(state.stage === 'denomination' || state.stage === 'megachurch') && (
              <NavButton 
                active={activeTab === 'bureaucracy'} 
                onClick={() => onTabChange('bureaucracy')} 
                label="Admin" 
                icon="📜" 
              />
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[44px] min-h-[44px] ${
      active ? 'bg-slate-800 text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);
