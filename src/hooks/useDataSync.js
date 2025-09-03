import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { blockchainService } from '../services/blockchainService';
import { supabaseService } from '../services/supabaseService';

/**
 * Hook for synchronizing data between blockchain and Supabase
 * @returns {Object} Data sync methods and state
 */
export function useDataSync() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Reset error when account changes
  useEffect(() => {
    setError(null);
  }, [address]);

  /**
   * Syncs a bet from blockchain to Supabase
   * @param {string} betAddress - Address of the bet contract
   * @returns {Promise<Object>} - Synced bet data
   */
  const syncBet = async (betAddress) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get bet details from blockchain
      const betDetails = await blockchainService.getBetDetails(betAddress);
      if (!betDetails) {
        throw new Error('Bet not found on blockchain');
      }

      // Get outcome options
      const outcomeOptions = await blockchainService.getOutcomeOptions(betAddress);

      // Format bet data for Supabase
      const betData = {
        betId: betAddress,
        creatorId: betDetails.creator,
        description: betDetails.description,
        outcomeOptions,
        status: betDetails.status.toLowerCase(),
        startTime: new Date().toISOString(), // Not available from contract, use current time
        endTime: betDetails.endTime.toISOString(),
        creationFeePaid: 1, // Default value, not directly available from contract
        winningOutcome: betDetails.winningOutcome || null,
        totalStaked: parseFloat(betDetails.totalStaked)
      };

      // Sync to Supabase
      const syncedBet = await supabaseService.syncBet(betData);
      setLastSyncTime(new Date());
      return syncedBet;
    } catch (err) {
      setError(err.message || 'Failed to sync bet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Syncs all bets from blockchain to Supabase
   * @returns {Promise<Array>} - Array of synced bet data
   */
  const syncAllBets = async () => {
    if (!isConnected) {
      setError('Wallet not connected');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all bet addresses from blockchain
      const betAddresses = await blockchainService.getAllBets();
      
      // Sync each bet
      const syncPromises = betAddresses.map(syncBet);
      const syncedBets = await Promise.all(syncPromises);
      
      setLastSyncTime(new Date());
      return syncedBets.filter(bet => bet !== null);
    } catch (err) {
      setError(err.message || 'Failed to sync all bets');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Syncs user stakes for a specific bet
   * @param {string} betAddress - Address of the bet contract
   * @returns {Promise<Array>} - Array of synced stake data
   */
  const syncUserStakes = async (betAddress) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user stakes from blockchain
      const stakes = await blockchainService.getUserStakes(betAddress, address);
      
      // Sync each stake to Supabase
      const syncPromises = stakes.map(async (stake) => {
        const stakeData = {
          stakeId: `${betAddress}-${stake.staker}-${Date.now()}`, // Generate a unique ID
          betId: betAddress,
          userId: stake.staker,
          chosenOutcome: stake.outcome,
          amount: parseFloat(stake.amount),
          isWinner: stake.claimed, // If claimed, it must be a winner
          payoutTimestamp: stake.claimed ? new Date().toISOString() : null
        };
        
        return await supabaseService.syncStake(stakeData);
      });
      
      const syncedStakes = await Promise.all(syncPromises);
      setLastSyncTime(new Date());
      return syncedStakes.filter(stake => stake !== null);
    } catch (err) {
      setError(err.message || 'Failed to sync user stakes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Syncs user profile to Supabase
   * @returns {Promise<Object>} - Synced user data
   */
  const syncUserProfile = async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user exists in Supabase
      let user = await supabaseService.getUser(address);
      
      if (!user) {
        // Create new user if not exists
        user = await supabaseService.createUser(address, `user_${address.substring(2, 8)}`);
      }
      
      setLastSyncTime(new Date());
      return user;
    } catch (err) {
      setError(err.message || 'Failed to sync user profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    lastSyncTime,
    syncBet,
    syncAllBets,
    syncUserStakes,
    syncUserProfile
  };
}

export default useDataSync;

