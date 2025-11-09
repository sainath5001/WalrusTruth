// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {WalrusPredictionMarket} from "../src/WalrusPredictionMarket.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint8 private immutable _mockDecimals;

    constructor() ERC20("USD Coin", "USDC") {
        _mockDecimals = 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public view override returns (uint8) {
        return _mockDecimals;
    }
}

contract WalrusPredictionMarketTest is Test {
    MockUSDC private mockToken;
    WalrusPredictionMarket private market;

    address private admin = address(this);
    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);

    function setUp() public {
        mockToken = new MockUSDC();
        market = new WalrusPredictionMarket(admin, IERC20(address(mockToken)));

        mockToken.mint(alice, 1_000_000e6);
        mockToken.mint(bob, 1_000_000e6);

        vm.prank(alice);
        mockToken.approve(address(market), type(uint256).max);

        vm.prank(bob);
        mockToken.approve(address(market), type(uint256).max);
    }

    function testCreateMarketOnlyOwner() public {
        uint64 deadline = uint64(block.timestamp + 3 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");
        assertEq(marketId, 0);

        WalrusPredictionMarket.MarketView memory viewData = market.getMarket(marketId);
        assertEq(viewData.title, "Walrus");
        assertEq(viewData.metadataURI, "ipfs://metadata");
        assertEq(uint256(viewData.status), uint256(WalrusPredictionMarket.Status.Open));

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        vm.prank(alice);
        market.createMarket("hack", "desc", deadline, "uri");
    }

    function testPlaceBetAndResolveYes() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.prank(alice);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.Yes, 100e6);

        vm.prank(bob);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.No, 50e6);

        assertEq(mockToken.balanceOf(address(market)), 150e6);

        vm.warp(deadline + 1);
        market.resolveMarket(marketId, WalrusPredictionMarket.Outcome.Yes);

        assertEq(mockToken.balanceOf(alice), 1_000_050e6);
        assertEq(mockToken.balanceOf(bob), 999_950e6);
        assertEq(mockToken.balanceOf(address(market)), 0);
    }

    function testBettingStopsAtDeadline() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.warp(deadline);
        vm.expectRevert("Betting expired");
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.Yes, 10e6);
    }

    function testResolveBeforeDeadlineReverts() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.prank(alice);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.Yes, 10e6);

        vm.expectRevert("Deadline pending");
        market.resolveMarket(marketId, WalrusPredictionMarket.Outcome.Yes);
    }

    function testResolveVoidRefundsEveryone() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.prank(alice);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.Yes, 100e6);

        vm.prank(bob);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.No, 50e6);

        vm.warp(deadline + 1);
        market.resolveMarket(marketId, WalrusPredictionMarket.Outcome.Void);

        assertEq(mockToken.balanceOf(alice), 1_000_000e6);
        assertEq(mockToken.balanceOf(bob), 1_000_000e6);
        assertEq(mockToken.balanceOf(address(market)), 0);
    }

    function testResolveFailsWhenNoWinningBets() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.prank(alice);
        market.placeBet(marketId, WalrusPredictionMarket.Outcome.No, 100e6);

        vm.warp(deadline + 1);
        vm.expectRevert("No winning bets");
        market.resolveMarket(marketId, WalrusPredictionMarket.Outcome.Yes);
    }

    function testSubmitEvidenceEmitsEvent() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 marketId = market.createMarket("Walrus", "Truth discovery", deadline, "ipfs://metadata");

        vm.expectEmit(true, true, true, true, address(market));
        emit WalrusPredictionMarket.EvidenceSubmitted(marketId, address(this), "walrus://evidence");
        market.submitEvidence(marketId, "walrus://evidence");
    }
}
