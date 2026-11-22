"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export interface ClientDocument {
  id: string;
  businessName?: string;
  [field: string]: unknown;
}

interface UseClientResult {
  clientId: string | null;
  client: ClientDocument | null;
  loading: boolean;
  error: string | null;
}

export function useClient(): UseClientResult {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [clientId, setClientId] = useState<string | null>(null);
  const [client, setClient] = useState<ClientDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClient() {
      setClientId(null);
      setClient(null);
      setError(null);

      if (authLoading) return;
      if (!userId) {
        setLoading(false);
        return;
      }
      if (!db) {
        setError("Firebase is not configured. Check your .env.local settings.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userSnapshot = await getDoc(doc(db, "users", userId));
        const value = userSnapshot.data()?.clientId;
        if (typeof value !== "string" || !value.trim()) {
          if (!cancelled) setLoading(false);
          return;
        }

        const resolvedClientId = value.trim();
        const clientSnapshot = await getDoc(doc(db, "clients", resolvedClientId));
        if (!clientSnapshot.exists()) {
          throw new Error("The client linked to this account was not found.");
        }

        if (!cancelled) {
          setClientId(resolvedClientId);
          setClient({ id: clientSnapshot.id, ...clientSnapshot.data() });
          setLoading(false);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load the client workspace.");
          setLoading(false);
        }
      }
    }

    void loadClient();
    return () => { cancelled = true; };
  }, [userId, authLoading]);

  return { clientId, client, loading: authLoading || loading, error };
}
