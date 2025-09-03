import { parseUnits, formatUnits } from 'viem';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { betFactoryAbi } from '../abis/betFactoryAbi';
import { betAbi } from '../abis/betAbi';
import { erc20Abi } from '../abis/erc20Abi';

// Contract addresses - would be environment variables in production
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
const BET_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890'; // Example address, replace with actual deployed contract

/**
 * Service for interacting with blockchain contracts
 */
export const blockchainService = {
  /**
   * Creates a new bet through the BetFactory contract
   * @param {string} description - Description of the bet
   * @param {string[]} outcomeOptions - Array of possible outcomes
   * @param {Date} endTime - End time of the bet
   * @param {number} winningFeePercentage - Fee percentage in basis points (100 = 1%)
   * @param {function} onSuccess - Callback for successful transaction
   * @param {function} onError - Callback for transaction error
   * @returns {Promise<string>} - Address of the created bet contract
   */
  async createBet(description, outcomeOptions, endTime, winningFeePercentage, onSuccess, onError) {
    try {
      const { write } = useContractWrite({
        address: BET_FACTORY_ADDRESS,
        abi: betFactoryAbi,
        functionName: 'createBet',
        args: [
          description,
          outcomeOptions,
          Math.floor(endTime.getTime() / 1000), // Convert to Unix timestamp
          winningFeePercentage
        ],
        onSuccess,
        onError
      });
      
      return write();
    } catch (error) {
      console.error('Error creating bet:', error);
      throw error;
    }
  },

  /**
   * Approves USDC spending for the BetFactory contract
   * @param {number} amount - Amount to approve in USDC
   * @param {function} onSuccess - Callback for successful transaction
   * @param {function} onError - Callback for transaction error
   * @returns {Promise<boolean>} - Success status
   */
  async approveUSDC(amount, onSuccess, onError) {
    try {
      const amountInWei = parseUnits(amount.toString(), 6); // USDC has 6 decimals
      
      const { write } = useContractWrite({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [BET_FACTORY_ADDRESS, amountInWei],
        onSuccess,
        onError
      });
      
      return write();
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  },

  /**
   * Places a stake on a bet
   * @param {string} betAddress - Address of the bet contract
   * @param {string} outcome - Outcome to stake on
   * @param {number} amount - Amount to stake in USDC
   * @param {function} onSuccess - Callback for successful transaction
   * @param {function} onError - Callback for transaction error
   * @returns {Promise<boolean>} - Success status
   */
  async placeStake(betAddress, outcome, amount, onSuccess, onError) {
    try {
      // First approve USDC spending for the bet contract
      const amountInWei = parseUnits(amount.toString(), 6);
      
      const { write: approveWrite } = useContractWrite({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [betAddress, amountInWei]
      });
      
      const approvalTx = await approveWrite();
      
      // Wait for approval transaction to complete
      const { isSuccess: isApprovalSuccess } = useWaitForTransaction({
        hash: approvalTx.hash
      });
      
      if (!isApprovalSuccess) {
        throw new Error('USDC approval failed');
      }
      
      // Now place the stake
      const { write: stakeWrite } = useContractWrite({
        address: betAddress,
        abi: betAbi,
        functionName: 'placeStake',
        args: [outcome, amountInWei],
        onSuccess,
        onError
      });
      
      return stakeWrite();
    } catch (error) {
      console.error('Error placing stake:', error);
      throw error;
    }
  },

  /**
   * Resolves a bet with a winning outcome
   * @param {string} betAddress - Address of the bet contract
   * @param {string} winningOutcome - The winning outcome
   * @param {function} onSuccess - Callback for successful transaction
   * @param {function} onError - Callback for transaction error
   * @returns {Promise<boolean>} - Success status
   */
  async resolveBet(betAddress, winningOutcome, onSuccess, onError) {
    try {
      const { write } = useContractWrite({
        address: betAddress,
        abi: betAbi,
        functionName: 'resolveBet',
        args: [winningOutcome],
        onSuccess,
        onError
      });
      
      return write();
    } catch (error) {
      console.error('Error resolving bet:', error);
      throw error;
    }
  },

  /**
   * Claims payout for a winning stake
   * @param {string} betAddress - Address of the bet contract
   * @param {function} onSuccess - Callback for successful transaction
   * @param {function} onError - Callback for transaction error
   * @returns {Promise<number>} - Amount claimed
   */
  async claimPayout(betAddress, onSuccess, onError) {
    try {
      const { write } = useContractWrite({
        address: betAddress,
        abi: betAbi,
        functionName: 'claimPayout',
        onSuccess,
        onError
      });
      
      return write();
    } catch (error) {
      console.error('Error claiming payout:', error);
      throw error;
    }
  },

  /**
   * Gets all bets from the factory
   * @returns {Promise<string[]>} - Array of bet addresses
   */
  async getAllBets() {
    try {
      const { data } = useContractRead({
        address: BET_FACTORY_ADDRESS,
        abi: betFactoryAbi,
        functionName: 'getAllBets'
      });
      
      return data || [];
    } catch (error) {
      console.error('Error getting all bets:', error);
      throw error;
    }
  },

  /**
   * Gets bet details
   * @param {string} betAddress - Address of the bet contract
   * @returns {Promise<Object>} - Bet details
   */
  async getBetDetails(betAddress) {
    try {
      const { data } = useContractRead({
        address: betAddress,
        abi: betAbi,
        functionName: 'getBetDetails'
      });
      
      if (!data) return null;
      
      const [creator, description, endTime, status, winningOutcome, totalStaked] = data;
      
      return {
        creator,
        description,
        endTime: new Date(Number(endTime) * 1000), // Convert from Unix timestamp
        status: ['Open', 'InProgress', 'Resolved'][status], // Convert from enum
        winningOutcome,
        totalStaked: formatUnits(totalStaked, 6) // Convert from wei to USDC
      };
    } catch (error) {
      console.error('Error getting bet details:', error);
      throw error;
    }
  },

  /**
   * Gets outcome options for a bet
   * @param {string} betAddress - Address of the bet contract
   * @returns {Promise<string[]>} - Array of outcome options
   */
  async getOutcomeOptions(betAddress) {
    try {
      const { data } = useContractRead({
        address: betAddress,
        abi: betAbi,
        functionName: 'getOutcomeOptions'
      });
      
      return data || [];
    } catch (error) {
      console.error('Error getting outcome options:', error);
      throw error;
    }
  },

  /**
   * Gets stakes for a specific user
   * @param {string} betAddress - Address of the bet contract
   * @param {string} userAddress - Address of the user
   * @returns {Promise<Array>} - Array of stake details
   */
  async getUserStakes(betAddress, userAddress) {
    try {
      // Get stake indices for the user
      const { data: stakeIndices } = useContractRead({
        address: betAddress,
        abi: betAbi,
        functionName: 'getStakesByStaker',
        args: [userAddress]
      });
      
      if (!stakeIndices || stakeIndices.length === 0) return [];
      
      // Get details for each stake
      const stakes = await Promise.all(stakeIndices.map(async (index) => {
        const { data: stakeDetails } = useContractRead({
          address: betAddress,
          abi: betAbi,
          functionName: 'getStakeDetails',
          args: [index]
        });
        
        if (!stakeDetails) return null;
        
        const [staker, outcome, amount, claimed] = stakeDetails;
        
        return {
          staker,
          outcome,
          amount: formatUnits(amount, 6), // Convert from wei to USDC
          claimed
        };
      }));
      
      return stakes.filter(stake => stake !== null);
    } catch (error) {
      console.error('Error getting user stakes:', error);
      throw error;
    }
  },

  /**
   * Gets USDC balance for a user
   * @param {string} userAddress - Address of the user
   * @returns {Promise<number>} - USDC balance
   */
  async getUSDCBalance(userAddress) {
    try {
      const { data } = useContractRead({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress]
      });
      
      return data ? formatUnits(data, 6) : 0; // Convert from wei to USDC
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw error;
    }
  }
};

export default blockchainService;

