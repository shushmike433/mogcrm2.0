interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading…" }: LoadingScreenProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </main>
  );
}
