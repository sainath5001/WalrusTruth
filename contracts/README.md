## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

## Walrus YES/NO Markets

This workspace now ships with a USDC-settled prediction market tailored for the Walrus Truth product.

### Environment

Create a `.env` file in this directory:

```shell
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-infura-id>
DEPLOYER_PRIVATE_KEY=0x<hex-private-key>
USDC_SEPOLIA=0x<circle-usdc-address-on-sepolia>
WALRUS_METADATA_BASE=https://walrus.yourdomain.xyz/metadata/
```

> Tip: the deployer becomes the admin/oracle for every market.

### Deploy to Sepolia

```shell
$ source .env
$ forge script script/DeployWalrusMarket.s.sol:DeployWalrusMarket \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    -vvvv
```

The script logs the deployed address so the frontend can persist it.

### Local simulation (optional)

To practice the full lifecycle without hitting Sepolia, run the Foundry tests or fork Anvil with USDC impersonation:

```shell
$ forge test --match-contract WalrusPredictionMarketTest -vvvv
```

The tests mint mock 6-decimal USDC, fund bettors, and assert on payouts for YES, NO, and VOID scenarios.

If you prefer scripting against a fork:

```shell
$ anvil --fork-url $SEPOLIA_RPC_URL
$ forge script script/DeployWalrusMarket.s.sol:DeployWalrusMarket --rpc-url http://127.0.0.1:8545 --broadcast
```

Then interact with `cast` using the generated ABI in `out/WalrusPredictionMarket.sol/WalrusPredictionMarket.json`.
