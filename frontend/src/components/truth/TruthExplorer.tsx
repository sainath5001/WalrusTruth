"use client";

import { useMarkets } from "@/hooks/useMarkets";
import { formatUsdc } from "@/lib/contract";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export function TruthExplorer() {
  const { data: markets, isLoading } = useMarkets();

  const resolved = markets?.filter((market) => market.status === "Resolved") ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-foreground">Walrus Truth Pages</h1>
        <p className="mt-3 text-sm text-foreground/70">
          Browse resolved YES/NO markets with preserved evidence bundles hosted on Walrus.
        </p>
      </div>
      <div className="space-y-4">
        {isLoading && (
          <div className="rounded-3xl border border-white/40 bg-white/70 p-10 text-center text-foreground/60">
            Loading resolved markets…
          </div>
        )}
        {!isLoading && resolved.length === 0 && (
          <div className="rounded-3xl border border-white/40 bg-white/70 p-10 text-center text-foreground/60">
            No resolved markets yet. Stake on active claims to write the next truth page.
          </div>
        )}
        {resolved.map((market) => (
          <TruthRow key={market.id.toString()} metadataUri={market.metadataURI} market={market} />
        ))}
      </div>
    </div>
  );
}

function TruthRow({
  market,
  metadataUri,
}: {
  market: { title: string; id: bigint; outcome: string; yesPool: bigint; noPool: bigint };
  metadataUri: string;
}) {
  const { data, error } = useSWR(metadataUri.startsWith("http") ? metadataUri : null, fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="rounded-3xl border border-white/30 bg-white/75 p-6 shadow-glow backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            Market #{market.id.toString()}
          </p>
          <h2 className="text-xl font-semibold text-foreground">{market.title}</h2>
          <p className="text-sm text-foreground/60">Outcome: {market.outcome}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 text-sm text-foreground/70">
          <div className="flex items-center justify-between">
            <span>YES pool</span>
            <span className="font-semibold text-emerald-600">
              {formatUsdc(market.yesPool)} USDC
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>NO pool</span>
            <span className="font-semibold text-rose-600">
              {formatUsdc(market.noPool)} USDC
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-foreground/70">
        <p className="text-xs uppercase tracking-wide text-foreground/50">Walrus evidence</p>
        <a
          href={metadataUri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-aqua-600 underline underline-offset-2 hover:text-aqua-500"
        >
          {metadataUri}
        </a>
        {error && (
          <p className="mt-2 text-xs text-rose-500">
            Unable to fetch Walrus metadata. Check storage permissions.
          </p>
        )}
        {data && (
          <pre className="mt-3 max-h-48 overflow-auto rounded-2xl bg-black/5 p-3 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          href={`/markets/${market.id.toString()}`}
          className="text-brand-600 underline underline-offset-4 hover:text-brand-500"
        >
          View market →
        </Link>
      </div>
    </div>
  );
}

