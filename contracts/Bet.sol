// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

/**
 * @title Bet
 * @dev Contract for a single betting market
 * Handles stakes, outcome resolution, and payouts
 */
contract Bet {
    // Events
    event StakePlaced(address indexed staker, string outcome, uint256 amount);
    event BetResolved(string winningOutcome, uint256 totalPayout, uint256 feeCollected);
    event PayoutClaimed(address indexed staker, uint256 amount);

    // Bet status enum
    enum Status { Open, InProgress, Resolved }

    // Stake struct
    struct Stake {
        address staker;
        string outcome;
        uint256 amount;
        bool claimed;
    }

    // State variables
    address public creator;
    string public description;
    string[] public outcomeOptions;
    uint256 public endTime;
    uint16 public winningFeePercentage; // In basis points (100 = 1%)
    address public feeCollector;
    IERC20 public usdcToken;
    
    Status public status;
    string public winningOutcome;
    uint256 public totalStaked;
    
    // Mapping from outcome to total staked on that outcome
    mapping(string => uint256) public outcomeStakes;
    
    // All stakes placed
    Stake[] public stakes;
    
    // Mapping from staker to their stake indices
    mapping(address => uint256[]) public stakerToStakeIndices;

    /**
     * @dev Constructor sets up the bet parameters
     * @param _creator Address of the bet creator
     * @param _description Description of the bet
     * @param _outcomeOptions Array of possible outcomes
     * @param _endTime Timestamp when the bet will end
     * @param _winningFeePercentage Percentage fee taken from winning stakes (in basis points)
     * @param _feeCollector Address that will receive fees
     * @param _usdcToken Address of the USDC token contract
     */
    constructor(
        address _creator,
        string memory _description,
        string[] memory _outcomeOptions,
        uint256 _endTime,
        uint16 _winningFeePercentage,
        address _feeCollector,
        address _usdcToken
    ) {
        creator = _creator;
        description = _description;
        outcomeOptions = _outcomeOptions;
        endTime = _endTime;
        winningFeePercentage = _winningFeePercentage;
        feeCollector = _feeCollector;
        usdcToken = IERC20(_usdcToken);
        status = Status.Open;
    }

    /**
     * @dev Places a stake on a specific outcome
     * @param _outcome The outcome to stake on
     * @param _amount Amount to stake (in USDC with 6 decimals)
     */
    function placeStake(string memory _outcome, uint256 _amount) external {
        require(status == Status.Open, "Bet is not open for stakes");
        require(block.timestamp < endTime, "Bet has ended");
        require(_amount > 0, "Stake amount must be greater than 0");
        require(isValidOutcome(_outcome), "Invalid outcome");
        
        // Transfer USDC from staker to this contract
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        // Record the stake
        uint256 stakeIndex = stakes.length;
        stakes.push(Stake({
            staker: msg.sender,
            outcome: _outcome,
            amount: _amount,
            claimed: false
        }));
        
        stakerToStakeIndices[msg.sender].push(stakeIndex);
        outcomeStakes[_outcome] += _amount;
        totalStaked += _amount;
        
        emit StakePlaced(msg.sender, _outcome, _amount);
        
        // If this is the first stake, change status to InProgress
        if (totalStaked == _amount) {
            status = Status.InProgress;
        }
    }

    /**
     * @dev Resolves the bet with a winning outcome
     * @param _winningOutcome The outcome that won
     */
    function resolveBet(string memory _winningOutcome) external {
        require(msg.sender == creator, "Only creator can resolve");
        require(status != Status.Resolved, "Bet already resolved");
        require(block.timestamp >= endTime, "Bet has not ended yet");
        require(isValidOutcome(_winningOutcome), "Invalid outcome");
        
        winningOutcome = _winningOutcome;
        status = Status.Resolved;
        
        // Calculate fee amount
        uint256 winningPool = outcomeStakes[_winningOutcome];
        uint256 feeAmount = (winningPool * winningFeePercentage) / 10000;
        
        // Transfer fee to fee collector
        if (feeAmount > 0) {
            require(usdcToken.transfer(feeCollector, feeAmount), "Fee transfer failed");
        }
        
        emit BetResolved(_winningOutcome, totalStaked, feeAmount);
    }

    /**
     * @dev Claims payout for the caller if they won
     * @return Amount claimed
     */
    function claimPayout() external returns (uint256) {
        require(status == Status.Resolved, "Bet not resolved yet");
        
        uint256 totalPayout = 0;
        uint256[] memory indices = stakerToStakeIndices[msg.sender];
        
        for (uint256 i = 0; i < indices.length; i++) {
            Stake storage stake = stakes[indices[i]];
            
            if (!stake.claimed && keccak256(bytes(stake.outcome)) == keccak256(bytes(winningOutcome))) {
                // Calculate payout (proportional to stake amount)
                uint256 winningPool = outcomeStakes[winningOutcome];
                uint256 losingPool = totalStaked - winningPool;
                
                // Deduct fee from winning amount
                uint256 feeAmount = (stake.amount * winningFeePercentage) / 10000;
                uint256 winningAmount = stake.amount - feeAmount;
                
                // Calculate proportion of losing pool to award
                uint256 proportion = (stake.amount * 1e18) / winningPool; // Use 1e18 for precision
                uint256 shareOfLosingPool = (losingPool * proportion) / 1e18;
                
                uint256 payout = winningAmount + shareOfLosingPool;
                totalPayout += payout;
                
                // Mark as claimed
                stake.claimed = true;
            }
        }
        
        require(totalPayout > 0, "No payout to claim");
        require(usdcToken.transfer(msg.sender, totalPayout), "Payout transfer failed");
        
        emit PayoutClaimed(msg.sender, totalPayout);
        return totalPayout;
    }

    /**
     * @dev Checks if an outcome is valid
     * @param _outcome Outcome to check
     * @return True if the outcome is valid
     */
    function isValidOutcome(string memory _outcome) public view returns (bool) {
        for (uint256 i = 0; i < outcomeOptions.length; i++) {
            if (keccak256(bytes(outcomeOptions[i])) == keccak256(bytes(_outcome))) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Gets all stakes for a specific staker
     * @param _staker Address of the staker
     * @return Array of stake indices
     */
    function getStakesByStaker(address _staker) external view returns (uint256[] memory) {
        return stakerToStakeIndices[_staker];
    }

    /**
     * @dev Gets all outcome options
     * @return Array of outcome options
     */
    function getOutcomeOptions() external view returns (string[] memory) {
        return outcomeOptions;
    }

    /**
     * @dev Gets bet details
     * @return _creator Address of the creator
     * @return _description Description of the bet
     * @return _endTime End time of the bet
     * @return _status Current status of the bet
     * @return _winningOutcome Winning outcome (empty if not resolved)
     * @return _totalStaked Total amount staked
     */
    function getBetDetails() external view returns (
        address _creator,
        string memory _description,
        uint256 _endTime,
        Status _status,
        string memory _winningOutcome,
        uint256 _totalStaked
    ) {
        return (
            creator,
            description,
            endTime,
            status,
            winningOutcome,
            totalStaked
        );
    }

    /**
     * @dev Gets stake details
     * @param _index Index of the stake
     * @return _staker Address of the staker
     * @return _outcome Outcome staked on
     * @return _amount Amount staked
     * @return _claimed Whether the payout has been claimed
     */
    function getStakeDetails(uint256 _index) external view returns (
        address _staker,
        string memory _outcome,
        uint256 _amount,
        bool _claimed
    ) {
        require(_index < stakes.length, "Invalid stake index");
        Stake storage stake = stakes[_index];
        return (
            stake.staker,
            stake.outcome,
            stake.amount,
            stake.claimed
        );
    }
}

