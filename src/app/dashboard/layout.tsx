"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useClient } from "@/hooks/useClient";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/calls": "Calls",
  "/dashboard/leads": "Leads",
  "/dashboard/appointments": "Appointments",
  "/dashboard/reviews": "Reviews",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { client } = useClient();
  const title = titles[pathname] ?? "Dashboard";

  return <ProtectedRoute>
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <div className="max-w-[60%] text-right">
            {client?.businessName && <p className="truncate text-sm font-medium text-slate-800">{client.businessName}</p>}
            <p className="truncate text-xs text-slate-500" title={user?.email ?? undefined}>{user?.email ?? "Signed in"}</p>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  </ProtectedRoute>;
}
