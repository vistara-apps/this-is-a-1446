/**
 * Service for interacting with Farcaster API
 * Uses Neynar API for Farcaster integration
 */
export const farcasterService = {
  // Neynar API key - would be environment variable in production
  apiKey: 'NEYNAR_API_KEY',
  baseUrl: 'https://api.neynar.com/v2',

  /**
   * Makes a request to the Neynar API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'api_key': this.apiKey,
        ...options.headers
      };

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Farcaster API request failed:', error);
      throw error;
    }
  },

  /**
   * Gets a user by their Farcaster ID
   * @param {string} fid - Farcaster ID
   * @returns {Promise<Object>} - User profile
   */
  async getUserByFid(fid) {
    try {
      const response = await this.makeRequest(`/user?fid=${fid}`);
      return response.result.user;
    } catch (error) {
      console.error('Error getting user by FID:', error);
      throw error;
    }
  },

  /**
   * Gets a user by their username
   * @param {string} username - Farcaster username
   * @returns {Promise<Object>} - User profile
   */
  async getUserByUsername(username) {
    try {
      const response = await this.makeRequest(`/user?username=${username}`);
      return response.result.user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  /**
   * Gets a user by their Ethereum address
   * @param {string} address - Ethereum address
   * @returns {Promise<Object>} - User profile
   */
  async getUserByAddress(address) {
    try {
      const response = await this.makeRequest(`/user?address=${address}`);
      return response.result.user;
    } catch (error) {
      console.error('Error getting user by address:', error);
      throw error;
    }
  },

  /**
   * Posts a cast (message) to Farcaster
   * @param {string} signerUuid - Signer UUID from Neynar
   * @param {string} text - Cast text
   * @param {Object} options - Additional options
   * @param {string} options.embeds - Embeds for the cast
   * @param {string} options.parentHash - Parent cast hash for replies
   * @returns {Promise<Object>} - Posted cast
   */
  async postCast(signerUuid, text, options = {}) {
    try {
      const body = {
        signer_uuid: signerUuid,
        text
      };

      if (options.embeds) {
        body.embeds = options.embeds;
      }

      if (options.parentHash) {
        body.parent = { hash: options.parentHash };
      }

      const response = await this.makeRequest('/casts', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      return response.result.cast;
    } catch (error) {
      console.error('Error posting cast:', error);
      throw error;
    }
  },

  /**
   * Creates a signer for a user
   * @param {string} fid - Farcaster ID
   * @param {string} deadline - Deadline timestamp
   * @returns {Promise<Object>} - Signer details
   */
  async createSigner(fid, deadline) {
    try {
      const response = await this.makeRequest('/signer', {
        method: 'POST',
        body: JSON.stringify({
          fid,
          deadline: deadline || Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
        })
      });

      return response.result;
    } catch (error) {
      console.error('Error creating signer:', error);
      throw error;
    }
  },

  /**
   * Shares a bet on Farcaster
   * @param {string} signerUuid - Signer UUID from Neynar
   * @param {Object} bet - Bet details
   * @param {string} betUrl - URL to the bet
   * @returns {Promise<Object>} - Posted cast
   */
  async shareBet(signerUuid, bet, betUrl) {
    try {
      const text = `I just created a new bet on BetBase: "${bet.description}"\n\nPlace your stakes now! 🎲`;
      
      const embeds = [{
        url: betUrl
      }];

      return await this.postCast(signerUuid, text, { embeds });
    } catch (error) {
      console.error('Error sharing bet:', error);
      throw error;
    }
  },

  /**
   * Shares a winning bet on Farcaster
   * @param {string} signerUuid - Signer UUID from Neynar
   * @param {Object} bet - Bet details
   * @param {string} betUrl - URL to the bet
   * @returns {Promise<Object>} - Posted cast
   */
  async shareWin(signerUuid, bet, betUrl) {
    try {
      const text = `I just won a bet on BetBase! 🎉\n\nThe bet: "${bet.description}"\nMy winning outcome: ${bet.winningOutcome}`;
      
      const embeds = [{
        url: betUrl
      }];

      return await this.postCast(signerUuid, text, { embeds });
    } catch (error) {
      console.error('Error sharing win:', error);
      throw error;
    }
  },

  /**
   * Gets trending bets from Farcaster
   * @returns {Promise<Array>} - Array of trending bets
   */
  async getTrendingBets() {
    try {
      // This would be implemented by searching for casts with BetBase URLs
      // and aggregating the most engaged-with bets
      // For now, return a placeholder
      return [];
    } catch (error) {
      console.error('Error getting trending bets:', error);
      throw error;
    }
  },

  /**
   * Gets friends' bets from Farcaster
   * @param {string} fid - Farcaster ID
   * @returns {Promise<Array>} - Array of friends' bets
   */
  async getFriendsBets(fid) {
    try {
      // This would be implemented by getting the user's following list
      // and then finding bets created by those users
      // For now, return a placeholder
      return [];
    } catch (error) {
      console.error('Error getting friends\' bets:', error);
      throw error;
    }
  }
};

export default farcasterService;

