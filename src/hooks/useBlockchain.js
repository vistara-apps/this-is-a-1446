import { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { blockchainService } from '../services/blockchainService';

/**
 * Hook for interacting with blockchain functionality
 * @returns {Object} Blockchain methods and state
 */
export function useBlockchain() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);

  // Reset error when account or chain changes
  useEffect(() => {
    setError(null);
  }, [address, chain]);

  /**
   * Creates a new bet
   * @param {Object} betData - Bet data
   * @returns {Promise<string>} - Address of the created bet contract
   */
  const createBet = async (betData) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First approve USDC for the creation fee
      await blockchainService.approveUSDC(
        betData.creationFee,
        (tx) => setTransaction(tx),
        (err) => setError(err.message)
      );

      // Then create the bet
      const result = await blockchainService.createBet(
        betData.description,
        betData.outcomeOptions,
        new Date(betData.endTime),
        betData.winningFeePercentage || 100, // Default to 1%
        (tx) => setTransaction(tx),
        (err) => setError(err.message)
      );

      return result;
    } catch (err) {
      setError(err.message || 'Failed to create bet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Places a stake on a bet
   * @param {string} betAddress - Address of the bet contract
   * @param {string} outcome - Outcome to stake on
   * @param {number} amount - Amount to stake
   * @returns {Promise<boolean>} - Success status
   */
  const placeStake = async (betAddress, outcome, amount) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.placeStake(
        betAddress,
        outcome,
        amount,
        (tx) => setTransaction(tx),
        (err) => setError(err.message)
      );

      return result;
    } catch (err) {
      setError(err.message || 'Failed to place stake');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resolves a bet
   * @param {string} betAddress - Address of the bet contract
   * @param {string} winningOutcome - Winning outcome
   * @returns {Promise<boolean>} - Success status
   */
  const resolveBet = async (betAddress, winningOutcome) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.resolveBet(
        betAddress,
        winningOutcome,
        (tx) => setTransaction(tx),
        (err) => setError(err.message)
      );

      return result;
    } catch (err) {
      setError(err.message || 'Failed to resolve bet');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Claims payout for a winning stake
   * @param {string} betAddress - Address of the bet contract
   * @returns {Promise<number>} - Amount claimed
   */
  const claimPayout = async (betAddress) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return 0;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.claimPayout(
        betAddress,
        (tx) => setTransaction(tx),
        (err) => setError(err.message)
      );

      return result;
    } catch (err) {
      setError(err.message || 'Failed to claim payout');
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets USDC balance for the connected wallet
   * @returns {Promise<number>} - USDC balance
   */
  const getUSDCBalance = async () => {
    if (!isConnected) {
      setError('Wallet not connected');
      return 0;
    }

    try {
      return await blockchainService.getUSDCBalance(address);
    } catch (err) {
      setError(err.message || 'Failed to get USDC balance');
      return 0;
    }
  };

  return {
    isConnected,
    address,
    chain,
    isLoading,
    error,
    transaction,
    createBet,
    placeStake,
    resolveBet,
    claimPayout,
    getUSDCBalance
  };
}

export default useBlockchain;

