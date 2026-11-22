"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useClient } from "@/hooks/useClient";

type Row = Record<string, unknown> & { id: string };

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
      : "—";
  }
  if (value instanceof Date) return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value);
  return JSON.stringify(value);
}

export default function ClientCollectionTable({
  title,
  description,
  collectionName,
}: {
  title: string;
  description: string;
  collectionName: string;
}) {
  const { clientId, loading: clientLoading, error: clientError } = useClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRows() {
      setRows([]);
      setError(null);
      if (clientLoading) return;
      if (clientError) {
        setError(clientError);
        setLoading(false);
        return;
      }
      if (!clientId) {
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
        const recordsQuery = query(
          collection(db, collectionName),
          where("clientId", "==", clientId),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(recordsQuery);
        if (!cancelled) {
          setRows(snapshot.docs.map((record) => ({ id: record.id, ...record.data() })));
          setLoading(false);
        }
      } catch (cause) {
        console.error(`Unable to load ${collectionName}`, cause);
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : `Could not load ${title.toLowerCase()}.`);
          setLoading(false);
        }
      }
    }

    void loadRows();
    return () => { cancelled = true; };
  }, [clientId, clientLoading, clientError, collectionName, title]);

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key !== "clientId"))))
    .filter((key) => key !== "id");

  return <section className="space-y-5">
    <header>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </header>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {clientLoading || loading ? <p className="p-6 text-sm text-slate-600" role="status">Loading {title.toLowerCase()}…</p>
        : error ? <p className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>
        : !clientId ? <p className="p-6 text-sm text-slate-600">No client workspace is linked to this account.</p>
        : rows.length === 0 ? <p className="p-6 text-sm text-slate-600">No data yet</p>
        : <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th scope="col" className="px-5 py-3 font-semibold">Record</th>
                {columns.map((column) => <th scope="col" key={column} className="px-5 py-3 font-semibold">{column.replace(/([A-Z])/g, " $1")}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => <tr key={row.id}>
                <td className="px-5 py-3 font-medium text-slate-900">{row.id}</td>
                {columns.map((column) => <td key={column} className="max-w-sm px-5 py-3 text-slate-600">{displayValue(row[column])}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>}
    </div>
  </section>;
}
