import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Button } from './Button';
import { turnkeyService } from '../services/turnkeyService';

/**
 * Component for managing wallet and displaying wallet information
 */
export function WalletManager() {
  const { address, isConnected } = useAccount();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: selectedWallet?.address || address,
  });
  
  // Get USDC balance (would use a contract read in production)
  const [usdcBalance, setUsdcBalance] = useState('0');

  // Load user wallets when connected
  useEffect(() => {
    if (isConnected && address) {
      loadWallets();
    }
  }, [isConnected, address]);

  // Load wallets from Turnkey
  const loadWallets = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would use the user's ID from authentication
      // For now, use the connected wallet address as the user ID
      const userWallets = await turnkeyService.getUserWallets(address);
      setWallets(userWallets);
      
      if (userWallets.length > 0) {
        setSelectedWallet(userWallets[0]);
      }
    } catch (err) {
      console.error('Error loading wallets:', err);
      setError('Failed to load wallets');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new wallet
  const createWallet = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const walletName = `BetBase Wallet ${wallets.length + 1}`;
      const newWallet = await turnkeyService.createWallet(address, walletName);
      
      setWallets([...wallets, newWallet]);
      setSelectedWallet(newWallet);
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
        <p className="text-white text-center mb-4">Connect your wallet to manage your BetBase wallets</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
      <h2 className="text-xl font-semibold text-white mb-6">Wallet Manager</h2>
      
      {/* Connected wallet info */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Connected Wallet</h3>
        <div className="bg-white/5 rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70">Address:</span>
            <span className="text-white font-mono">{formatAddress(address)}</span>
          </div>
          {ethBalance && (
            <div className="flex items-center justify-between">
              <span className="text-white/70">ETH Balance:</span>
              <span className="text-white">{parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Turnkey wallets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">BetBase Wallets</h3>
          <Button 
            onClick={createWallet} 
            variant="secondary" 
            size="sm"
            disabled={isLoading}
          >
            Create Wallet
          </Button>
        </div>
        
        {isLoading ? (
          <p className="text-white/70 text-center py-4">Loading wallets...</p>
        ) : error ? (
          <p className="text-red-300 text-center py-4">{error}</p>
        ) : wallets.length === 0 ? (
          <p className="text-white/70 text-center py-4">No BetBase wallets found. Create one to get started!</p>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div 
                key={wallet.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedWallet?.id === wallet.id
                    ? 'bg-primary/20 border-primary'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{wallet.name}</span>
                  {selectedWallet?.id === wallet.id && (
                    <span className="text-xs bg-primary/30 text-white px-2 py-1 rounded-full">Selected</span>
                  )}
                </div>
                <div className="text-white/70 font-mono text-sm">{formatAddress(wallet.address)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected wallet details */}
      {selectedWallet && (
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Selected Wallet Details</h3>
          <div className="bg-white/5 rounded-lg p-4 border border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-white/70 block mb-1">Name:</span>
                <span className="text-white">{selectedWallet.name}</span>
              </div>
              <div>
                <span className="text-white/70 block mb-1">Type:</span>
                <span className="text-white">Smart Wallet</span>
              </div>
              <div>
                <span className="text-white/70 block mb-1">Address:</span>
                <span className="text-white font-mono">{formatAddress(selectedWallet.address)}</span>
              </div>
              <div>
                <span className="text-white/70 block mb-1">USDC Balance:</span>
                <span className="text-white">{usdcBalance} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

