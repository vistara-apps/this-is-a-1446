import React from 'react';
import { BetCard } from './BetCard';
import { useBettingStore } from '../store/bettingStore';
import { TrendingUp } from 'lucide-react';

export function BetList() {
  const { bets } = useBettingStore();
  
  const activeBets = bets.filter(bet => bet.status === 'open');
  const resolvedBets = bets.filter(bet => bet.status === 'resolved');

  if (bets.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No bets available</h3>
        <p className="text-white/60 mb-6">Be the first to create a betting market!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeBets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Active Bets</h2>
          <div className="space-y-4">
            {activeBets.map(bet => (
              <BetCard key={bet.betId} bet={bet} />
            ))}
          </div>
        </div>
      )}

      {resolvedBets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recently Resolved</h2>
          <div className="space-y-4">
            {resolvedBets.slice(0, 3).map(bet => (
              <BetCard key={bet.betId} bet={bet} variant="resolved" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}