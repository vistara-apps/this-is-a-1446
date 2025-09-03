import { create } from 'zustand';

// Mock current user ID (in real app, this would come from wallet/auth)
const CURRENT_USER_ID = 'user123';

export const useBettingStore = create((set, get) => ({
  bets: [
    {
      betId: 'bet1',
      creatorId: 'creator1',
      description: 'Will Bitcoin reach $100,000 by end of 2024?',
      outcomeOptions: ['Yes', 'No'],
      status: 'open',
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-12-31T23:59:59Z',
      creationFeePaid: 1,
      winningOutcome: null,
      stakes: [
        {
          stakeId: 'stake1',
          betId: 'bet1',
          userId: 'user456',
          chosenOutcome: 'Yes',
          amount: 50,
          isWinner: false,
          payoutTimestamp: null
        },
        {
          stakeId: 'stake2',
          betId: 'bet1',
          userId: 'user789',
          chosenOutcome: 'No',
          amount: 30,
          isWinner: false,
          payoutTimestamp: null
        }
      ]
    },
    {
      betId: 'bet2',
      creatorId: 'creator2',
      description: 'Will the next iPhone be released with USB-C?',
      outcomeOptions: ['USB-C', 'Lightning', 'New Connector'],
      status: 'resolved',
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-06-01T00:00:00Z',
      creationFeePaid: 1,
      winningOutcome: 'USB-C',
      stakes: [
        {
          stakeId: 'stake3',
          betId: 'bet2',
          userId: CURRENT_USER_ID,
          chosenOutcome: 'USB-C',
          amount: 25,
          isWinner: true,
          payoutTimestamp: '2024-06-01T12:00:00Z'
        },
        {
          stakeId: 'stake4',
          betId: 'bet2',
          userId: 'user456',
          chosenOutcome: 'Lightning',
          amount: 15,
          isWinner: false,
          payoutTimestamp: null
        }
      ]
    }
  ],

  stakes: [],

  createBet: (betData) => {
    const newBet = {
      betId: `bet${Date.now()}`,
      creatorId: CURRENT_USER_ID,
      status: 'open',
      startTime: new Date().toISOString(),
      winningOutcome: null,
      stakes: [],
      ...betData,
    };

    set((state) => ({
      bets: [newBet, ...state.bets],
    }));
  },

  stakeBet: (betId, chosenOutcome, amount) => {
    const newStake = {
      stakeId: `stake${Date.now()}`,
      betId,
      userId: CURRENT_USER_ID,
      chosenOutcome,
      amount,
      isWinner: false,
      payoutTimestamp: null,
    };

    set((state) => ({
      bets: state.bets.map(bet => 
        bet.betId === betId 
          ? { ...bet, stakes: [...(bet.stakes || []), newStake] }
          : bet
      ),
    }));
  },

  resolveBet: (betId, winningOutcome) => {
    set((state) => ({
      bets: state.bets.map(bet => {
        if (bet.betId === betId) {
          const updatedStakes = (bet.stakes || []).map(stake => ({
            ...stake,
            isWinner: stake.chosenOutcome === winningOutcome,
            payoutTimestamp: stake.chosenOutcome === winningOutcome ? new Date().toISOString() : null,
          }));

          return {
            ...bet,
            status: 'resolved',
            winningOutcome,
            stakes: updatedStakes,
          };
        }
        return bet;
      }),
    }));
  },

  getUserStake: (betId) => {
    const { bets } = get();
    const bet = bets.find(b => b.betId === betId);
    return bet?.stakes?.find(stake => stake.userId === CURRENT_USER_ID);
  },

  getUserBets: () => {
    const { bets } = get();
    return bets.filter(bet => 
      bet.creatorId === CURRENT_USER_ID || 
      bet.stakes?.some(stake => stake.userId === CURRENT_USER_ID)
    );
  },

  getUserStats: () => {
    const { bets } = get();
    const userStakes = bets.flatMap(bet => 
      (bet.stakes || []).filter(stake => stake.userId === CURRENT_USER_ID)
    );

    const totalStaked = userStakes.reduce((sum, stake) => sum + stake.amount, 0);
    const winningStakes = userStakes.filter(stake => stake.isWinner);
    const totalWinnings = winningStakes.reduce((sum, stake) => sum + stake.amount * 2, 0); // Simplified 2x payout
    const winRate = userStakes.length > 0 ? (winningStakes.length / userStakes.length) * 100 : 0;
    const netPnL = totalWinnings - totalStaked;

    return {
      totalStaked,
      totalWinnings,
      winRate,
      netPnL,
    };
  },
}));