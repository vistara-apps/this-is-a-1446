import { createClient } from '@supabase/supabase-js';

// Supabase configuration - would be environment variables in production
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Service for interacting with Supabase
 */
export const supabaseService = {
  /**
   * Creates a new user profile
   * @param {string} userId - User ID (farcaster ID or wallet address)
   * @param {string} username - Username
   * @returns {Promise<Object>} - Created user profile
   */
  async createUser(userId, username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            userId, 
            username, 
            createdAt: new Date().toISOString() 
          }
        ])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Gets a user profile by ID
   * @param {string} userId - User ID (farcaster ID or wallet address)
   * @returns {Promise<Object>} - User profile
   */
  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Creates a new bet record
   * @param {Object} bet - Bet data
   * @returns {Promise<Object>} - Created bet record
   */
  async createBet(bet) {
    try {
      const { data, error } = await supabase
        .from('bets')
        .insert([bet])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating bet:', error);
      throw error;
    }
  },

  /**
   * Updates a bet record
   * @param {string} betId - Bet ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated bet record
   */
  async updateBet(betId, updates) {
    try {
      const { data, error } = await supabase
        .from('bets')
        .update(updates)
        .eq('betId', betId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating bet:', error);
      throw error;
    }
  },

  /**
   * Gets a bet by ID
   * @param {string} betId - Bet ID
   * @returns {Promise<Object>} - Bet record
   */
  async getBet(betId) {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*, stakes(*)')
        .eq('betId', betId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting bet:', error);
      throw error;
    }
  },

  /**
   * Gets all bets
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status (open, in_progress, resolved)
   * @param {string} options.creatorId - Filter by creator ID
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of bet records
   */
  async getBets(options = {}) {
    try {
      let query = supabase
        .from('bets')
        .select('*, stakes(*)');
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.creatorId) {
        query = query.eq('creatorId', options.creatorId);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting bets:', error);
      throw error;
    }
  },

  /**
   * Creates a new stake record
   * @param {Object} stake - Stake data
   * @returns {Promise<Object>} - Created stake record
   */
  async createStake(stake) {
    try {
      const { data, error } = await supabase
        .from('stakes')
        .insert([stake])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating stake:', error);
      throw error;
    }
  },

  /**
   * Updates a stake record
   * @param {string} stakeId - Stake ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated stake record
   */
  async updateStake(stakeId, updates) {
    try {
      const { data, error } = await supabase
        .from('stakes')
        .update(updates)
        .eq('stakeId', stakeId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating stake:', error);
      throw error;
    }
  },

  /**
   * Gets stakes by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of stake records
   */
  async getStakesByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('stakes')
        .select('*, bets(*)')
        .eq('userId', userId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting stakes by user:', error);
      throw error;
    }
  },

  /**
   * Gets stakes by bet ID
   * @param {string} betId - Bet ID
   * @returns {Promise<Array>} - Array of stake records
   */
  async getStakesByBet(betId) {
    try {
      const { data, error } = await supabase
        .from('stakes')
        .select('*')
        .eq('betId', betId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting stakes by bet:', error);
      throw error;
    }
  },

  /**
   * Gets user betting statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStats(userId) {
    try {
      // Get all stakes by the user
      const { data: stakes, error: stakesError } = await supabase
        .from('stakes')
        .select('*')
        .eq('userId', userId);
      
      if (stakesError) throw stakesError;
      
      // Calculate statistics
      const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0);
      const winningStakes = stakes.filter(stake => stake.isWinner);
      const totalWinnings = winningStakes.reduce((sum, stake) => sum + stake.amount, 0);
      const winRate = stakes.length > 0 ? (winningStakes.length / stakes.length) * 100 : 0;
      
      return {
        totalStaked,
        totalWinnings,
        winRate,
        netPnL: totalWinnings - totalStaked,
        totalBets: stakes.length,
        totalWins: winningStakes.length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  /**
   * Syncs a bet from blockchain to Supabase
   * @param {Object} betData - Bet data from blockchain
   * @returns {Promise<Object>} - Synced bet record
   */
  async syncBet(betData) {
    try {
      // Check if bet exists
      const { data: existingBet, error: getBetError } = await supabase
        .from('bets')
        .select('*')
        .eq('betId', betData.betId)
        .single();
      
      if (getBetError && getBetError.code !== 'PGRST116') throw getBetError;
      
      if (existingBet) {
        // Update existing bet
        const { data, error } = await supabase
          .from('bets')
          .update(betData)
          .eq('betId', betData.betId)
          .select();
        
        if (error) throw error;
        return data[0];
      } else {
        // Create new bet
        const { data, error } = await supabase
          .from('bets')
          .insert([betData])
          .select();
        
        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error syncing bet:', error);
      throw error;
    }
  },

  /**
   * Syncs a stake from blockchain to Supabase
   * @param {Object} stakeData - Stake data from blockchain
   * @returns {Promise<Object>} - Synced stake record
   */
  async syncStake(stakeData) {
    try {
      // Check if stake exists
      const { data: existingStake, error: getStakeError } = await supabase
        .from('stakes')
        .select('*')
        .eq('stakeId', stakeData.stakeId)
        .single();
      
      if (getStakeError && getStakeError.code !== 'PGRST116') throw getStakeError;
      
      if (existingStake) {
        // Update existing stake
        const { data, error } = await supabase
          .from('stakes')
          .update(stakeData)
          .eq('stakeId', stakeData.stakeId)
          .select();
        
        if (error) throw error;
        return data[0];
      } else {
        // Create new stake
        const { data, error } = await supabase
          .from('stakes')
          .insert([stakeData])
          .select();
        
        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error syncing stake:', error);
      throw error;
    }
  }
};

export default supabaseService;

