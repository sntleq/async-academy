"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { getFirebaseClient } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/auth-provider";

function getErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "An account already exists for this email.";
  if (code === "auth/invalid-credential") return "That email and password did not match.";
  if (code === "auth/weak-password") return "Choose a password with at least 6 characters.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a little and try again.";
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/js");
  }, [loading, router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const client = getFirebaseClient();
      if (!client) throw new Error("Firebase is not configured.");
      if (mode === "signup") {
        await createUserWithEmailAndPassword(client.auth, email, password);
      } else {
        await signInWithEmailAndPassword(client.auth, email, password);
      }
      router.replace("/js");
    } catch (nextError) {
      setError(
        (nextError as Error).message === "Firebase is not configured."
          ? "Firebase setup is not complete yet. Follow the setup steps below."
          : getErrorMessage(nextError)
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError("");
    setMessage("");
    if (!email) {
      setError("Enter your email above first, then choose forgot password.");
      return;
    }
    try {
      const client = getFirebaseClient();
      if (!client) throw new Error("Firebase is not configured.");
      await sendPasswordResetEmail(client.auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[1fr_0.9fr]">
        <section className="p-6 sm:p-10 lg:p-14">
          <Link href="/js" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to JavaScript
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Your learning account
          </p>
          <h1 className="mb-3 font-heading text-4xl tracking-tight sm:text-5xl">
            {mode === "signin" ? "Welcome back." : "Start learning."}
          </h1>
          <p className="mb-8 max-w-md leading-7 text-muted-foreground">
            Sign in to keep your completed lessons and see your JavaScript progress wherever you learn.
          </p>

          {!configured && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-6">
              <p className="mb-1 font-medium">One setup step left</p>
              Add the Firebase web app values to <code>apps/web/lib/firebase/client.ts</code>.
              See <code>apps/web/FIREBASE_SETUP.md</code> for the walkthrough.
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                {mode === "signin" && (
                  <button type="button" onClick={resetPassword} className="text-xs text-primary underline-offset-4 hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="At least 6 characters"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {message && <p role="status" className="text-sm text-primary">{message}</p>}
            <Button type="submit" size="lg" disabled={busy || !configured} className="w-full">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Async Academy?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setMessage("");
              }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </section>

        <aside className="flex flex-col justify-between bg-primary p-6 text-primary-foreground sm:p-10 lg:p-12">
          <BookOpenCheck aria-hidden="true" className="size-8" strokeWidth={1.5} />
          <div className="py-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground/70">A little at a time</p>
            <h2 className="mb-4 max-w-sm font-heading text-4xl leading-tight sm:text-5xl">Pick up right where you left off.</h2>
            <p className="max-w-sm leading-7 text-primary-foreground/80">
              Finished quizzes are saved to your account. Your overview will show what you have completed and what is next.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/70">Async Academy</p>
        </aside>
      </div>
    </div>
  );
}
