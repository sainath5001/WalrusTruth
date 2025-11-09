import { Address, formatUnits } from "viem";
import { sepolia } from "viem/chains";
import { env } from "./env";
import { walrusPredictionMarketAbi } from "./abi/WalrusPredictionMarket";

export const WALRUS_MARKET_CONTRACT = {
  address: env.contractAddress as Address,
  abi: walrusPredictionMarketAbi,
  chain: sepolia,
} as const;

export const USDC_ADDRESS = env.usdcAddress as Address;
export const USDC_DECIMALS = 6;

export const formatUsdc = (amount: bigint, decimals = USDC_DECIMALS) =>
  formatUnits(amount, decimals);

