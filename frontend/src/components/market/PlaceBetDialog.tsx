"use client";

import { useState } from "react";
import { Address, parseUnits } from "viem";
import { toast } from "react-hot-toast";
import { useWriteContract, usePublicClient } from "wagmi";
import {
  formatUsdcBalance,
  useApproveUsdc,
  useUsdcAllowance,
} from "@/hooks/useUsdc";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";

type PlaceBetDialogProps = {
  marketId: bigint;
  currentYesPool: bigint;
  currentNoPool: bigint;
  marketTitle: string;
  walletAddress: Address;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const tabs = [
  { key: "yes", label: "Bet YES", outcome: 1 },
  { key: "no", label: "Bet NO", outcome: 2 },
] as const;

export function PlaceBetDialog({
  marketId,
  currentYesPool,
  currentNoPool,
  marketTitle,
  walletAddress,
  open,
  onClose,
  onSuccess,
}: PlaceBetDialogProps) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("yes");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allowanceQuery = useUsdcAllowance(walletAddress, WALRUS_MARKET_CONTRACT.address);
  const approveMutation = useApproveUsdc(WALRUS_MARKET_CONTRACT.address);

  if (!open) return null;

  const amountParsed = amount ? parseUnits(amount, 6) : 0n;
  const needsApproval =
    allowanceQuery.data !== undefined && allowanceQuery.data < amountParsed;

  const payoutPreview = (() => {
    if (!amountParsed || amountParsed <= 0n) return "--";
    const yesPool = currentYesPool;
    const noPool = currentNoPool;
    if (tab === "yes") {
      const newYesPool = yesPool + amountParsed;
      if (newYesPool === 0n) return "--";
      const totalPool = newYesPool + noPool;
      const payout = (amountParsed * totalPool) / newYesPool;
      return `${formatUsdcBalance(payout)} USDC`;
    } else {
      const newNoPool = noPool + amountParsed;
      if (newNoPool === 0n) return "--";
      const totalPool = yesPool + newNoPool;
      const payout = (amountParsed * totalPool) / newNoPool;
      return `${formatUsdcBalance(payout)} USDC`;
    }
  })();

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await approveMutation.mutateAsync();
    } finally {
      setSubmitting(false);
    }
  };

  const handleBet = async () => {
    try {
      if (!amountParsed || amountParsed <= 0n) {
        toast.error("Enter an amount");
        return;
      }
      setSubmitting(true);
      if (!publicClient) {
        throw new Error("Public client not ready");
      }
      const hash = await writeContractAsync({
        address: WALRUS_MARKET_CONTRACT.address,
        abi: WALRUS_MARKET_CONTRACT.abi,
        functionName: "placeBet",
        args: [
          marketId,
          tab === "yes" ? 1 : 2,
          amountParsed,
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Bet placed!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Bet on “{marketTitle}”
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white px-3 py-1 text-sm text-foreground/60 hover:bg-brand-100"
          >
            Close
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-brand-50/80 p-3">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-white/80 p-1 text-sm font-semibold">
            {tabs.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTab(opt.key)}
                className={`rounded-full px-4 py-2 transition ${tab === opt.key
                    ? "bg-brand-500 text-white shadow"
                    : "text-brand-600 hover:bg-brand-100"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/70">
              Stake amount (USDC)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/90 p-4 text-lg shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/70 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground/50">
                Potential payout
              </p>
              <p className="text-lg font-semibold text-brand-600">{payoutPreview}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-foreground/50">
                Current pools
              </p>
              <p className="text-sm text-foreground/70">
                YES: {formatUsdcBalance(currentYesPool)} • NO:{" "}
                {formatUsdcBalance(currentNoPool)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-muted bg-white px-6 py-3 font-medium text-foreground/70 transition hover:border-brand-200 hover:text-brand-600"
            disabled={submitting}
          >
            Cancel
          </button>
          {needsApproval ? (
            <button
              onClick={handleApprove}
              className="flex-1 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-500 disabled:cursor-progress"
              disabled={submitting}
            >
              Approve USDC
            </button>
          ) : (
            <button
              onClick={handleBet}
              className="flex-1 rounded-full bg-aqua-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-aqua-400 disabled:cursor-progress"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm bet"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

