import dynamic from "next/dynamic";
import { Suspense } from "react";

const AdminConsole = dynamic(
  () => import("@/components/admin/AdminConsole").then((mod) => mod.AdminConsole),
  { ssr: false },
);

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading admin console…</div>}>
      <AdminConsole />
    </Suspense>
  );
}

