# BetBase Smart Contracts Documentation

This document provides comprehensive documentation for the BetBase smart contracts, including architecture, functions, events, and security considerations.

## Table of Contents

1. [Overview](#overview)
2. [Contract Architecture](#contract-architecture)
3. [BetFactory Contract](#betfactory-contract)
4. [Bet Contract](#bet-contract)
5. [Security Considerations](#security-considerations)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Upgradeability](#upgradeability)

## Overview

BetBase is a decentralized peer-to-peer betting platform built on the Base blockchain. The platform allows users to create betting markets, stake on outcomes, and receive payouts when they win. The smart contracts handle the core functionality of the platform, including:

- Creating betting markets
- Placing stakes
- Resolving bets
- Distributing payouts
- Collecting fees

## Contract Architecture

The BetBase platform consists of two main smart contracts:

1. **BetFactory**: A factory contract that creates and manages Bet contracts
2. **Bet**: A contract for a single betting market

The contracts interact with the USDC token contract for handling payments.

### Diagram

```
┌─────────────────┐     creates     ┌─────────────┐
│   BetFactory    │────────────────▶│     Bet     │
└─────────────────┘                 └─────────────┘
         │                                 │
         │                                 │
         │                                 │
         ▼                                 ▼
┌─────────────────┐                ┌─────────────┐
│      USDC       │◀───────────────│    USDC     │
└─────────────────┘                └─────────────┘
```

## BetFactory Contract

The BetFactory contract is responsible for creating and managing Bet contracts. It also collects creation fees and maintains a registry of all bets.

### State Variables

| Name | Type | Description |
|------|------|-------------|
| owner | address | Owner of the factory contract |
| feeCollector | address | Address that receives fees |
| creationFee | uint256 | Fee for creating a bet (in USDC) |
| usdcToken | IERC20 | USDC token contract |
| allBets | address[] | Array of all bet addresses |
| creatorToBets | mapping(address => address[]) | Mapping from creator to their bets |

### Functions

#### Constructor

```solidity
constructor(
    address _feeCollector,
    address _usdcToken,
    uint256 _initialCreationFee
)
```

Initializes the BetFactory contract with the fee collector address, USDC token address, and initial creation fee.

#### createBet

```solidity
function createBet(
    string memory _description,
    string[] memory _outcomeOptions,
    uint256 _endTime,
    uint16 _winningFeePercentage
) external returns (address)
```

Creates a new betting market with the specified parameters.

**Parameters:**
- `_description`: Description of the bet
- `_outcomeOptions`: Array of possible outcomes
- `_endTime`: Timestamp when the bet will end
- `_winningFeePercentage`: Percentage fee taken from winning stakes (in basis points, e.g. 100 = 1%)

**Returns:**
- Address of the newly created bet contract

#### getAllBets

```solidity
function getAllBets() external view returns (address[] memory)
```

Returns an array of all bet addresses.

#### getBetsByCreator

```solidity
function getBetsByCreator(address _creator) external view returns (address[] memory)
```

Returns an array of bet addresses created by a specific address.

**Parameters:**
- `_creator`: Address of the creator

**Returns:**
- Array of bet addresses

#### updateCreationFee

```solidity
function updateCreationFee(uint256 _newCreationFee) external
```

Updates the creation fee.

**Parameters:**
- `_newCreationFee`: New fee amount (in USDC)

#### updateFeeCollector

```solidity
function updateFeeCollector(address _newFeeCollector) external
```

Updates the fee collector address.

**Parameters:**
- `_newFeeCollector`: New address to collect fees

#### transferOwnership

```solidity
function transferOwnership(address _newOwner) external
```

Transfers ownership of the factory.

**Parameters:**
- `_newOwner`: New owner address

### Events

#### BetCreated

```solidity
event BetCreated(
    address indexed betAddress,
    address indexed creator,
    string description,
    uint256 creationFee,
    uint256 endTime
)
```

Emitted when a new bet is created.

## Bet Contract

The Bet contract represents a single betting market. It handles stakes, outcome resolution, and payouts.

### State Variables

| Name | Type | Description |
|------|------|-------------|
| creator | address | Creator of the bet |
| description | string | Description of the bet |
| outcomeOptions | string[] | Array of possible outcomes |
| endTime | uint256 | Timestamp when the bet will end |
| winningFeePercentage | uint16 | Percentage fee taken from winning stakes (in basis points) |
| feeCollector | address | Address that receives fees |
| usdcToken | IERC20 | USDC token contract |
| status | Status | Current status of the bet (Open, InProgress, Resolved) |
| winningOutcome | string | Winning outcome (empty if not resolved) |
| totalStaked | uint256 | Total amount staked |
| outcomeStakes | mapping(string => uint256) | Mapping from outcome to total staked on that outcome |
| stakes | Stake[] | Array of all stakes |
| stakerToStakeIndices | mapping(address => uint256[]) | Mapping from staker to their stake indices |

### Structs

#### Stake

```solidity
struct Stake {
    address staker;
    string outcome;
    uint256 amount;
    bool claimed;
}
```

Represents a stake on a specific outcome.

### Enums

#### Status

```solidity
enum Status { Open, InProgress, Resolved }
```

Represents the current status of the bet.

### Functions

#### Constructor

```solidity
constructor(
    address _creator,
    string memory _description,
    string[] memory _outcomeOptions,
    uint256 _endTime,
    uint16 _winningFeePercentage,
    address _feeCollector,
    address _usdcToken
)
```

Initializes the Bet contract with the specified parameters.

#### placeStake

```solidity
function placeStake(string memory _outcome, uint256 _amount) external
```

Places a stake on a specific outcome.

**Parameters:**
- `_outcome`: The outcome to stake on
- `_amount`: Amount to stake (in USDC)

#### resolveBet

```solidity
function resolveBet(string memory _winningOutcome) external
```

Resolves the bet with a winning outcome.

**Parameters:**
- `_winningOutcome`: The outcome that won

#### claimPayout

```solidity
function claimPayout() external returns (uint256)
```

Claims payout for the caller if they won.

**Returns:**
- Amount claimed

#### isValidOutcome

```solidity
function isValidOutcome(string memory _outcome) public view returns (bool)
```

Checks if an outcome is valid.

**Parameters:**
- `_outcome`: Outcome to check

**Returns:**
- True if the outcome is valid

#### getStakesByStaker

```solidity
function getStakesByStaker(address _staker) external view returns (uint256[] memory)
```

Gets all stakes for a specific staker.

**Parameters:**
- `_staker`: Address of the staker

**Returns:**
- Array of stake indices

#### getOutcomeOptions

```solidity
function getOutcomeOptions() external view returns (string[] memory)
```

Gets all outcome options.

**Returns:**
- Array of outcome options

#### getBetDetails

```solidity
function getBetDetails() external view returns (
    address _creator,
    string memory _description,
    uint256 _endTime,
    Status _status,
    string memory _winningOutcome,
    uint256 _totalStaked
)
```

Gets bet details.

**Returns:**
- `_creator`: Address of the creator
- `_description`: Description of the bet
- `_endTime`: End time of the bet
- `_status`: Current status of the bet
- `_winningOutcome`: Winning outcome (empty if not resolved)
- `_totalStaked`: Total amount staked

#### getStakeDetails

```solidity
function getStakeDetails(uint256 _index) external view returns (
    address _staker,
    string memory _outcome,
    uint256 _amount,
    bool _claimed
)
```

Gets stake details.

**Parameters:**
- `_index`: Index of the stake

**Returns:**
- `_staker`: Address of the staker
- `_outcome`: Outcome staked on
- `_amount`: Amount staked
- `_claimed`: Whether the payout has been claimed

### Events

#### StakePlaced

```solidity
event StakePlaced(address indexed staker, string outcome, uint256 amount)
```

Emitted when a stake is placed.

#### BetResolved

```solidity
event BetResolved(string winningOutcome, uint256 totalPayout, uint256 feeCollected)
```

Emitted when a bet is resolved.

#### PayoutClaimed

```solidity
event PayoutClaimed(address indexed staker, uint256 amount)
```

Emitted when a payout is claimed.

## Security Considerations

### Reentrancy

The contracts use the checks-effects-interactions pattern to prevent reentrancy attacks. External calls are made after state changes.

### Integer Overflow/Underflow

The contracts use Solidity 0.8.x, which includes built-in overflow/underflow protection.

### Access Control

Only the creator of a bet can resolve it, and only the owner of the factory can update fees and fee collector.

### Timestamp Dependence

The contracts use block timestamps for determining when bets end. This is acceptable for this use case, as small variations in timestamp accuracy do not significantly impact the betting system.

### Front-Running

The contracts do not have specific protections against front-running. Users should be aware that transactions can be seen in the mempool before they are included in a block.

## Deployment

The BetFactory contract should be deployed first, followed by the deployment of Bet contracts through the factory.

### Deployment Parameters

#### BetFactory

- `_feeCollector`: Address that will receive fees
- `_usdcToken`: Address of the USDC token contract on Base
- `_initialCreationFee`: Initial fee for creating a bet (in USDC with 6 decimals)

## Testing

The contracts should be thoroughly tested before deployment, including:

- Unit tests for individual functions
- Integration tests for contract interactions
- Fuzz testing for edge cases
- Gas optimization tests

## Upgradeability

The current contracts are not upgradeable. If upgrades are needed, new versions of the contracts would need to be deployed, and users would need to migrate to the new contracts.

