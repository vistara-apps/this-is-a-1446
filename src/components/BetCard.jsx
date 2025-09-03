import React from 'react';
import { Button } from './Button';
import { Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import { useBettingStore } from '../store/bettingStore';

export function BetCard({ bet, variant = 'open' }) {
  const { stakeBet, resolveBet, getUserStake } = useBettingStore();
  const [selectedOutcome, setSelectedOutcome] = React.useState(bet.outcomeOptions[0]);
  const [stakeAmount, setStakeAmount] = React.useState('');
  const [showStakeForm, setShowStakeForm] = React.useState(false);

  const userStake = getUserStake(bet.betId);
  const totalStaked = bet.stakes?.reduce((sum, stake) => sum + stake.amount, 0) || 0;
  const uniqueStakers = new Set(bet.stakes?.map(stake => stake.userId) || []).size;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if (amount > 0) {
      stakeBet(bet.betId, selectedOutcome, amount);
      setStakeAmount('');
      setShowStakeForm(false);
    }
  };

  const handleResolve = (winningOutcome) => {
    resolveBet(bet.betId, winningOutcome);
  };

  const isExpired = new Date(bet.endTime) < new Date();
  const canResolve = isExpired && bet.status === 'open';

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{bet.description}</h3>
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Ends {formatDate(bet.endTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{uniqueStakers} stakers</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{totalStaked} USDC</span>
            </div>
          </div>
        </div>
        
        {bet.status === 'resolved' && (
          <div className="flex items-center space-x-1 text-accent">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Resolved</span>
          </div>
        )}
      </div>

      {/* Outcomes */}
      <div className="space-y-3 mb-4">
        {bet.outcomeOptions.map((outcome, index) => {
          const outcomeStakes = bet.stakes?.filter(stake => stake.chosenOutcome === outcome) || [];
          const outcomeTotal = outcomeStakes.reduce((sum, stake) => sum + stake.amount, 0);
          const percentage = totalStaked > 0 ? (outcomeTotal / totalStaked * 100).toFixed(1) : 0;
          
          return (
            <div 
              key={index}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                bet.status === 'resolved' && bet.winningOutcome === outcome
                  ? 'bg-accent/20 border-accent text-white'
                  : userStake?.chosenOutcome === outcome
                  ? 'bg-primary/20 border-primary text-white'
                  : 'bg-white/5 border-white/20 text-white/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{outcome}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{outcomeTotal} USDC</div>
                  <div className="text-xs opacity-70">{percentage}%</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 bg-white/10 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    bet.status === 'resolved' && bet.winningOutcome === outcome
                      ? 'bg-accent'
                      : userStake?.chosenOutcome === outcome
                      ? 'bg-primary'
                      : 'bg-white/30'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* User's stake info */}
      {userStake && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
          <div className="text-sm text-white">
            Your stake: <span className="font-semibold">{userStake.amount} USDC</span> on{' '}
            <span className="font-semibold">{userStake.chosenOutcome}</span>
            {userStake.isWinner && bet.status === 'resolved' && (
              <span className="ml-2 text-accent font-semibold">🎉 Winner!</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {bet.status === 'open' && !isExpired && !userStake && (
        <div className="space-y-3">
          {!showStakeForm ? (
            <Button 
              onClick={() => setShowStakeForm(true)}
              className="w-full"
              variant="accent"
            >
              Place Stake
            </Button>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {bet.outcomeOptions.map((outcome, index) => (
                  <option key={index} value={outcome} className="text-gray-900">
                    {outcome}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Stake amount (USDC)"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
                step="0.01"
              />
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="flex-1"
                  variant="accent"
                >
                  Confirm Stake
                </Button>
                <Button
                  onClick={() => setShowStakeForm(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution actions */}
      {canResolve && (
        <div className="space-y-3">
          <p className="text-sm text-white/70 text-center">Bet has ended - resolve the outcome:</p>
          <div className="grid grid-cols-1 gap-2">
            {bet.outcomeOptions.map((outcome, index) => (
              <Button
                key={index}
                onClick={() => handleResolve(outcome)}
                variant="primary"
                size="sm"
              >
                {outcome} Won
              </Button>
            ))}
          </div>
        </div>
      )}

      {isExpired && bet.status === 'open' && !canResolve && (
        <div className="text-center text-white/60 text-sm">
          Waiting for resolution...
        </div>
      )}
    </div>
  );
}