"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ProtectedRoute({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <LoadingScreen message="Checking your session…" />;
  if (!user) return <LoadingScreen message="Redirecting to sign in…" />;
  return <>{children}</>;
}
