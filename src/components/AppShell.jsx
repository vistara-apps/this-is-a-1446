import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Tabs } from './Tabs';
import { TrendingUp, Plus, History } from 'lucide-react';

export function AppShell({ children, activeTab, onTabChange }) {
  const tabs = [
    { id: 'bets', label: 'Active Bets', icon: TrendingUp },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BetBase</h1>
                <p className="text-blue-100 text-sm">Stake, predict, and win on Base</p>
              </div>
            </div>
            <div className="scale-90">
              <ConnectButton />
            </div>
          </div>
          
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </header>

        {/* Content */}
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}