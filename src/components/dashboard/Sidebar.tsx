"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, PhoneCall, Settings, Star, Users, X } from "lucide-react";
import { auth } from "@/lib/firebase";

const navigation = [
  { label: "Overview", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Calls", href: "/dashboard/calls", Icon: PhoneCall },
  { label: "Leads", href: "/dashboard/leads", Icon: Users },
  { label: "Appointments", href: "/dashboard/appointments", Icon: CalendarDays },
  { label: "Reviews", href: "/dashboard/reviews", Icon: Star },
  { label: "Settings", href: "/dashboard/settings", Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    if (!auth) {
      setSignOutError("Firebase is not configured.");
      return;
    }
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    }
  }

  function links(onNavigate?: () => void) {
    return navigation.map(({ label, href, Icon }) => {
      const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
      return (
        <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
          <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />{label}
        </Link>
      );
    });
  }

  return <>
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-slate-950 px-4 text-white lg:hidden">
      <Link href="/dashboard" className="font-bold tracking-tight">MogCRM <span className="text-indigo-400">AI</span></Link>
      <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen} className="rounded-md p-2 hover:bg-slate-800"><Menu className="h-5 w-5" /></button>
    </div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
      <button className="absolute inset-0 bg-slate-950/60" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      <aside className="relative flex h-full w-72 flex-col bg-slate-950 p-5 text-white shadow-xl">
        <div className="mb-8 flex items-center justify-between"><Link href="/dashboard" className="font-bold">MogCRM <span className="text-indigo-400">AI</span></Link><button onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="rounded-md p-2 hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
        <nav aria-label="Main navigation" className="space-y-1">{links(() => setMobileOpen(false))}</nav>
        <div className="mt-auto border-t border-slate-800 pt-4">{signOutError && <p className="mb-2 text-xs text-red-300" role="alert">{signOutError}</p>}<button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut className="h-5 w-5" />Sign out</button></div>
      </aside>
    </div>}
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-950 p-5 text-white lg:flex">
      <Link href="/dashboard" className="mb-9 px-3 text-lg font-bold tracking-tight">MogCRM <span className="text-indigo-400">AI</span></Link>
      <nav aria-label="Main navigation" className="space-y-1">{links()}</nav>
      <div className="mt-auto border-t border-slate-800 pt-4">{signOutError && <p className="mb-2 text-xs text-red-300" role="alert">{signOutError}</p>}<button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut className="h-5 w-5" />Sign out</button></div>
    </aside>
  </>;
}
