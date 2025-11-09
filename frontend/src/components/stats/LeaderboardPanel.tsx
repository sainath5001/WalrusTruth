"use client";

import useSWR from "swr";
import { env } from "@/lib/env";
import Link from "next/link";

type LeaderboardEntry = {
  address: string;
  totalWinnings: string;
  accuracy: number;
  recentMarkets: Array<{ id: string; result: string }>;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LeaderboardPanel() {
  const hasExternalLeaderboard = Boolean(env.leaderboardUrl);

  const { data, error } = useSWR<LeaderboardEntry[]>(
    hasExternalLeaderboard ? env.leaderboardUrl : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const fallbackLeaderboard: LeaderboardEntry[] = [
    {
      address: "0xWalrusOracle",
      totalWinnings: "1,200 USDC",
      accuracy: 92,
      recentMarkets: [
        { id: "8", result: "YES" },
        { id: "6", result: "NO" },
      ],
    },
    {
      address: "0xTruthSeeker",
      totalWinnings: "840 USDC",
      accuracy: 88,
      recentMarkets: [
        { id: "7", result: "NO" },
        { id: "5", result: "YES" },
      ],
    },
    {
      address: "0xEvidenceMaxi",
      totalWinnings: "720 USDC",
      accuracy: 80,
      recentMarkets: [
        { id: "4", result: "VOID" },
        { id: "3", result: "YES" },
      ],
    },
  ];

  const leaderboard = data ?? fallbackLeaderboard;

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Top predictors</h3>
        {hasExternalLeaderboard && (
          <Link
            href={env.leaderboardUrl}
            className="text-xs font-semibold text-aqua-600 underline-offset-4 hover:underline"
          >
            View full board →
          </Link>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-500">
          Failed to load live leaderboard; showing sample data.
        </p>
      )}
      <div className="mt-5 space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.address}
            className="rounded-2xl bg-white/70 p-4 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-600">
                  #{index + 1} {entry.address}
                </p>
                <p className="text-xs text-foreground/50">
                  Accuracy {entry.accuracy}% • Winnings {entry.totalWinnings}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs text-foreground/60">
              {entry.recentMarkets.map((market) => (
                <span
                  key={market.id}
                  className="rounded-full bg-brand-100/70 px-3 py-1 text-brand-700"
                >
                  Market #{market.id}: {market.result}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

