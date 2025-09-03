# BetBase API Documentation

This document provides comprehensive documentation for the BetBase API, including endpoints, parameters, and response formats.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [API Endpoints](#api-endpoints)
   - [Bets](#bets)
   - [Stakes](#stakes)
   - [Users](#users)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

## Introduction

The BetBase API allows developers to interact with the BetBase platform programmatically. It provides access to betting markets, user stakes, and other platform features.

## Authentication

All API requests require authentication using a JWT token. To obtain a token, users must authenticate through the BetBase platform.

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Base URL

The base URL for all API endpoints is:

```
https://api.betbase.app/v1
```

## API Endpoints

### Bets

#### Get All Bets

Retrieves a list of betting markets.

**Endpoint:** `GET /bets`

**Query Parameters:**

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| status    | string | Filter by status (open, in_progress, resolved)   |
| creator   | string | Filter by creator address                        |
| limit     | number | Maximum number of results to return (default: 20)|
| offset    | number | Offset for pagination (default: 0)               |

**Response:**

```json
{
  "bets": [
    {
      "betId": "0x1234567890123456789012345678901234567890",
      "creatorId": "0xabcdef1234567890abcdef1234567890abcdef12",
      "description": "Will Bitcoin reach $100,000 by end of 2024?",
      "outcomeOptions": ["Yes", "No"],
      "status": "open",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-12-31T23:59:59Z",
      "creationFeePaid": 1,
      "winningOutcome": null,
      "totalStaked": 80,
      "stakes": [
        {
          "stakeId": "stake1",
          "betId": "0x1234567890123456789012345678901234567890",
          "userId": "0xuser1",
          "chosenOutcome": "Yes",
          "amount": 50,
          "isWinner": false,
          "payoutTimestamp": null
        },
        {
          "stakeId": "stake2",
          "betId": "0x1234567890123456789012345678901234567890",
          "userId": "0xuser2",
          "chosenOutcome": "No",
          "amount": 30,
          "isWinner": false,
          "payoutTimestamp": null
        }
      ]
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### Get Bet by ID

Retrieves a specific betting market by ID.

**Endpoint:** `GET /bets/:betId`

**Response:**

```json
{
  "betId": "0x1234567890123456789012345678901234567890",
  "creatorId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "description": "Will Bitcoin reach $100,000 by end of 2024?",
  "outcomeOptions": ["Yes", "No"],
  "status": "open",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-12-31T23:59:59Z",
  "creationFeePaid": 1,
  "winningOutcome": null,
  "totalStaked": 80,
  "stakes": [
    {
      "stakeId": "stake1",
      "betId": "0x1234567890123456789012345678901234567890",
      "userId": "0xuser1",
      "chosenOutcome": "Yes",
      "amount": 50,
      "isWinner": false,
      "payoutTimestamp": null
    },
    {
      "stakeId": "stake2",
      "betId": "0x1234567890123456789012345678901234567890",
      "userId": "0xuser2",
      "chosenOutcome": "No",
      "amount": 30,
      "isWinner": false,
      "payoutTimestamp": null
    }
  ]
}
```

#### Create Bet

Creates a new betting market.

**Endpoint:** `POST /bets`

**Request Body:**

```json
{
  "description": "Will Ethereum reach $10,000 by end of 2024?",
  "outcomeOptions": ["Yes", "No"],
  "endTime": "2024-12-31T23:59:59Z",
  "winningFeePercentage": 100
}
```

**Response:**

```json
{
  "betId": "0x9876543210987654321098765432109876543210",
  "creatorId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "description": "Will Ethereum reach $10,000 by end of 2024?",
  "outcomeOptions": ["Yes", "No"],
  "status": "open",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-12-31T23:59:59Z",
  "creationFeePaid": 1,
  "winningOutcome": null,
  "totalStaked": 0,
  "stakes": []
}
```

#### Resolve Bet

Resolves a betting market with a winning outcome.

**Endpoint:** `POST /bets/:betId/resolve`

**Request Body:**

```json
{
  "winningOutcome": "Yes"
}
```

**Response:**

```json
{
  "betId": "0x1234567890123456789012345678901234567890",
  "status": "resolved",
  "winningOutcome": "Yes",
  "totalPayout": 80,
  "feeCollected": 0.5
}
```

### Stakes

#### Place Stake

Places a stake on a betting market.

**Endpoint:** `POST /bets/:betId/stakes`

**Request Body:**

```json
{
  "outcome": "Yes",
  "amount": 25
}
```

**Response:**

```json
{
  "stakeId": "stake3",
  "betId": "0x1234567890123456789012345678901234567890",
  "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "chosenOutcome": "Yes",
  "amount": 25,
  "isWinner": false,
  "payoutTimestamp": null
}
```

#### Get User Stakes

Retrieves all stakes for the authenticated user.

**Endpoint:** `GET /users/me/stakes`

**Response:**

```json
{
  "stakes": [
    {
      "stakeId": "stake3",
      "betId": "0x1234567890123456789012345678901234567890",
      "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
      "chosenOutcome": "Yes",
      "amount": 25,
      "isWinner": false,
      "payoutTimestamp": null,
      "bet": {
        "betId": "0x1234567890123456789012345678901234567890",
        "description": "Will Bitcoin reach $100,000 by end of 2024?",
        "status": "open",
        "endTime": "2024-12-31T23:59:59Z"
      }
    }
  ],
  "total": 1
}
```

#### Claim Payout

Claims a payout for a winning stake.

**Endpoint:** `POST /stakes/:stakeId/claim`

**Response:**

```json
{
  "stakeId": "stake3",
  "betId": "0x1234567890123456789012345678901234567890",
  "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "chosenOutcome": "Yes",
  "amount": 25,
  "isWinner": true,
  "payoutTimestamp": "2024-12-31T23:59:59Z",
  "payoutAmount": 75
}
```

### Users

#### Get User Profile

Retrieves the profile of the authenticated user.

**Endpoint:** `GET /users/me`

**Response:**

```json
{
  "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "username": "cryptobettor",
  "createdAt": "2024-01-01T00:00:00Z",
  "stats": {
    "totalStaked": 100,
    "totalWinnings": 150,
    "winRate": 75,
    "netPnL": 50,
    "totalBets": 4,
    "totalWins": 3
  }
}
```

#### Update User Profile

Updates the profile of the authenticated user.

**Endpoint:** `PUT /users/me`

**Request Body:**

```json
{
  "username": "newusername"
}
```

**Response:**

```json
{
  "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
  "username": "newusername",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain an error message.

**Example Error Response:**

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": "The 'amount' parameter must be a positive number"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per user

When a rate limit is exceeded, the API will return a 429 Too Many Requests response.

## Webhooks

BetBase provides webhooks for real-time notifications of events. To set up a webhook, contact the BetBase team.

**Available Events:**

- `bet.created`: A new betting market is created
- `bet.resolved`: A betting market is resolved
- `stake.placed`: A new stake is placed
- `payout.claimed`: A payout is claimed

**Example Webhook Payload:**

```json
{
  "event": "bet.resolved",
  "timestamp": "2024-12-31T23:59:59Z",
  "data": {
    "betId": "0x1234567890123456789012345678901234567890",
    "winningOutcome": "Yes",
    "totalPayout": 80,
    "feeCollected": 0.5
  }
}
```

