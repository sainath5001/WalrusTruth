// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import {WalrusPredictionMarket} from "../src/WalrusPredictionMarket.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Deploys the WalrusPredictionMarket to Sepolia.
 *
 * Required env variables:
 * - DEPLOYER_PRIVATE_KEY : hex string for the account that will deploy & become admin
 * - USDC_SEPOLIA        : address of Circle's USDC contract on Sepolia
 *
 * Optional env variables:
 * - WALRUS_METADATA_BASE : persisted in logs to coordinate frontend usage
 */
contract DeployWalrusMarket is Script {
    function run() external returns (WalrusPredictionMarket market) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_SEPOLIA");

        console2.log("Deploying WalrusPredictionMarket");
        console2.log(" - Deployer:", vm.addr(deployerKey));
        console2.log(" - USDC:", usdcAddress);

        vm.startBroadcast(deployerKey);
        market = new WalrusPredictionMarket(vm.addr(deployerKey), IERC20(usdcAddress));
        vm.stopBroadcast();

        console2.log("WalrusPredictionMarket deployed at", address(market));

        string memory walrusBase = vm.envOr("WALRUS_METADATA_BASE", string("not_set"));
        console2.log("Walrus metadata base URI:", walrusBase);
    }
}
