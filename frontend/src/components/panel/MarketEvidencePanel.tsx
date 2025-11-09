"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useWriteContract, usePublicClient } from "wagmi";
import { env } from "@/lib/env";
import { WALRUS_MARKET_CONTRACT } from "@/lib/contract";
import { useWallet } from "@/hooks/useWallet";

type MarketEvidencePanelProps = {
  marketId: bigint;
};

export function MarketEvidencePanel({ marketId }: MarketEvidencePanelProps) {
  const queryClient = useQueryClient();
  const { isConnected, connect } = useWallet();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const handleUpload = async () => {
    if (!isConnected) {
      connect().catch((error) => {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to connect wallet",
        );
      });
      return;
    }
    if (!file && !evidenceUrl) {
      toast.error("Attach a file or provide a URL");
      return;
    }
    if (!env.walrusUploadUrl) {
      toast.error("Walrus upload URL missing");
      return;
    }
    try {
      setUploading(true);
      let uri = evidenceUrl.trim();
      if (!uri && file) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch(env.walrusUploadUrl, {
          method: "POST",
          body: form,
        });
        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        uri = data.uri ?? data.url ?? "";
        if (!uri) throw new Error("Upload response missing URI");
      }
      if (!uri) {
        toast.error("Could not resolve Walrus URI");
        return;
      }
      if (!publicClient) {
        throw new Error("Public client not ready");
      }
      const hash = await writeContractAsync({
        address: WALRUS_MARKET_CONTRACT.address,
        abi: WALRUS_MARKET_CONTRACT.abi,
        functionName: "submitEvidence",
        args: [marketId, uri],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Evidence submitted!");
      setFile(null);
      setEvidenceUrl("");
      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit evidence");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow">
      <h2 className="text-xl font-semibold text-foreground">Submit evidence</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Attach proof for this claim—screenshots, links, or Walrus bundles. Evidence is
        immutable and helps the admin resolve the market truthfully.
      </p>
      <div className="mt-4 space-y-3">
        <input
          type="file"
          accept="image/*,.pdf,.txt,.json"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-dashed border-brand-200 bg-white/70 px-4 py-3 text-sm text-foreground/70 file:mr-4 file:rounded-full file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-brand-300"
        />
        <input
          type="url"
          placeholder="https://twitter.com/... or walrus://..."
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
          className="w-full rounded-2xl border border-white/60 bg-white/80 p-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          onClick={handleUpload}
          className="rounded-full bg-aqua-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-aqua-400 disabled:cursor-progress disabled:bg-aqua-300"
          disabled={uploading}
        >
          {uploading ? "Submitting..." : "Submit to Walrus"}
        </button>
      </div>
    </div>
  );
}

