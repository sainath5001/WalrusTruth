import { useQuery } from "@tanstack/react-query";
import { publicClient } from "@/lib/viemClients";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";
import { decodeOutcome, decodeStatus } from "@/lib/marketHelpers";
import { type Market, type MarketWithWager, type Wager } from "@/types/market";
import { Address } from "viem";

async function fetchMarkets(): Promise<Market[]> {
  const marketCount = await publicClient.readContract({
    ...WALRUS_MARKET_CONTRACT,
    functionName: "marketCount",
  });

  const count = Number(marketCount);
  if (count === 0) return [];

  const calls = Array.from({ length: count }, (_, idx) => ({
    ...WALRUS_MARKET_CONTRACT,
    functionName: "getMarket" as const,
    args: [BigInt(idx)],
  }));

  const multicallResult = await publicClient.multicall({
    contracts: calls,
  });

  return multicallResult
    .map((result, index) => {
      if (result.status !== "success") return null;
      const [
        title,
        description,
        metadataURI,
        deadline,
        status,
        outcome,
        yesPool,
        noPool,
        bettorCount,
      ] = result.result as unknown as [
        string,
        string,
        string,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
      ];

      const market: Market = {
        id: BigInt(index),
        title,
        description,
        metadataURI,
        deadline: new Date(Number(deadline) * 1000),
        status: decodeStatus(status),
        outcome: decodeOutcome(outcome),
        yesPool,
        noPool,
        bettorCount,
      };

      return market;
    })
    .filter((market): market is Market => market !== null)
    .sort((a, b) => Number(a.id - b.id));
}

async function fetchUserWagers(address: Address, marketIds: bigint[]) {
  if (marketIds.length === 0) return new Map<bigint, Wager>();

  const wagerCalls = marketIds.map((marketId) => ({
    ...WALRUS_MARKET_CONTRACT,
    functionName: "getWager" as const,
    args: [marketId, address],
  }));

  const response = await publicClient.multicall({
    contracts: wagerCalls,
  });

  return response.reduce((acc, entry, idx) => {
    if (entry.status === "success") {
      const [yesAmount, noAmount, paid] = entry.result as [bigint, bigint, boolean];
      acc.set(marketIds[idx], { yesAmount, noAmount, paid });
    }
    return acc;
  }, new Map<bigint, Wager>());
}

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });
}

export function useMarketsWithWagers(address?: Address) {
  return useQuery({
    queryKey: ["markets", address],
    queryFn: async () => {
      const markets = await fetchMarkets();
      if (!address) return markets as MarketWithWager[];

      const wagers = await fetchUserWagers(address, markets.map((m) => m.id));
      return markets.map((market) => ({
        ...market,
        userWager: wagers.get(market.id),
      }));
    },
  });
}

