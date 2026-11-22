"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query, where, type Timestamp } from "firebase/firestore";
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

interface ClientRecord {
  id: string;
  businessName: string;
  ownerEmail?: string;
  timezone?: string;
}

function formatDate(value: LeadRecord["createdAt"]): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : value.toDate();
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function LeadsPage() {
  const { user } = useAuth();
  const userId = user?.uid;
  const userEmail = user?.email;
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasClient, setHasClient] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaceData() {
      setLoading(true);
      setError(null);
      setClient(null);
      setLeads([]);
      setHasClient(true);

      if (!userId) {
        setLoading(false);
        return;
      }
      if (!db) {
        setError("Firebase is not configured. Add the required settings from .env.example.");
        setLoading(false);
        return;
      }

      try {
        // Prefer the explicit user-to-client association when it exists.
        const userSnapshot = await getDoc(doc(db, "users", userId));
        const linkedClientId = userSnapshot.data()?.clientId;
        let clientSnapshot;

        if (typeof linkedClientId === "string" && linkedClientId.trim()) {
          clientSnapshot = await getDoc(doc(db, "clients", linkedClientId.trim()));
          if (!clientSnapshot.exists()) {
            throw new Error("The linked client document was not found.");
          }
        } else if (userEmail) {
          // Existing client records may be associated by ownerEmail before a
          // users/{uid}.clientId link has been added.
          const ownerQuery = query(
            collection(db, "clients"),
            where("ownerEmail", "==", userEmail.trim()),
            limit(2),
          );
          const ownerSnapshot = await getDocs(ownerQuery);
          if (ownerSnapshot.empty) {
            if (!cancelled) setHasClient(false);
            return;
          }
          if (ownerSnapshot.size > 1) {
            throw new Error("More than one client uses this owner email. Add a clientId to your user record to select the right workspace.");
          }
          clientSnapshot = ownerSnapshot.docs[0];
        } else {
          if (!cancelled) setHasClient(false);
          return;
        }

        const clientData = clientSnapshot.data();
        const resolvedClient: ClientRecord = {
          id: clientSnapshot.id,
          businessName: typeof clientData.businessName === "string" && clientData.businessName.trim()
            ? clientData.businessName.trim()
            : "Business workspace",
          ownerEmail: typeof clientData.ownerEmail === "string" ? clientData.ownerEmail : undefined,
          timezone: typeof clientData.timezone === "string" ? clientData.timezone : undefined,
        };
        if (cancelled) return;
        setClient(resolvedClient);

        // Load the clinic's leads only after resolving its client document.
        const leadQuery = query(
          collection(db, "leads"),
          where("clientId", "==", resolvedClient.id),
        );
        const leadSnapshot = await getDocs(leadQuery);
        if (cancelled) return;
        setLeads(leadSnapshot.docs.map((leadDoc) => {
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
        console.error("Unable to load client workspace and leads", cause);
        if (!cancelled) {
          setError(cause instanceof Error
            ? cause.message
            : "Could not load workspace data. Check your connection and Firestore access rules, then try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWorkspaceData();
    return () => { cancelled = true; };
  }, [userId, userEmail]);

  return <section className="space-y-5">
    <header>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h2>
      <p className="mt-1 text-sm text-slate-600">Review customer opportunities connected to your workspace.</p>
      {client && <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Business workspace</p>
        <p className="mt-1 font-semibold text-slate-900">{client.businessName}</p>
        {client.timezone && <p className="mt-1 text-xs text-slate-600">{client.timezone}</p>}
      </div>}
    </header>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="p-6 text-sm text-slate-600" role="status">Loading workspace and leads…</p>
        : error ? <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>
        : !hasClient ? <p className="p-6 text-sm text-slate-600">No business workspace is linked to this account. Add a <code>clientId</code> to <code>users/{"{uid}"}</code>, or make sure a client document has your signed-in email in <code>ownerEmail</code>.</p>
        : leads.length === 0 ? <p className="p-6 text-sm text-slate-600">No leads found for {client?.businessName ?? "this workspace"}. The client record loaded, but no documents in <code>leads</code> have its ID in the <code>clientId</code> field.</p>
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
