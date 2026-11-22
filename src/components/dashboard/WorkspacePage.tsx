const descriptions: Record<string, string> = {
  Calls: "Track call activity and manage AI receptionist workflows for your business.",
  Appointments: "Keep upcoming bookings and customer visits organized in one place.",
  Reviews: "Monitor customer feedback and review activity for your business.",
  Settings: "Manage the configuration and preferences for your MogCRM workspace.",
};

export default function WorkspacePage({ section }: { section: keyof typeof descriptions }) {
  return <section className="space-y-5">
    <header><h2 className="text-2xl font-bold tracking-tight text-slate-900">{section}</h2><p className="mt-1 text-sm text-slate-600">{descriptions[section]}</p></header>
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-medium text-slate-800">This workspace is ready to configure</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Connect the relevant business data and service integrations to display live {section.toLowerCase()} here.</p>
    </div>
  </section>;
}
