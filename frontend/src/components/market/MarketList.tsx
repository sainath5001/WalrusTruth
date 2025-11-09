"use client";

import { isMarketActive } from "@/lib/marketHelpers";
import { type MarketWithWager } from "@/types/market";
import { Address } from "viem";
import { MarketCard } from "./MarketCard";

type MarketListProps = {
  loading: boolean;
  markets: MarketWithWager[];
  walletAddress?: Address;
  authenticated: boolean;
  onRefresh?: () => void;
};

export function MarketList({
  loading,
  markets,
  walletAddress,
  authenticated,
  onRefresh,
}: MarketListProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`skeleton-${idx}`}
            className="h-48 animate-pulse rounded-3xl bg-white/50"
          />
        ))}
      </div>
    );
  }

  if (!markets.length) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-200 bg-white/60 p-10 text-center text-foreground/70">
        <p className="text-lg font-medium">No markets yet.</p>
        <p className="mt-2 text-sm">
          Check back soon or create one from the admin console.
        </p>
      </div>
    );
  }

  const activeMarkets = markets.filter(isMarketActive);
  const settledMarkets = markets.filter((market) => !isMarketActive(market));

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        {activeMarkets.length > 0 ? (
          activeMarkets.map((market) => (
            <MarketCard
              key={`market-${market.id.toString()}`}
              market={market}
              walletAddress={walletAddress}
              authenticated={authenticated}
              onRefresh={onRefresh}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/60 p-10 text-center text-foreground/70">
            <p className="font-medium">
              All active markets have closed. Explore settled truth pages below.
            </p>
          </div>
        )}
      </div>
      {settledMarkets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Resolved markets</h3>
          <div className="space-y-4">
            {settledMarkets.map((market) => (
              <MarketCard
                key={`market-${market.id.toString()}`}
                market={market}
                walletAddress={walletAddress}
                authenticated={authenticated}
                onRefresh={onRefresh}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

