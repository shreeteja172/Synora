"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Step = "form" | "otp";

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/chats",
      });
    } catch {
      setError("Failed to sign up with Google.");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signupError } = await signUp.email({
        name,
        email,
        password,
      });
      if (signupError)
        throw new Error(signupError.message || "Failed to create account");

      const res = await fetch(`${API}/api/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      await signIn.email({
        email,
        password,
        callbackURL: `${APP_URL}/chats`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Synora
            </span>
          </Link>

          {step === "form" ? (
            <>
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                Create your account
              </h1>
              <p className="text-sm text-dim">
                Start building real-time conversations today
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                Verify your email
              </h1>
              <p className="text-sm text-dim">
                We sent a 6-digit code to{" "}
                <span className="text-white">{email}</span>
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 glow-corner">
          {step === "form" ? (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-white/[0.03] text-white text-sm font-medium hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {loading ? "Redirecting..." : "Continue with Google"}
              </button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-dim uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border text-white text-sm placeholder:text-dim/60 outline-none focus:border-emerald/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border text-white text-sm placeholder:text-dim/60 outline-none focus:border-emerald/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border text-white text-sm placeholder:text-dim/60 outline-none focus:border-emerald/40 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-xl px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-3.5 py-3 rounded-xl bg-white/[0.03] border border-border text-white text-xl tracking-[0.5em] text-center placeholder:text-dim/40 outline-none focus:border-emerald/40 transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-[13px] text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-xl px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify and continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setError("");
                }}
                className="w-full py-2 text-[13px] text-dim hover:text-white transition-colors"
              >
                Go back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-dim mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-emerald hover:text-emerald/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
