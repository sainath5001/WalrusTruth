"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useWriteContract, usePublicClient } from "wagmi";
import { MarketWithWager } from "@/types/market";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";

type AdminResolutionPanelProps = {
  market: MarketWithWager;
  onResolved: () => void;
};

export function AdminResolutionPanel({ market, onResolved }: AdminResolutionPanelProps) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [submitting, setSubmitting] = useState(false);

  const resolveMarket = async (outcome: 1 | 2 | 3) => {
    try {
      setSubmitting(true);
      if (!publicClient) {
        throw new Error("Public client not ready");
      }
      const hash = await writeContractAsync({
        address: WALRUS_MARKET_CONTRACT.address,
        abi: WALRUS_MARKET_CONTRACT.abi,
        functionName: "resolveMarket",
        args: [market.id, outcome],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Market resolved");
      onResolved();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve market");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow">
      <h2 className="text-xl font-semibold text-foreground">Admin Resolution</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Deadline passed? Choose the truthful outcome based on evidence and on-chain
        settlement will run automatically.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => resolveMarket(1)}
          disabled={submitting}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:bg-emerald-300"
        >
          Resolve YES
        </button>
        <button
          onClick={() => resolveMarket(2)}
          disabled={submitting}
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:bg-rose-300"
        >
          Resolve NO
        </button>
        <button
          onClick={() => resolveMarket(3)}
          disabled={submitting}
          className="rounded-full bg-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-400 disabled:bg-slate-300"
        >
          Void market
        </button>
      </div>
    </div>
  );
}

