# BetBase Integration Guide

This document provides guidance for integrating with the BetBase platform, including API usage, smart contract interactions, and best practices.

## Table of Contents

1. [Introduction](#introduction)
2. [Integration Options](#integration-options)
3. [API Integration](#api-integration)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Farcaster Integration](#farcaster-integration)
6. [Turnkey Integration](#turnkey-integration)
7. [Supabase Integration](#supabase-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Introduction

BetBase is a decentralized peer-to-peer betting platform built on the Base blockchain. It allows users to create betting markets, stake on outcomes, and receive payouts when they win. This guide will help you integrate your application with BetBase.

## Integration Options

There are several ways to integrate with BetBase:

1. **API Integration**: Use the BetBase API to interact with the platform
2. **Smart Contract Integration**: Interact directly with the BetBase smart contracts
3. **Farcaster Integration**: Use Farcaster for social features and user identity
4. **Turnkey Integration**: Use Turnkey for wallet management
5. **Supabase Integration**: Use Supabase for off-chain data storage

## API Integration

The BetBase API provides a RESTful interface for interacting with the platform. See the [API Documentation](./api.md) for detailed information on endpoints, parameters, and response formats.

### Authentication

All API requests require authentication using a JWT token. To obtain a token, users must authenticate through the BetBase platform.

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example: Fetching Bets

```javascript
async function fetchBets() {
  const response = await fetch('https://api.betbase.app/v1/bets', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.bets;
}
```

### Example: Creating a Bet

```javascript
async function createBet(description, outcomeOptions, endTime, winningFeePercentage) {
  const response = await fetch('https://api.betbase.app/v1/bets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description,
      outcomeOptions,
      endTime,
      winningFeePercentage
    })
  });
  
  const data = await response.json();
  return data;
}
```

## Smart Contract Integration

You can interact directly with the BetBase smart contracts using web3 libraries like ethers.js or web3.js. See the [Smart Contracts Documentation](./smart-contracts.md) for detailed information on contract functions, events, and parameters.

### Contract Addresses

- **BetFactory**: `0x1234567890123456789012345678901234567890` (example address)
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base USDC)

### Example: Creating a Bet

```javascript
import { ethers } from 'ethers';
import { betFactoryAbi } from './abis/betFactoryAbi';

async function createBet(description, outcomeOptions, endTime, winningFeePercentage) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  // First approve USDC spending
  const usdcContract = new ethers.Contract(
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    erc20Abi,
    signer
  );
  
  const betFactoryAddress = '0x1234567890123456789012345678901234567890';
  const creationFee = ethers.utils.parseUnits('1', 6); // 1 USDC (6 decimals)
  
  await usdcContract.approve(betFactoryAddress, creationFee);
  
  // Then create the bet
  const betFactory = new ethers.Contract(
    betFactoryAddress,
    betFactoryAbi,
    signer
  );
  
  const endTimeSeconds = Math.floor(new Date(endTime).getTime() / 1000);
  
  const tx = await betFactory.createBet(
    description,
    outcomeOptions,
    endTimeSeconds,
    winningFeePercentage
  );
  
  const receipt = await tx.wait();
  
  // Get the bet address from the event
  const betCreatedEvent = receipt.events.find(e => e.event === 'BetCreated');
  const betAddress = betCreatedEvent.args.betAddress;
  
  return betAddress;
}
```

### Example: Placing a Stake

```javascript
import { ethers } from 'ethers';
import { betAbi } from './abis/betAbi';

async function placeStake(betAddress, outcome, amount) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  // First approve USDC spending
  const usdcContract = new ethers.Contract(
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    erc20Abi,
    signer
  );
  
  const amountInWei = ethers.utils.parseUnits(amount.toString(), 6); // USDC has 6 decimals
  
  await usdcContract.approve(betAddress, amountInWei);
  
  // Then place the stake
  const betContract = new ethers.Contract(
    betAddress,
    betAbi,
    signer
  );
  
  const tx = await betContract.placeStake(outcome, amountInWei);
  await tx.wait();
  
  return true;
}
```

## Farcaster Integration

BetBase integrates with Farcaster for social features and user identity. You can use the Farcaster API to enhance your BetBase integration.

### Authentication

To authenticate with Farcaster, you need to use the Neynar API. See the [Farcaster Documentation](https://docs.farcaster.xyz) for more information.

### Example: Connecting a Farcaster Account

```javascript
import { farcasterService } from './services/farcasterService';

async function connectFarcasterAccount(username) {
  try {
    const user = await farcasterService.getUserByUsername(username);
    const signer = await farcasterService.createSigner(user.fid);
    
    return {
      user,
      signerUuid: signer.uuid
    };
  } catch (error) {
    console.error('Error connecting Farcaster account:', error);
    throw error;
  }
}
```

### Example: Sharing a Bet on Farcaster

```javascript
import { farcasterService } from './services/farcasterService';

async function shareBetOnFarcaster(signerUuid, bet, betUrl) {
  try {
    const cast = await farcasterService.shareBet(signerUuid, bet, betUrl);
    return cast;
  } catch (error) {
    console.error('Error sharing bet on Farcaster:', error);
    throw error;
  }
}
```

## Turnkey Integration

BetBase uses Turnkey for wallet management. You can use the Turnkey API to create and manage wallets for your users.

### Authentication

To authenticate with Turnkey, you need to use an API key. See the [Turnkey Documentation](https://docs.turnkey.com) for more information.

### Example: Creating a Wallet

```javascript
import { turnkeyService } from './services/turnkeyService';

async function createWallet(userId, walletName) {
  try {
    const wallet = await turnkeyService.createWallet(userId, walletName);
    return wallet;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
}
```

### Example: Signing a Transaction

```javascript
import { turnkeyService } from './services/turnkeyService';

async function signTransaction(walletId, transaction) {
  try {
    const signedTx = await turnkeyService.signTransaction(walletId, transaction);
    return signedTx;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}
```

## Supabase Integration

BetBase uses Supabase for off-chain data storage. You can use the Supabase API to store and retrieve data.

### Authentication

To authenticate with Supabase, you need to use an API key. See the [Supabase Documentation](https://supabase.com/docs) for more information.

### Example: Creating a User

```javascript
import { supabaseService } from './services/supabaseService';

async function createUser(userId, username) {
  try {
    const user = await supabaseService.createUser(userId, username);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
```

### Example: Getting Bets

```javascript
import { supabaseService } from './services/supabaseService';

async function getBets(options) {
  try {
    const bets = await supabaseService.getBets(options);
    return bets;
  } catch (error) {
    console.error('Error getting bets:', error);
    throw error;
  }
}
```

## Best Practices

### Error Handling

Always handle errors gracefully and provide meaningful error messages to users.

```javascript
try {
  const bets = await fetchBets();
  // Process bets
} catch (error) {
  console.error('Error fetching bets:', error);
  // Show error message to user
}
```

### Caching

Cache API responses to reduce the number of requests and improve performance.

```javascript
const cache = new Map();

async function fetchBetsWithCache() {
  const cacheKey = 'bets';
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    
    // Cache is valid for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  
  const bets = await fetchBets();
  cache.set(cacheKey, { data: bets, timestamp: Date.now() });
  
  return bets;
}
```

### Rate Limiting

Respect API rate limits to avoid being throttled.

```javascript
const rateLimiter = {
  lastRequest: 0,
  minInterval: 100, // 100ms between requests
  
  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - elapsed));
    }
    
    this.lastRequest = Date.now();
  }
};

async function fetchBetsWithRateLimit() {
  await rateLimiter.throttle();
  return fetchBets();
}
```

### Security

Always validate user input and use secure authentication methods.

```javascript
function validateBetInput(description, outcomeOptions, endTime, winningFeePercentage) {
  if (!description || description.trim() === '') {
    throw new Error('Description is required');
  }
  
  if (!outcomeOptions || outcomeOptions.length < 2) {
    throw new Error('At least 2 outcome options are required');
  }
  
  if (!endTime || new Date(endTime) <= new Date()) {
    throw new Error('End time must be in the future');
  }
  
  if (winningFeePercentage < 0 || winningFeePercentage > 500) {
    throw new Error('Winning fee percentage must be between 0 and 500 (0-5%)');
  }
}
```

## Troubleshooting

### Common Issues

#### API Authentication Errors

If you're getting authentication errors when using the API, check that:

- Your JWT token is valid and not expired
- You're including the token in the Authorization header
- You have the necessary permissions to access the endpoint

#### Smart Contract Errors

If you're getting errors when interacting with the smart contracts, check that:

- You have enough USDC to pay for the creation fee or stake
- You've approved the contract to spend your USDC
- You're using the correct contract addresses
- You're connected to the Base network

#### Farcaster Integration Errors

If you're having issues with Farcaster integration, check that:

- Your API key is valid
- The user has a Farcaster account
- You're using the correct endpoints

#### Turnkey Integration Errors

If you're having issues with Turnkey integration, check that:

- Your API key is valid
- You're using the correct organization ID
- You're using the correct endpoints

#### Supabase Integration Errors

If you're having issues with Supabase integration, check that:

- Your API key is valid
- You're using the correct project URL
- You're using the correct table names and columns

### Getting Help

If you're still having issues, you can:

- Check the [BetBase Documentation](https://docs.betbase.app)
- Join the [BetBase Discord](https://discord.gg/betbase)
- Contact the BetBase team at support@betbase.app

