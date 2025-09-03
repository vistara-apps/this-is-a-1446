/**
 * Service for interacting with Turnkey API
 * Handles wallet creation and management
 */
export const turnkeyService = {
  // Turnkey API configuration - would be environment variables in production
  apiUrl: 'https://api.turnkey.com',
  organizationId: 'YOUR_ORGANIZATION_ID',
  apiKey: 'YOUR_API_KEY',

  /**
   * Makes a request to the Turnkey API
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(endpoint, body = {}, options = {}) {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Organization-Id': this.organizationId,
        ...options.headers
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        ...options
      });

      if (!response.ok) {
        throw new Error(`Turnkey API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Turnkey API request failed:', error);
      throw error;
    }
  },

  /**
   * Creates a new wallet for a user
   * @param {string} userId - User ID
   * @param {string} walletName - Name for the wallet
   * @returns {Promise<Object>} - Created wallet details
   */
  async createWallet(userId, walletName) {
    try {
      const response = await this.makeRequest('/v1/wallets/create', {
        userId,
        walletName,
        type: 'EOA', // Externally Owned Account
        curve: 'SECP256K1' // Standard Ethereum curve
      });

      return response.wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  /**
   * Gets a wallet by ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} - Wallet details
   */
  async getWallet(walletId) {
    try {
      const response = await this.makeRequest('/v1/wallets/get', {
        walletId
      });

      return response.wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  },

  /**
   * Gets all wallets for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of wallet details
   */
  async getUserWallets(userId) {
    try {
      const response = await this.makeRequest('/v1/wallets/list', {
        userId
      });

      return response.wallets;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  },

  /**
   * Signs a transaction using a wallet
   * @param {string} walletId - Wallet ID
   * @param {Object} transaction - Transaction to sign
   * @returns {Promise<Object>} - Signed transaction
   */
  async signTransaction(walletId, transaction) {
    try {
      const response = await this.makeRequest('/v1/transactions/sign', {
        walletId,
        transaction
      });

      return response.signedTransaction;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  },

  /**
   * Sends a transaction using a wallet
   * @param {string} walletId - Wallet ID
   * @param {Object} transaction - Transaction to send
   * @returns {Promise<Object>} - Transaction receipt
   */
  async sendTransaction(walletId, transaction) {
    try {
      const response = await this.makeRequest('/v1/transactions/send', {
        walletId,
        transaction
      });

      return response.receipt;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  },

  /**
   * Creates and sends a transaction in one step
   * @param {string} walletId - Wallet ID
   * @param {Object} transaction - Transaction to send
   * @returns {Promise<Object>} - Transaction receipt
   */
  async createAndSendTransaction(walletId, transaction) {
    try {
      // Sign the transaction
      const signedTx = await this.signTransaction(walletId, transaction);
      
      // Send the signed transaction
      return await this.makeRequest('/v1/transactions/broadcast', {
        signedTransaction: signedTx
      });
    } catch (error) {
      console.error('Error creating and sending transaction:', error);
      throw error;
    }
  },

  /**
   * Gets the address for a wallet
   * @param {string} walletId - Wallet ID
   * @returns {Promise<string>} - Wallet address
   */
  async getWalletAddress(walletId) {
    try {
      const wallet = await this.getWallet(walletId);
      return wallet.address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw error;
    }
  },

  /**
   * Creates a session for a wallet
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} - Session details
   */
  async createSession(walletId) {
    try {
      const response = await this.makeRequest('/v1/sessions/create', {
        walletId
      });

      return response.session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  /**
   * Refreshes a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Refreshed session details
   */
  async refreshSession(sessionId) {
    try {
      const response = await this.makeRequest('/v1/sessions/refresh', {
        sessionId
      });

      return response.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  },

  /**
   * Revokes a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} - Success status
   */
  async revokeSession(sessionId) {
    try {
      await this.makeRequest('/v1/sessions/revoke', {
        sessionId
      });

      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }
};

export default turnkeyService;

