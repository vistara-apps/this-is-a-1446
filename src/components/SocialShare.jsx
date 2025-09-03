import React, { useState } from 'react';
import { Button } from './Button';
import { useFarcaster } from '../hooks/useFarcaster';
import { Share, Check, AlertCircle } from 'lucide-react';

/**
 * Component for sharing bets on social platforms
 * @param {Object} props - Component props
 * @param {Object} props.bet - Bet details
 * @param {string} props.betUrl - URL to the bet
 */
export function SocialShare({ bet, betUrl }) {
  const { 
    farcasterUser, 
    shareBet, 
    shareWin,
    isLoading, 
    error 
  } = useFarcaster();
  
  const [isShared, setIsShared] = useState(false);
  const [shareError, setShareError] = useState(null);

  // Share bet on Farcaster
  const handleShareOnFarcaster = async () => {
    if (!farcasterUser) {
      setShareError('Connect your Farcaster account to share');
      return;
    }
    
    setShareError(null);
    
    try {
      await shareBet(bet, betUrl);
      setIsShared(true);
      
      // Reset shared status after 3 seconds
      setTimeout(() => {
        setIsShared(false);
      }, 3000);
    } catch (err) {
      console.error('Error sharing on Farcaster:', err);
      setShareError('Failed to share on Farcaster');
    }
  };

  // Share win on Farcaster
  const handleShareWinOnFarcaster = async () => {
    if (!farcasterUser) {
      setShareError('Connect your Farcaster account to share');
      return;
    }
    
    setShareError(null);
    
    try {
      await shareWin(bet, betUrl);
      setIsShared(true);
      
      // Reset shared status after 3 seconds
      setTimeout(() => {
        setIsShared(false);
      }, 3000);
    } catch (err) {
      console.error('Error sharing win on Farcaster:', err);
      setShareError('Failed to share on Farcaster');
    }
  };

  // Share on Twitter
  const handleShareOnTwitter = () => {
    const text = `I just ${bet.status === 'resolved' ? 'participated in' : 'created'} a bet on BetBase: "${bet.description}" 🎲`;
    const url = encodeURIComponent(betUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4 shadow-card">
      <h3 className="text-lg font-medium text-white mb-3">Share this Bet</h3>
      
      {shareError && (
        <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <p className="text-red-300 text-sm">{shareError}</p>
        </div>
      )}
      
      {isShared && (
        <div className="flex items-center space-x-2 bg-accent/20 border border-accent/30 rounded-lg p-3 mb-3">
          <Check className="w-5 h-5 text-accent" />
          <p className="text-accent text-sm">Successfully shared!</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {/* Farcaster share button */}
        <Button
          onClick={bet.status === 'resolved' && bet.winningOutcome ? handleShareWinOnFarcaster : handleShareOnFarcaster}
          disabled={isLoading || !farcasterUser}
          variant="secondary"
          className="flex items-center justify-center space-x-2"
        >
          <Share className="w-4 h-4" />
          <span>
            {bet.status === 'resolved' && bet.winningOutcome 
              ? 'Share Win on Farcaster' 
              : 'Share on Farcaster'}
          </span>
        </Button>
        
        {/* Twitter share button */}
        <Button
          onClick={handleShareOnTwitter}
          variant="secondary"
          className="flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share on Twitter</span>
        </Button>
        
        {/* Copy link button */}
        <Button
          onClick={() => {
            navigator.clipboard.writeText(betUrl);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 3000);
          }}
          variant="secondary"
          className="flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy Link</span>
        </Button>
      </div>
      
      {!farcasterUser && (
        <p className="text-white/60 text-xs mt-3 text-center">
          Connect your Farcaster account in your profile to share on Farcaster.
        </p>
      )}
    </div>
  );
}

