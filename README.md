# BetBase

BetBase is a Base mini-app allowing users to create, stake, and resolve peer-to-peer bets with transparent on-chain execution.

## Features

- Create betting markets
- Stake on bets with USDC
- Resolve bets with transparent payouts
- Social integration with Farcaster
- Secure wallet management with Turnkey

## Setup

### Prerequisites

- Node.js v18+
- npm or yarn
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/betbase.git
   cd betbase
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in the required environment variables in the `.env` file.

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build the application for production:
```bash
npm run build
```

### Deployment

This project is configured for deployment on Vercel. To enable automatic deployments:

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. Push to the main branch or create a pull request to trigger the deployment workflow.

## Smart Contracts

The smart contracts are located in the `contracts` directory:

- `BetFactory.sol`: Factory contract for creating and managing betting markets
- `Bet.sol`: Contract for individual betting markets with staking and payout functionality

## License

MIT

