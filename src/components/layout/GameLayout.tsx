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

export const GameLayout: React.FC<GameLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col items-center">
      <SchismEventModal />
      <LearningPromptModal />
      {/* Mobile Container Constraint */}
      <div className="w-full max-w-md h-screen flex flex-col relative bg-slate-900 shadow-2xl border-x border-slate-800">
        
        {/* Top Bar - Meters */}
        <header className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <MeterBar type="awe" value={state.meters.awe} label="Awe" />
            <MeterBar type="cohesion" value={state.meters.cohesion} label="Cohesion" />
            <MeterBar type="legitimacy" value={state.meters.legitimacy} label="Legitimacy" />
            <MeterBar type="purity" value={state.meters.purity} label="Purity" />
          </div>
          {/* Resources separate or smaller */}
          <div className="mt-2 flex justify-center">
             <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-yellow-400 border border-yellow-900/30">
               Resources: {state.resources}
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-slate-900 border-t border-slate-800 p-2 pb-6">
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
    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
      active ? 'bg-slate-800 text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);
