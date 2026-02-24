import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GameLayout } from './components/layout/GameLayout';
import { HubView } from './components/game/HubView';
import { SortingGame } from './components/game/SortingGame';
import { RitualGame } from './components/game/RitualGame';
import { SocializationGame } from './components/game/SocializationGame';
import { BureaucracyGame } from './components/game/BureaucracyGame';
import { ArchiveView } from './components/game/ArchiveView';
import { LeaderboardView } from './components/game/LeaderboardView';

function AppContent() {
  const { dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('hub');

  // Sync active tab with GameContext to prevent events during minigames
  useEffect(() => {
    dispatch({ type: 'SET_VIEW', view: activeTab });
  }, [activeTab, dispatch]);

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
    <GameLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </GameLayout>
  );
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Standalone leaderboard for instructors: /sanctuary/#leaderboard
  if (hash === '#leaderboard') {
    return <LeaderboardView standalone />;
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
