"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { Address } from "viem";
import { toast } from "react-hot-toast";
import { useMarketsWithWagers } from "@/hooks/useMarkets";
import { useUsdcBalance, formatUsdcBalance } from "@/hooks/useUsdc";
import { useIsAdmin } from "@/providers";
import { useWallet } from "@/hooks/useWallet";
import { MarketList } from "./MarketList";
import { LeaderboardPanel } from "../stats/LeaderboardPanel";
import { env } from "@/lib/env";

const gradientBg =
  "relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-glow backdrop-blur-xl";

export function MarketDashboard() {
  const { address, isConnected, isConnecting, connect, disconnect, connectors } = useWallet();
  const isAdmin = useIsAdmin();

  const walletAddress = useMemo(
    () => (address ? (address as Address) : undefined),
    [address],
  );

  const { data: markets, isLoading, refetch } = useMarketsWithWagers(walletAddress);
  const { data: usdcBalance } = useUsdcBalance(walletAddress);

  const onConnectClick = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect wallet",
      );
    }
  }, [connect]);

  const onDisconnectClick = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect wallet",
      );
    }
  }, [disconnect]);

  const heroCta = (
    <div className={`${gradientBg} p-10`}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-200/60 via-white/60 to-aqua-200/60 blur-3xl opacity-70" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center rounded-full bg-aqua-100 px-4 py-1 text-sm font-medium text-aqua-700">
            Walrus Truth Prediction Markets
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Bet on the truth. Stake USDC on Sepolia YES/NO markets.
          </h1>
          <p className="text-lg text-foreground/70">
            Connect your wallet, back your convictions, and track evidence-rich claims settled on-chain.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white/80 p-6 text-foreground shadow-glow backdrop-blur">
          <div>
            <p className="text-sm font-medium text-foreground/70">Connected wallet</p>
            <p className="truncate text-xl font-semibold">
              {walletAddress ?? "Connect to view address"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/70">Balance</p>
            <p className="text-3xl font-bold">
              {usdcBalance !== undefined
                ? `${formatUsdcBalance(usdcBalance)} USDC`
                : "--"}
            </p>
          </div>
          <button
            onClick={isConnected ? onDisconnectClick : onConnectClick}
            className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            disabled={isConnecting || (!isConnected && connectors.length === 0)}
          >
            {isConnecting
              ? "Connecting..."
              : isConnected
                ? "Disconnect wallet"
                : "Connect wallet"}
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="block w-full rounded-full border border-brand-200 px-6 py-3 text-center font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Go to Admin Console
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:px-0">
      {heroCta}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Active Markets</h2>
          </div>
          <MarketList
            loading={isLoading}
            markets={markets ?? []}
            walletAddress={walletAddress}
            authenticated={isConnected}
            onRefresh={() => refetch()}
          />
        </div>
        <aside className="space-y-6">
          <LeaderboardPanel />
          <div className={`${gradientBg} p-6`}>
            <h3 className="text-xl font-semibold text-foreground">Truth Pages</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Each resolved market has a Walrus-hosted metadata page with evidence and the final outcome. Click into any market to explore the receipts and on-chain settlement.
            </p>
            <Link
              href="/truth"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-aqua-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-aqua-400"
            >
              Browse Truth Pages →
            </Link>
          </div>
          <div className={`${gradientBg} p-6`}>
            <h3 className="text-xl font-semibold text-foreground">Walrus Integrations</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Evidence uploads are pinned via Walrus. Ensure{" "}
              <code className="rounded bg-white/60 px-2 py-1 text-xs">
                {env.walrusUploadUrl || "upload URL"}
              </code>{" "}
              is configured in <code>.env.local</code>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

