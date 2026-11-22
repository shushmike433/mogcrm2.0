"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return <LoadingScreen message="Loading MogCRM…" />;
}
