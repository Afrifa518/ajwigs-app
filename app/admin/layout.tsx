import type { ReactNode } from "react";

import AdminShell from "@/app/admin/_components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
