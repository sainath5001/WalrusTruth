import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { publicClient } from "@/lib/viemClients";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";
import { decodeOutcome, decodeStatus } from "@/lib/marketHelpers";
import { type MarketWithWager } from "@/types/market";

async function fetchMarket(id: bigint) {
  const data = await publicClient.readContract({
    ...WALRUS_MARKET_CONTRACT,
    functionName: "getMarket",
    args: [id],
  });

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
  ] = data as unknown as [
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

  return {
    id,
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
}

async function fetchUserWager(address: Address, marketId: bigint) {
  const response = await publicClient.readContract({
    ...WALRUS_MARKET_CONTRACT,
    functionName: "getWager",
    args: [marketId, address],
  });
  const [yesAmount, noAmount, paid] = response as [bigint, bigint, boolean];
  return { yesAmount, noAmount, paid };
}

export function useMarket(id: bigint, address?: Address) {
  return useQuery({
    queryKey: ["market", id, address],
    queryFn: async (): Promise<MarketWithWager> => {
      const market = await fetchMarket(id);
      if (!address) return market;
      const wager = await fetchUserWager(address, id);
      return { ...market, userWager: wager };
    },
  });
}

