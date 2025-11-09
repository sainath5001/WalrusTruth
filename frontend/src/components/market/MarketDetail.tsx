"use client";

import { Address } from "viem";
import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMarket } from "@/hooks/useMarket";
import { formatUsdc } from "@/lib/contract";
import { useCountdown } from "@/hooks/useCountdown";
import { useIsAdmin } from "@/providers";
import { useWallet } from "@/hooks/useWallet";
import { AdminResolutionPanel } from "../panel/AdminResolutionPanel";
import { MarketEvidencePanel } from "../panel/MarketEvidencePanel";
import { WalrusTruthPanel } from "../panel/WalrusTruthPanel";

type MarketDetailProps = {
  marketId: bigint;
};

export function MarketDetail({ marketId }: MarketDetailProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { address, isConnected, connect, isConnecting } = useWallet();
  const walletAddress = useMemo(
    () => (address ? (address as Address) : undefined),
    [address],
  );
  const [showBetDialog, setShowBetDialog] = useState(false);

  const { data: market, refetch, isLoading } = useMarket(marketId, walletAddress);
  const { display: countdown, expired } = useCountdown(market?.deadline);

  if (isLoading || !market) {
    return <div className="p-10 text-center text-foreground/60">Loading market...</div>;
  }

  const totalPool = market.yesPool + market.noPool;
  const yesRatio =
    totalPool === 0n ? 50 : Number((market.yesPool * 10000n) / totalPool) / 100;
  const noRatio = 100 - yesRatio;

  const userYes = market.userWager?.yesAmount ?? 0n;
  const userNo = market.userWager?.noAmount ?? 0n;

  const handleBetClick = () => {
    if (!isConnected || !walletAddress) {
      connect().catch((error) => {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to connect wallet",
        );
      });
      return;
    }
    if (market.status !== "Open" || expired) {
      toast.error("Market is closed");
      return;
    }
    setShowBetDialog(true);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <button
        onClick={() => router.back()}
        className="w-fit rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-medium text-foreground/70 transition hover:border-brand-300 hover:text-brand-600"
      >
        ← Back
      </button>

      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                {market.status}
              </span>
              {market.status === "Resolved" && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  Outcome: {market.outcome}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">
              {market.title}
            </h1>
            <p className="mt-3 max-w-3xl text-foreground/70">{market.description}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm text-foreground/70">
            <div className="flex items-center justify-between">
              <span>Deadline</span>
              <span className={`font-semibold ${expired ? "text-rose-500" : "text-aqua-600"}`}>
                {countdown}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Total pool</span>
              <span className="font-semibold text-brand-600">
                {formatUsdc(totalPool)} USDC
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Participants</span>
              <span className="font-semibold">{market.bettorCount.toString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground/70">
            <span>YES • {formatUsdc(market.yesPool)} USDC</span>
            <span>NO • {formatUsdc(market.noPool)} USDC</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-black/10">
            <div
              className="absolute inset-y-0 left-0 bg-emerald-300"
              style={{ width: `${yesRatio}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-rose-300"
              style={{ width: `${noRatio}%` }}
            />
          </div>
          <div className="flex justify-between text-xs uppercase tracking-wide text-foreground/60">
            <span>YES {yesRatio.toFixed(2)}%</span>
            <span>NO {noRatio.toFixed(2)}%</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {market.status === "Open" && !expired ? (
            <button
              onClick={handleBetClick}
              className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Place a bet"}
            </button>
          ) : (
            <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-foreground/60">
              Market closed
            </span>
          )}
          <Link
            href={market.metadataURI}
            target="_blank"
            className="text-sm font-semibold text-aqua-600 underline-offset-4 hover:underline"
          >
            View Walrus metadata →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="space-y-6">
          <MarketEvidencePanel marketId={marketId} />
          <WalrusTruthPanel metadataUri={market.metadataURI} outcome={market.outcome} />
        </div>
        <aside className="space-y-6">
          {userYes + userNo > 0n && (
            <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-glow">
              <h2 className="text-xl font-semibold text-foreground">Your position</h2>
              <div className="mt-4 grid gap-3">
                {userYes > 0n && (
                  <div className="rounded-2xl bg-emerald-50/80 p-4">
                    <p className="text-xs uppercase text-emerald-700/80">YES stake</p>
                    <p className="text-xl font-semibold text-emerald-600">
                      {formatUsdc(userYes)} USDC
                    </p>
                  </div>
                )}
                {userNo > 0n && (
                  <div className="rounded-2xl bg-rose-50/80 p-4">
                    <p className="text-xs uppercase text-rose-700/80">NO stake</p>
                    <p className="text-xl font-semibold text-rose-600">
                      {formatUsdc(userNo)} USDC
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {isAdmin && (
            <AdminResolutionPanel market={market} onResolved={() => refetch()} />
          )}
        </aside>
      </div>

      {showBetDialog && walletAddress && (
        <PlaceBetDialog
          marketId={market.id}
          currentYesPool={market.yesPool}
          currentNoPool={market.noPool}
          marketTitle={market.title}
          walletAddress={walletAddress}
          open={showBetDialog}
          onClose={() => setShowBetDialog(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}

