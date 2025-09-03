import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import { BetList } from './components/BetList';
import { CreateBet } from './components/CreateBet';
import { BettingHistory } from './components/BettingHistory';
import { useBettingStore } from './store/bettingStore';

function App() {
  const [activeTab, setActiveTab] = useState('bets');
  const { bets, stakes } = useBettingStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateBet onBetCreated={() => setActiveTab('bets')} />;
      case 'history':
        return <BettingHistory />;
      default:
        return <BetList />;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppShell>
  );
}

export default App;