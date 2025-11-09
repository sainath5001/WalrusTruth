// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title WalrusPredictionMarket
 * @author Walrus Truth
 * @notice Simple YES/NO prediction market that escrows USDC (Sepolia) stakes and
 *         distributes winnings on resolution. Designed for hackathon velocity and Foundry tooling.
 * @dev The contract assumes Privy (or a similar gas abstraction layer) handles meta-transactions,
 *      so no on-chain meta-tx plumbing is included. Admin retains oracle capabilities.
 */
contract WalrusPredictionMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// -----------------------------------------------------------------------
    /// Enums & Structs
    /// -----------------------------------------------------------------------

    enum Outcome {
        Undecided,
        Yes,
        No,
        Void
    }

    enum Status {
        Open,
        Resolved
    }

    struct Market {
        string title;
        string description;
        string metadataURI; // Walrus-hosted metadata, evidence and results.
        uint64 deadline;
        Status status;
        Outcome outcome;
        uint128 yesPool;
        uint128 noPool;
    }

    struct Wager {
        uint128 yesAmount;
        uint128 noAmount;
        bool paid;
    }

    struct MarketView {
        string title;
        string description;
        string metadataURI;
        uint64 deadline;
        Status status;
        Outcome outcome;
        uint128 yesPool;
        uint128 noPool;
        uint256 bettorCount;
    }

    /// -----------------------------------------------------------------------
    /// Storage
    /// -----------------------------------------------------------------------

    IERC20 public immutable usdc;
    uint256 public marketCount;

    mapping(uint256 => Market) private markets;
    mapping(uint256 => address[]) private marketBettors;
    mapping(uint256 => mapping(address => Wager)) private wagers;
    mapping(uint256 => mapping(address => bool)) private hasUserBet;

    /// -----------------------------------------------------------------------
    /// Events
    /// -----------------------------------------------------------------------

    event MarketCreated(
        uint256 indexed marketId, string title, string description, uint64 deadline, string metadataURI
    );

    event BetPlaced(uint256 indexed marketId, address indexed bettor, Outcome side, uint256 amount);

    event EvidenceSubmitted(uint256 indexed marketId, address indexed submitter, string walrusURI);

    event MarketResolved(uint256 indexed marketId, Outcome outcome, uint256 totalPaid);

    event WinningsPaid(uint256 indexed marketId, address indexed bettor, uint256 amount);

    /// -----------------------------------------------------------------------
    /// Constructor
    /// -----------------------------------------------------------------------

    constructor(address admin, IERC20 usdcToken) Ownable(admin) {
        require(address(usdcToken) != address(0), "USDC required");

        usdc = usdcToken;
    }

    /// -----------------------------------------------------------------------
    /// Admin Actions
    /// -----------------------------------------------------------------------

    /**
     * @notice Create a new YES/NO market.
     * @param title Human readable headline.
     * @param description Contextual description for the Walrus truth page.
     * @param deadline Timestamp after which betting is disallowed.
     * @param metadataURI Pointer to Walrus metadata & evidence bundle.
     */
    function createMarket(
        string calldata title,
        string calldata description,
        uint64 deadline,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 marketId) {
        require(deadline > block.timestamp, "Deadline must be future");
        require(bytes(title).length > 0, "Title required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        marketId = marketCount;
        marketCount += 1;

        Market storage market = markets[marketId];
        market.title = title;
        market.description = description;
        market.metadataURI = metadataURI;
        market.deadline = deadline;
        market.status = Status.Open;
        market.outcome = Outcome.Undecided;

        emit MarketCreated(marketId, title, description, deadline, metadataURI);
    }

    /**
     * @notice Resolve a market by selecting the final outcome.
     * @dev Automatically distributes winnings to the winning side.
     */
    function resolveMarket(uint256 marketId, Outcome outcome) external onlyOwner nonReentrant {
        Market storage market = _getMarket(marketId);
        require(market.status == Status.Open, "Market closed");
        require(block.timestamp >= market.deadline, "Deadline pending");
        require(outcome == Outcome.Yes || outcome == Outcome.No || outcome == Outcome.Void, "Invalid outcome");

        market.status = Status.Resolved;
        market.outcome = outcome;

        uint256 totalPaid;
        if (outcome == Outcome.Void) {
            totalPaid = _refundAllBettors(marketId, market);
        } else {
            totalPaid = _payWinners(marketId, market, outcome);
        }

        emit MarketResolved(marketId, outcome, totalPaid);
    }

    /// -----------------------------------------------------------------------
    /// User Actions
    /// -----------------------------------------------------------------------

    /**
     * @notice Place a YES or NO bet by transferring USDC into escrow.
     * @param marketId Identifier of the market.
     * @param outcome Side to bet on (YES = Outcome.Yes, NO = Outcome.No).
     * @param amount Amount of USDC (6 decimals) to stake.
     */
    function placeBet(uint256 marketId, Outcome outcome, uint256 amount) external nonReentrant {
        require(outcome == Outcome.Yes || outcome == Outcome.No, "Invalid bet side");
        require(amount > 0, "Amount zero");
        require(amount <= type(uint128).max, "Amount too big");

        Market storage market = _getMarket(marketId);
        require(market.status == Status.Open, "Market closed");
        require(block.timestamp < market.deadline, "Betting expired");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        Wager storage wager = wagers[marketId][msg.sender];
        if (!hasUserBet[marketId][msg.sender]) {
            hasUserBet[marketId][msg.sender] = true;
            marketBettors[marketId].push(msg.sender);
        }

        if (outcome == Outcome.Yes) {
            uint256 newPool = uint256(market.yesPool) + amount;
            require(newPool <= type(uint128).max, "Pool overflow");
            uint256 newUserStake = uint256(wager.yesAmount) + amount;
            require(newUserStake <= type(uint128).max, "User overflow");

            market.yesPool = uint128(newPool);
            wager.yesAmount = uint128(newUserStake);
        } else {
            uint256 newPool = uint256(market.noPool) + amount;
            require(newPool <= type(uint128).max, "Pool overflow");
            uint256 newUserStake = uint256(wager.noAmount) + amount;
            require(newUserStake <= type(uint128).max, "User overflow");

            market.noPool = uint128(newPool);
            wager.noAmount = uint128(newUserStake);
        }

        emit BetPlaced(marketId, msg.sender, outcome, amount);
    }

    /**
     * @notice Submit external evidence via Walrus and emit a canonical log.
     */
    function submitEvidence(uint256 marketId, string calldata walrusURI) external {
        _requireMarketExists(marketId);
        require(bytes(walrusURI).length > 0, "URI required");

        emit EvidenceSubmitted(marketId, msg.sender, walrusURI);
    }

    /// -----------------------------------------------------------------------
    /// Views
    /// -----------------------------------------------------------------------

    function getMarket(uint256 marketId) external view returns (MarketView memory viewData) {
        Market storage market = _getMarket(marketId);
        viewData = MarketView({
            title: market.title,
            description: market.description,
            metadataURI: market.metadataURI,
            deadline: market.deadline,
            status: market.status,
            outcome: market.outcome,
            yesPool: market.yesPool,
            noPool: market.noPool,
            bettorCount: marketBettors[marketId].length
        });
    }

    function getWager(uint256 marketId, address bettor) external view returns (Wager memory) {
        _requireMarketExists(marketId);
        return wagers[marketId][bettor];
    }

    function getBettors(uint256 marketId) external view returns (address[] memory) {
        _requireMarketExists(marketId);
        return marketBettors[marketId];
    }

    /// -----------------------------------------------------------------------
    /// Internal Logic
    /// -----------------------------------------------------------------------

    function _payWinners(uint256 marketId, Market storage market, Outcome outcome)
        internal
        returns (uint256 totalPaid)
    {
        uint256 winningPool = outcome == Outcome.Yes ? market.yesPool : market.noPool;
        uint256 losingPool = outcome == Outcome.Yes ? market.noPool : market.yesPool;
        require(winningPool > 0, "No winning bets");

        uint256 distributable = winningPool + losingPool;
        address[] storage bettors = marketBettors[marketId];
        uint256 len = bettors.length;

        for (uint256 i = 0; i < len; ++i) {
            address bettor = bettors[i];
            Wager storage wager = wagers[marketId][bettor];
            if (wager.paid) {
                continue;
            }

            uint256 userStake = outcome == Outcome.Yes ? wager.yesAmount : wager.noAmount;
            uint256 payout;
            if (userStake > 0) {
                payout = (userStake * distributable) / winningPool;
                usdc.safeTransfer(bettor, payout);
                emit WinningsPaid(marketId, bettor, payout);
            }

            wager.paid = true;
            wager.yesAmount = 0;
            wager.noAmount = 0;

            totalPaid += payout;
        }

        if (distributable > totalPaid) {
            // Handle rounding dust by returning it to the admin wallet.
            uint256 adminDust = distributable - totalPaid;
            usdc.safeTransfer(owner(), adminDust);
            totalPaid += adminDust;
        }

        market.yesPool = 0;
        market.noPool = 0;
    }

    function _refundAllBettors(uint256 marketId, Market storage market) internal returns (uint256 totalPaid) {
        address[] storage bettors = marketBettors[marketId];
        uint256 len = bettors.length;

        uint256 distributable = uint256(market.yesPool) + uint256(market.noPool);

        for (uint256 i = 0; i < len; ++i) {
            address bettor = bettors[i];
            Wager storage wager = wagers[marketId][bettor];
            if (wager.paid) {
                continue;
            }

            uint256 payout = uint256(wager.yesAmount) + uint256(wager.noAmount);
            if (payout > 0) {
                usdc.safeTransfer(bettor, payout);
                emit WinningsPaid(marketId, bettor, payout);
            }

            wager.paid = true;
            wager.yesAmount = 0;
            wager.noAmount = 0;
            totalPaid += payout;
        }

        uint256 dust = distributable - totalPaid;
        if (dust > 0) {
            usdc.safeTransfer(owner(), dust);
            totalPaid += dust;
        }

        market.yesPool = 0;
        market.noPool = 0;
    }

    function _getMarket(uint256 marketId) internal view returns (Market storage) {
        _requireMarketExists(marketId);
        return markets[marketId];
    }

    function _requireMarketExists(uint256 marketId) internal view {
        require(marketId < marketCount, "Unknown market");
    }
}
