"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, firebaseConfigError } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

function friendlyAuthError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
  switch (code) {
    case "auth/email-already-in-use": return "This email is already registered. Please sign in.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/weak-password": return "Choose a password with at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "The email or password is incorrect.";
    case "auth/too-many-requests": return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed": return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed": return "Email/password sign-in is not enabled for this Firebase project.";
    default: return "We could not complete sign-in. Check Firebase setup and try again.";
  }
}

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (isSignUp && password.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!auth || firebaseConfigError) {
      setError(firebaseConfigError ?? "Firebase is not configured. Add settings from .env.example.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      else await signInWithEmailAndPassword(auth, normalizedEmail, password);
      router.replace("/dashboard");
    } catch (cause: unknown) {
      setError(friendlyAuthError(cause));
      setSubmitting(false);
    }
  }

  if (authLoading || user) return <LoadingScreen message="Checking your session…" />;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <header className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">MogCRM AI</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp ? "Set up your business workspace." : "Sign in to your business workspace."}
          </p>
        </header>
        {error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="you@business.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={isSignUp ? 6 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>
          {isSignUp && <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>}
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "New to MogCRM?"}{" "}
          <button type="button" onClick={() => { setIsSignUp((value) => !value); setError(null); }} className="font-semibold text-indigo-600 hover:text-indigo-700">
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
