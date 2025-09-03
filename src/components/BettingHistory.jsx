import React from 'react';
import { useBettingStore } from '../store/bettingStore';
import { BetCard } from './BetCard';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

export function BettingHistory() {
  const { getUserBets, getUserStats } = useBettingStore();
  const userBets = getUserBets();
  const stats = getUserStats();

  if (userBets.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No betting history</h3>
        <p className="text-white/60">Start by placing your first stake!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-white/70">Total Winnings</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalWinnings.toFixed(2)}</div>
          <div className="text-xs text-accent">USDC</div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-white/70">Total Staked</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalStaked.toFixed(2)}</div>
          <div className="text-xs text-white/60">USDC</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/70 mb-1">Win Rate</div>
            <div className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-white/70 mb-1">Net P&L</div>
            <div className={`text-xl font-bold ${stats.netPnL >= 0 ? 'text-accent' : 'text-red-400'}`}>
              {stats.netPnL >= 0 ? '+' : ''}{stats.netPnL.toFixed(2)} USDC
            </div>
          </div>
        </div>
      </div>

      {/* Betting History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Bets</h2>
        <div className="space-y-4">
          {userBets.map(bet => (
            <BetCard key={bet.betId} bet={bet} />
          ))}
        </div>
      </div>
    </div>
  );
}