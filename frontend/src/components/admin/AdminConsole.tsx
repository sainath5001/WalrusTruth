"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useIsAdmin } from "@/providers";
import { useWallet } from "@/hooks/useWallet";
import { CreateMarketForm } from "./CreateMarketForm";
import { AdminMarketTable } from "./AdminMarketTable";

export function AdminConsole() {
  const isAdmin = useIsAdmin();
  const { isConnected, connect, isConnecting } = useWallet();
  const [tab, setTab] = useState<"markets" | "create">("markets");

  if (!isConnected) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-glow">
          <h1 className="text-3xl font-semibold text-foreground">Admin access</h1>
          <p className="mt-3 text-sm text-foreground/70">
            Connect with a wallet address listed in <code>NEXT_PUBLIC_ADMIN_ADDRESSES</code>.
          </p>
          <button
            onClick={() =>
              connect().catch((error) => {
                console.error(error);
                toast.error(
                  error instanceof Error ? error.message : "Failed to connect wallet",
                );
              })
            }
            className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect wallet"}
          </button>
          <div className="mt-4 text-xs text-foreground/50">
            Need help? Update <code>.env.local</code> with your admin wallet.
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-glow">
          <h1 className="text-3xl font-semibold text-foreground">Restricted</h1>
          <p className="mt-3 text-sm text-foreground/70">
            This address is not authorized to act as an oracle/admin. Update your
            configuration or switch accounts.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-aqua-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-aqua-400"
          >
            Back to markets
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyContract = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/truth");
      toast.success("Truth pages link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Walrus Admin Console</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Create markets, resolve outcomes, and manage Walrus truth metadata.
            </p>
            <button
              onClick={handleCopyContract}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-xs font-medium text-brand-600 hover:bg-brand-100"
            >
              Copy truth pages link
            </button>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/60 px-4 py-2 text-sm font-medium text-foreground/70 transition hover:border-brand-200 hover:text-brand-600"
          >
            ← Back to app
          </Link>
        </div>
        <div className="mt-6 rounded-full bg-white/70 p-1 text-sm font-semibold text-foreground/60">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setTab("markets")}
              className={`rounded-full px-4 py-2 transition ${tab === "markets"
                  ? "bg-brand-600 text-white shadow"
                  : "hover:bg-brand-100 hover:text-brand-700"
                }`}
            >
              Markets
            </button>
            <button
              onClick={() => setTab("create")}
              className={`rounded-full px-4 py-2 transition ${tab === "create"
                  ? "bg-brand-600 text-white shadow"
                  : "hover:bg-brand-100 hover:text-brand-700"
                }`}
            >
              Create new market
            </button>
          </div>
        </div>
      </div>

      {tab === "markets" ? <AdminMarketTable /> : <CreateMarketForm />}
    </div>
  );
}

