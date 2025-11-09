import dynamic from "next/dynamic";
import { Suspense } from "react";

const TruthExplorer = dynamic(
  () => import("@/components/truth/TruthExplorer").then((mod) => mod.TruthExplorer),
  { ssr: false },
);

export default function TruthPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading truth pages…</div>}>
      <TruthExplorer />
    </Suspense>
  );
}

