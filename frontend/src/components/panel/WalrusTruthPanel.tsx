"use client";

import useSWR from "swr";

type WalrusTruthPanelProps = {
  metadataUri: string;
  outcome: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WalrusTruthPanel({ metadataUri, outcome }: WalrusTruthPanelProps) {
  const isHttp = metadataUri.startsWith("http");
  const { data, error, isLoading } = useSWR(
    isHttp ? metadataUri : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return (
    <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glow">
      <h2 className="text-xl font-semibold text-foreground">Truth Page</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Official evidence bundle and final resolution metadata hosted on Walrus.
      </p>
      <div className="mt-4 space-y-4 text-sm text-foreground/70">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">Outcome</p>
          <p className="text-lg font-semibold text-brand-600">{outcome}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            Metadata URI
          </p>
          <a
            href={metadataUri}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-aqua-600 underline underline-offset-2 hover:text-aqua-500"
          >
            {metadataUri}
          </a>
        </div>
        {isLoading && <p className="text-xs text-foreground/50">Fetching Walrus data…</p>}
        {error && (
          <p className="text-xs text-rose-500">
            Failed to load Walrus metadata. Ensure the URI is public.
          </p>
        )}
        {data && (
          <pre className="max-h-64 overflow-auto rounded-2xl bg-black/5 p-4 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

