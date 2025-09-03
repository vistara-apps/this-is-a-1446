import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from './Button';
import { Input } from './Input';
import { useFarcaster } from '../hooks/useFarcaster';
import { supabaseService } from '../services/supabaseService';
import { LoadingIndicator } from './LoadingIndicator';

/**
 * Component for displaying and managing user profile
 */
export function UserProfile() {
  const { address, isConnected } = useAccount();
  const { 
    farcasterUser, 
    connectFarcasterByUsername, 
    connectFarcasterByAddress,
    isLoading: isFarcasterLoading,
    error: farcasterError
  } = useFarcaster();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [farcasterUsername, setFarcasterUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load user profile when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile();
    }
  }, [isConnected, address]);

  // Load user profile from Supabase
  const loadUserProfile = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userProfile = await supabaseService.getUser(address);
      setUser(userProfile);
      
      if (userProfile) {
        setUsername(userProfile.username || '');
      }
      
      // Try to connect Farcaster by address
      connectFarcasterByAddress().catch(() => {
        // Silently fail if no Farcaster account is linked
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async () => {
    if (!isConnected || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await supabaseService.updateUser(user.userId, {
        username
      });
      
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect Farcaster account
  const handleConnectFarcaster = async () => {
    if (!farcasterUsername) return;
    
    try {
      await connectFarcasterByUsername(farcasterUsername);
      setFarcasterUsername('');
    } catch (err) {
      console.error('Error connecting Farcaster:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
        <p className="text-white text-center mb-4">Connect your wallet to view your profile</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
        <LoadingIndicator text="Loading profile..." className="py-8" />
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
      <h2 className="text-xl font-semibold text-white mb-6">Your Profile</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {/* User info */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
        <div className="bg-white/5 rounded-lg p-4 border border-white/20">
          <div className="mb-4">
            <span className="text-white/70 block mb-1">Wallet Address:</span>
            <span className="text-white font-mono">{address}</span>
          </div>
          
          {isEditing ? (
            <div className="mb-4">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
              />
            </div>
          ) : (
            <div className="mb-4">
              <span className="text-white/70 block mb-1">Username:</span>
              <span className="text-white">{user?.username || 'Not set'}</span>
            </div>
          )}
          
          <div className="mb-4">
            <span className="text-white/70 block mb-1">Member Since:</span>
            <span className="text-white">
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : 'Unknown'}
            </span>
          </div>
          
          {isEditing ? (
            <div className="flex space-x-3">
              <Button onClick={updateProfile} variant="primary">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      
      {/* Farcaster integration */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Farcaster Integration</h3>
        
        {farcasterUser ? (
          <div className="bg-white/5 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              {farcasterUser.pfp && (
                <img 
                  src={farcasterUser.pfp.url} 
                  alt={farcasterUser.displayName} 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <div className="text-white font-medium">{farcasterUser.displayName}</div>
                <div className="text-white/70">@{farcasterUser.username}</div>
              </div>
            </div>
            <div className="text-white/70 text-sm">
              Your BetBase account is connected to your Farcaster profile. You can now share bets and interact with other users on Farcaster!
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-4 border border-white/20">
            <p className="text-white/70 mb-4">
              Connect your Farcaster account to share bets and interact with other users on Farcaster.
            </p>
            
            {farcasterError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{farcasterError}</p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your Farcaster username"
                value={farcasterUsername}
                onChange={(e) => setFarcasterUsername(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleConnectFarcaster} 
                disabled={!farcasterUsername || isFarcasterLoading}
                variant="primary"
              >
                {isFarcasterLoading ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

