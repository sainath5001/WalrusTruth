"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useWriteContract, usePublicClient } from "wagmi";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";
import { env } from "@/lib/env";
import { useWallet } from "@/hooks/useWallet";

export function CreateMarketForm() {
  const { isConnected, connect } = useWallet();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [metadataUri, setMetadataUri] = useState(env.walrusMetadataBase);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected) {
      connect().catch((error) => {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
      });
      return;
    }
    if (!title || !description || !deadline || !metadataUri) {
      toast.error("Fill in all fields");
      return;
    }
    try {
      setSubmitting(true);
      const deadlineEpoch = Math.floor(new Date(deadline).getTime() / 1000);
      if (deadlineEpoch <= Date.now() / 1000) {
        toast.error("Deadline must be in the future");
        setSubmitting(false);
        return;
      }
      if (!publicClient) {
        throw new Error("Public client not ready");
      }
      const hash = await writeContractAsync({
        address: WALRUS_MARKET_CONTRACT.address,
        abi: WALRUS_MARKET_CONTRACT.abi,
        functionName: "createMarket",
        args: [title, description, BigInt(deadlineEpoch), metadataUri],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Market created!");
      setTitle("");
      setDescription("");
      setDeadline("");
      setMetadataUri(env.walrusMetadataBase);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create market");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-glow">
      <h2 className="text-2xl font-semibold text-foreground">Launch a new market</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Define a claim, link a Walrus metadata page, and set a resolution deadline.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground/70">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Will the Walrus token launch by Q1?"
            className="mt-2 w-full rounded-2xl border border-white/60 bg-white/90 p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/70">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Context, rules, and what counts as definitive evidence."
            className="mt-2 w-full rounded-2xl border border-white/60 bg-white/90 p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground/70">
              Deadline (UTC)
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/90 p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/70">
              Walrus Metadata URI
            </label>
            <input
              value={metadataUri}
              onChange={(event) => setMetadataUri(event.target.value)}
              placeholder="https://walrus.xyz/metadata/claim-id"
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/90 p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-progress disabled:bg-brand-300"
            disabled={submitting}
          >
            {submitting ? "Deploying..." : "Create market"}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-medium text-foreground/70 transition hover:border-brand-200 hover:text-brand-600"
            onClick={() => {
              setTitle("");
              setDescription("");
              setDeadline("");
              setMetadataUri(env.walrusMetadataBase);
            }}
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}

