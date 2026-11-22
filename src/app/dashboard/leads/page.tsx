"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface LeadRecord {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: string;
  createdAt?: Timestamp | Date | string;
}

function formatDate(value: LeadRecord["createdAt"]): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : value.toDate();
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasClient, setHasClient] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadLeads() {
      setLoading(true);
      setError(null);
      setHasClient(true);
      if (!user) { setLoading(false); return; }
      if (!db) {
        setError("Firebase is not configured. Add the required settings from .env.example.");
        setLoading(false);
        return;
      }
      try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));
        const clientId = userSnapshot.data()?.clientId;
        if (typeof clientId !== "string" || !clientId.trim()) {
          if (!cancelled) { setHasClient(false); setLeads([]); }
          return;
        }
        const leadQuery = query(collection(db, "leads"), where("clientId", "==", clientId));
        const snapshot = await getDocs(leadQuery);
        if (cancelled) return;
        setLeads(snapshot.docs.map((leadDoc) => {
          const data = leadDoc.data();
          return {
            id: leadDoc.id,
            name: typeof data.name === "string" ? data.name : undefined,
            phone: typeof data.phone === "string" ? data.phone : undefined,
            email: typeof data.email === "string" ? data.email : undefined,
            source: typeof data.source === "string" ? data.source : undefined,
            status: typeof data.status === "string" ? data.status : undefined,
            createdAt: data.createdAt instanceof Date || typeof data.createdAt === "string" || (data.createdAt && typeof data.createdAt.toDate === "function") ? data.createdAt as Timestamp | Date | string : undefined,
          };
        }));
      } catch (cause) {
        console.error("Unable to load leads", cause);
        if (!cancelled) setError("Could not load leads. Check your connection and Firestore access rules, then try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadLeads();
    return () => { cancelled = true; };
  }, [user]);

  return <section className="space-y-5">
    <header>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h2>
      <p className="mt-1 text-sm text-slate-600">Review new customer opportunities connected to your workspace.</p>
    </header>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="p-6 text-sm text-slate-600" role="status">Loading leads…</p>
        : error ? <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>
        : !hasClient ? <p className="p-6 text-sm text-slate-600">Your account is not linked to a business workspace yet.</p>
        : leads.length === 0 ? <p className="p-6 text-sm text-slate-600">No leads found for this workspace.</p>
        : <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
              <th scope="col" className="px-5 py-3 font-semibold">Name</th><th scope="col" className="px-5 py-3 font-semibold">Contact</th><th scope="col" className="px-5 py-3 font-semibold">Source</th><th scope="col" className="px-5 py-3 font-semibold">Status</th><th scope="col" className="px-5 py-3 font-semibold">Created</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id}>
              <td className="px-5 py-3 font-medium text-slate-900">{lead.name || "Unnamed lead"}</td>
              <td className="px-5 py-3 text-slate-600">{lead.email || lead.phone || "—"}</td>
              <td className="px-5 py-3 text-slate-600">{lead.source || "—"}</td>
              <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{lead.status || "New"}</span></td>
              <td className="px-5 py-3 text-slate-600">{formatDate(lead.createdAt)}</td>
            </tr>)}</tbody>
          </table>
        </div>}
    </div>
  </section>;
}
