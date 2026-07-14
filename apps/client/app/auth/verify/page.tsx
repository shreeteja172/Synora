"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { emailOtp, signIn } from "@/lib/auth-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SIGNUP_PASSWORD_KEY = "synora_signup_password";

type VerifyMode = "signup" | "signin";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = (searchParams.get("mode") as VerifyMode) ?? "signin";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const otpType = mode === "signup" ? "email-verification" : "sign-in";

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setResending(true);
    try {
      const { error: resendError } = await emailOtp.sendVerificationOtp({
        email,
        type: otpType,
      });
      if (resendError) throw new Error(resendError.message || "Failed to resend code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is missing. Please start over.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: verifyError } = await emailOtp.verifyEmail({ email, otp });
        if (verifyError) throw new Error(verifyError.message || "Invalid code");

        const password = sessionStorage.getItem(SIGNUP_PASSWORD_KEY);
        if (!password) {
          throw new Error("Session expired. Please sign up again.");
        }

        const { error: signInError } = await signIn.email({
          email,
          password,
          callbackURL: `${APP_URL}/chats`,
        });
        if (signInError) throw new Error(signInError.message || "Failed to sign in");

        sessionStorage.removeItem(SIGNUP_PASSWORD_KEY);
        router.push("/chats");
        return;
      }

      const { error: signInError } = await signIn.emailOtp({
        email,
        otp,
        callbackURL: `${APP_URL}/chats`,
      });
      if (signInError) throw new Error(signInError.message || "Invalid code");

      router.push("/chats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-dim mb-4">No email provided for verification.</p>
          <Link
            href="/auth/signin"
            className="text-emerald hover:text-emerald/80 transition-colors text-sm"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

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

          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Verify your email
          </h1>
          <p className="text-sm text-dim">
            We sent a 6-digit code to{" "}
            <span className="text-white">{email}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 glow-corner">
          <form onSubmit={handleVerify} className="space-y-3">
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
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2 text-[13px] text-dim hover:text-white transition-colors disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-dim mt-6">
          {mode === "signup" ? (
            <>
              Wrong email?{" "}
              <Link
                href="/auth/signup"
                className="text-emerald hover:text-emerald/80 transition-colors"
              >
                Go back to sign up
              </Link>
            </>
          ) : (
            <>
              Wrong email?{" "}
              <Link
                href="/auth/signin"
                className="text-emerald hover:text-emerald/80 transition-colors"
              >
                Go back to sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
          <p className="text-sm text-dim">Loading...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
