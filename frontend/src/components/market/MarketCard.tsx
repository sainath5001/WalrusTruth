"use client";

import { useState } from "react";
import Link from "next/link";
import { type MarketWithWager } from "@/types/market";
import { formatUsdc } from "@/lib/contract";
import { Address } from "viem";
import { useCountdown } from "@/hooks/useCountdown";
import { PlaceBetDialog } from "./PlaceBetDialog";
import { toast } from "react-hot-toast";
import { useWallet } from "@/hooks/useWallet";

type MarketCardProps = {
  market: MarketWithWager;
  walletAddress?: Address;
  authenticated: boolean;
  compact?: boolean;
  onRefresh?: () => void;
};

const statusChip = {
  Open: "bg-aqua-100 text-aqua-700",
  Resolved: "bg-brand-100 text-brand-700",
};

const outcomeChip = {
  Undecided: "bg-white/70 text-foreground/70",
  Yes: "bg-emerald-100 text-emerald-700",
  No: "bg-rose-100 text-rose-700",
  Void: "bg-slate-200 text-slate-600",
};

export function MarketCard({
  market,
  walletAddress,
  authenticated,
  compact = false,
  onRefresh,
}: MarketCardProps) {
  const [showBetDialog, setShowBetDialog] = useState(false);
  const { connect, isConnecting } = useWallet();

  const totalPool = market.yesPool + market.noPool;
  const yesRatio =
    totalPool === 0n ? 50 : Number((market.yesPool * 10000n) / totalPool) / 100;
  const noRatio = 100 - yesRatio;

  const { display: countdown, expired } = useCountdown(market.deadline);

  const userYes = market.userWager?.yesAmount ?? 0n;
  const userNo = market.userWager?.noAmount ?? 0n;
  const userExposure = userYes + userNo;

  const handleBetClick = () => {
    if (!authenticated || !walletAddress) {
      connect().catch((error) => {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to connect wallet",
        );
      });
      return;
    }
    if (market.status !== "Open" || expired) {
      toast.error("This market is closed");
      return;
    }
    setShowBetDialog(true);
  };

  const containerClass = compact
    ? "space-y-3 rounded-2xl border border-white/40 bg-white/80 p-5 shadow-lg backdrop-blur-2xl"
    : "space-y-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow backdrop-blur-2xl";

  return (
    <div className={containerClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChip[market.status]}`}
            >
              {market.status}
            </span>
            {market.status === "Resolved" && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${outcomeChip[market.outcome]}`}
              >
                Outcome: {market.outcome}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">
            {market.title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-foreground/70">
            {market.description}
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 text-sm text-foreground/70">
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
            <span>Wagers</span>
            <span className="font-semibold">{market.bettorCount.toString()}</span>
          </div>
        </div>
      </div>

      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        <div className="flex items-center justify-between text-sm font-semibold text-foreground/70">
          <span>YES pool • {formatUsdc(market.yesPool)} USDC</span>
          <span>NO pool • {formatUsdc(market.noPool)} USDC</span>
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
          <span>YES {yesRatio.toFixed(1)}%</span>
          <span>NO {noRatio.toFixed(1)}%</span>
        </div>
      </div>

      {userExposure > 0n && (
        <div className="rounded-2xl bg-brand-50/70 p-4 text-sm">
          <p className="font-semibold text-brand-700">Your position</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {userYes > 0n && (
              <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                <p className="text-xs uppercase text-foreground/60">YES stake</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatUsdc(userYes)} USDC
                </p>
              </div>
            )}
            {userNo > 0n && (
              <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                <p className="text-xs uppercase text-foreground/60">NO stake</p>
                <p className="text-lg font-semibold text-rose-600">
                  {formatUsdc(userNo)} USDC
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {market.status === "Open" && !expired ? (
          <button
            onClick={handleBetClick}
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
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
          href={`/markets/${market.id.toString()}`}
          className="text-sm font-semibold text-foreground/70 underline-offset-4 hover:text-brand-600 hover:underline"
        >
          View details →
        </Link>
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
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

