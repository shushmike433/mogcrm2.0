export default function OverviewPage() {
  const metrics = [
    { label: "New leads", value: "—", note: "Connect your data to see activity" },
    { label: "Calls handled", value: "—", note: "Call activity will appear here" },
    { label: "Appointments", value: "—", note: "Upcoming appointments" },
  ];

  return <div className="space-y-8">
    <section>
      <p className="text-sm font-medium text-indigo-600">Your workspace</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Welcome to MogCRM AI</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A single place to manage the customer conversations and opportunities that keep your business moving.</p>
    </section>
    <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-600">{metric.label}</h3>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
        <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
      </article>)}
    </section>
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
      <h3 className="font-semibold text-slate-900">Get started</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Configure Firebase and connect your business records to start seeing live leads and workspace activity.</p>
    </section>
  </div>;
}
