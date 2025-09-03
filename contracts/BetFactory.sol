// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Bet.sol";
import "./interfaces/IERC20.sol";

/**
 * @title BetFactory
 * @dev Factory contract for creating new betting markets
 * Handles creation fees and maintains a registry of all bets
 */
contract BetFactory {
    // Events
    event BetCreated(
        address indexed betAddress,
        address indexed creator,
        string description,
        uint256 creationFee,
        uint256 endTime
    );

    // State variables
    address public owner;
    address public feeCollector;
    uint256 public creationFee; // Fee in USDC (with 6 decimals)
    IERC20 public usdcToken;
    
    // Registry of all bets created by this factory
    address[] public allBets;
    
    // Mapping from creator to their bets
    mapping(address => address[]) public creatorToBets;

    /**
     * @dev Constructor sets the owner, fee collector, USDC token address, and initial creation fee
     * @param _feeCollector Address that will receive fees
     * @param _usdcToken Address of the USDC token contract
     * @param _initialCreationFee Initial fee for creating a bet (in USDC with 6 decimals)
     */
    constructor(
        address _feeCollector,
        address _usdcToken,
        uint256 _initialCreationFee
    ) {
        owner = msg.sender;
        feeCollector = _feeCollector;
        usdcToken = IERC20(_usdcToken);
        creationFee = _initialCreationFee;
    }

    /**
     * @dev Creates a new betting market
     * @param _description Description of the bet
     * @param _outcomeOptions Array of possible outcomes
     * @param _endTime Timestamp when the bet will end
     * @param _winningFeePercentage Percentage fee taken from winning stakes (in basis points, e.g. 100 = 1%)
     * @return Address of the newly created bet contract
     */
    function createBet(
        string memory _description,
        string[] memory _outcomeOptions,
        uint256 _endTime,
        uint16 _winningFeePercentage
    ) external returns (address) {
        require(_outcomeOptions.length >= 2, "At least 2 outcomes required");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_winningFeePercentage <= 500, "Fee cannot exceed 5%"); // Max 5% fee
        
        // Collect creation fee
        require(usdcToken.transferFrom(msg.sender, feeCollector, creationFee), "Fee transfer failed");
        
        // Create new bet contract
        Bet newBet = new Bet(
            msg.sender,
            _description,
            _outcomeOptions,
            _endTime,
            _winningFeePercentage,
            feeCollector,
            address(usdcToken)
        );
        
        // Register the new bet
        address betAddress = address(newBet);
        allBets.push(betAddress);
        creatorToBets[msg.sender].push(betAddress);
        
        emit BetCreated(
            betAddress,
            msg.sender,
            _description,
            creationFee,
            _endTime
        );
        
        return betAddress;
    }

    /**
     * @dev Returns all bets created by this factory
     * @return Array of bet contract addresses
     */
    function getAllBets() external view returns (address[] memory) {
        return allBets;
    }

    /**
     * @dev Returns all bets created by a specific address
     * @param _creator Address of the creator
     * @return Array of bet contract addresses
     */
    function getBetsByCreator(address _creator) external view returns (address[] memory) {
        return creatorToBets[_creator];
    }

    /**
     * @dev Updates the creation fee
     * @param _newCreationFee New fee amount (in USDC with 6 decimals)
     */
    function updateCreationFee(uint256 _newCreationFee) external {
        require(msg.sender == owner, "Only owner can update fee");
        creationFee = _newCreationFee;
    }

    /**
     * @dev Updates the fee collector address
     * @param _newFeeCollector New address to collect fees
     */
    function updateFeeCollector(address _newFeeCollector) external {
        require(msg.sender == owner, "Only owner can update fee collector");
        require(_newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = _newFeeCollector;
    }

    /**
     * @dev Transfers ownership of the factory
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(_newOwner != address(0), "Invalid owner address");
        owner = _newOwner;
    }
}

