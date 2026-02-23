import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { GameLayout } from './components/layout/GameLayout';
import { HubView } from './components/game/HubView';
import { SortingGame } from './components/game/SortingGame';
import { RitualGame } from './components/game/RitualGame';
import { SocializationGame } from './components/game/SocializationGame';
import { BureaucracyGame } from './components/game/BureaucracyGame';
import { ArchiveView } from './components/game/ArchiveView';
import { LeaderboardView } from './components/game/LeaderboardView';

export default function App() {
  const [activeTab, setActiveTab] = useState('hub');

  const renderContent = () => {
    switch (activeTab) {
      case 'hub':
        return <HubView />;
      case 'sorting':
        return <SortingGame />;
      case 'ritual':
        return <RitualGame />;
      case 'social':
        return <SocializationGame />;
      case 'bureaucracy':
        return <BureaucracyGame />;
      case 'archive':
        return <ArchiveView />;
      case 'leaderboard':
        return <LeaderboardView />;
      default:
        return <HubView />;
    }
  };

  return (
    <GameProvider>
      <GameLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </GameLayout>
    </GameProvider>
  );
}
