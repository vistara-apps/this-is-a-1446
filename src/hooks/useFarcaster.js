import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { farcasterService } from '../services/farcasterService';

/**
 * Hook for interacting with Farcaster functionality
 * @returns {Object} Farcaster methods and state
 */
export function useFarcaster() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [farcasterUser, setFarcasterUser] = useState(null);
  const [signerUuid, setSignerUuid] = useState(null);

  // Reset error when account changes
  useEffect(() => {
    setError(null);
  }, [address]);

  /**
   * Connects a wallet to a Farcaster account
   * @param {string} fid - Farcaster ID
   * @returns {Promise<Object>} - Farcaster user data
   */
  const connectFarcaster = async (fid) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user by FID
      const user = await farcasterService.getUserByFid(fid);
      setFarcasterUser(user);

      // Create a signer for the user
      const signer = await farcasterService.createSigner(fid);
      setSignerUuid(signer.uuid);

      return user;
    } catch (err) {
      setError(err.message || 'Failed to connect Farcaster');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connects a wallet to a Farcaster account by username
   * @param {string} username - Farcaster username
   * @returns {Promise<Object>} - Farcaster user data
   */
  const connectFarcasterByUsername = async (username) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user by username
      const user = await farcasterService.getUserByUsername(username);
      setFarcasterUser(user);

      // Create a signer for the user
      const signer = await farcasterService.createSigner(user.fid);
      setSignerUuid(signer.uuid);

      return user;
    } catch (err) {
      setError(err.message || 'Failed to connect Farcaster');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Tries to connect a wallet to a Farcaster account by Ethereum address
   * @returns {Promise<Object>} - Farcaster user data
   */
  const connectFarcasterByAddress = async () => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user by Ethereum address
      const user = await farcasterService.getUserByAddress(address);
      setFarcasterUser(user);

      // Create a signer for the user
      const signer = await farcasterService.createSigner(user.fid);
      setSignerUuid(signer.uuid);

      return user;
    } catch (err) {
      setError(err.message || 'Failed to connect Farcaster');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Shares a bet on Farcaster
   * @param {Object} bet - Bet details
   * @param {string} betUrl - URL to the bet
   * @returns {Promise<Object>} - Posted cast
   */
  const shareBet = async (bet, betUrl) => {
    if (!farcasterUser || !signerUuid) {
      setError('Farcaster not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cast = await farcasterService.shareBet(signerUuid, bet, betUrl);
      return cast;
    } catch (err) {
      setError(err.message || 'Failed to share bet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Shares a winning bet on Farcaster
   * @param {Object} bet - Bet details
   * @param {string} betUrl - URL to the bet
   * @returns {Promise<Object>} - Posted cast
   */
  const shareWin = async (bet, betUrl) => {
    if (!farcasterUser || !signerUuid) {
      setError('Farcaster not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cast = await farcasterService.shareWin(signerUuid, bet, betUrl);
      return cast;
    } catch (err) {
      setError(err.message || 'Failed to share win');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets trending bets from Farcaster
   * @returns {Promise<Array>} - Array of trending bets
   */
  const getTrendingBets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const trendingBets = await farcasterService.getTrendingBets();
      return trendingBets;
    } catch (err) {
      setError(err.message || 'Failed to get trending bets');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets friends' bets from Farcaster
   * @returns {Promise<Array>} - Array of friends' bets
   */
  const getFriendsBets = async () => {
    if (!farcasterUser) {
      setError('Farcaster not connected');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const friendsBets = await farcasterService.getFriendsBets(farcasterUser.fid);
      return friendsBets;
    } catch (err) {
      setError(err.message || 'Failed to get friends\' bets');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    farcasterUser,
    signerUuid,
    connectFarcaster,
    connectFarcasterByUsername,
    connectFarcasterByAddress,
    shareBet,
    shareWin,
    getTrendingBets,
    getFriendsBets
  };
}

export default useFarcaster;

