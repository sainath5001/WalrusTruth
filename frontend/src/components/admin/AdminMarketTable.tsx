"use client";

import { useMarkets } from "@/hooks/useMarkets";
import { useMemo } from "react";
import Link from "next/link";
import { formatUsdc } from "@/lib/contract";

export function AdminMarketTable() {
  const { data: markets, isLoading } = useMarkets();

  const rows = useMemo(() => {
    if (!markets) return [];
    return markets.map((market) => ({
      id: market.id,
      title: market.title,
      status: market.status,
      outcome: market.outcome,
      deadline: market.deadline.toISOString(),
      yesPool: formatUsdc(market.yesPool),
      noPool: formatUsdc(market.noPool),
    }));
  }, [markets]);

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow">
      <h2 className="text-xl font-semibold text-foreground">Markets overview</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Monitor status, pool sizes, and resolution outcomes for each claim.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/40 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-foreground/60">
              <th className="py-3 pr-4 font-medium">Market</th>
              <th className="py-3 pr-4 font-medium">Deadline</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Outcome</th>
              <th className="py-3 pr-4 font-medium">YES</th>
              <th className="py-3 pr-4 font-medium">NO</th>
              <th className="py-3 pr-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 text-foreground/80">
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  Loading markets…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-foreground/60">
                  No markets found. Create one to get started.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id.toString()} className="hover:bg-white/60">
                <td className="py-4 pr-4">
                  <div className="font-medium text-foreground">{row.title}</div>
                  <div className="text-xs text-foreground/60">
                    #{row.id.toString()}
                  </div>
                </td>
                <td className="py-4 pr-4 text-xs text-foreground/60">
                  {new Date(row.deadline).toLocaleString()}
                </td>
                <td className="py-4 pr-4 text-xs font-semibold">{row.status}</td>
                <td className="py-4 pr-4 text-xs font-semibold">{row.outcome}</td>
                <td className="py-4 pr-4 text-xs text-emerald-600">{row.yesPool}</td>
                <td className="py-4 pr-4 text-xs text-rose-600">{row.noPool}</td>
                <td className="py-4 pr-4 text-right">
                  <Link
                    href={`/markets/${row.id.toString()}`}
                    className="inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-400"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

