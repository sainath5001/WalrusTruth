import { Suspense } from "react";
import { MarketDetail } from "@/components/market/MarketDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MarketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const marketId = BigInt(id);
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading market...</div>}>
      <MarketDetail marketId={marketId} />
    </Suspense>
  );
}

