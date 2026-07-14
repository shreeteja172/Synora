"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { emailOtp, signIn } from "@/lib/auth-client";
import { SIGNUP_PENDING_KEY } from "@/lib/auth-constants";
import { api } from "@/lib/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type VerifyMode = "signup" | "reset";

type PendingSignup = {
  name: string;
  email: string;
  password: string;
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = (searchParams.get("mode") as VerifyMode) ?? "signup";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const isReset = mode === "reset";

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Please start over.");
    }
  }, [email]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please start over.");
      return;
    }

    setResending(true);
    try {
      if (mode === "reset") {
        await api.post("/api/otp/request-password-reset", { email });
      } else {
        await api.post("/api/otp/request", { email });
      }
      toast.success("Verification code resent.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      toast.error(message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please start over.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    if (isReset) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "reset") {
        const { error: resetError } = await emailOtp.resetPassword({
          email,
          otp,
          password,
        });
        if (resetError) throw new Error(resetError.message || "Invalid code");

        const { error: signInError } = await signIn.email({
          email,
          password,
          callbackURL: `${APP_URL}/chats`,
        });
        if (signInError) throw new Error(signInError.message || "Failed to sign in");

        toast.success("Password reset successfully.");
        router.push("/chats");
        return;
      }

      const pendingRaw = sessionStorage.getItem(SIGNUP_PENDING_KEY);
      if (!pendingRaw) {
        throw new Error("Session expired. Please sign up again.");
      }

      const pending = JSON.parse(pendingRaw) as PendingSignup;
      if (pending.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error("Email mismatch. Please sign up again.");
      }

      await api.post("/api/otp/complete-signup", {
        email: pending.email,
        otp,
        name: pending.name,
        password: pending.password,
      });

      sessionStorage.removeItem(SIGNUP_PENDING_KEY);
      toast.success("Account created successfully.");
      router.push("/chats");
      router.refresh();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : err instanceof Error
          ? err.message
          : null;
      toast.error(message || "Verification failed");
      setLoading(false);
    }
  };

  const canSubmit = isReset
    ? otp.length === 6 && password.length >= 8 && confirmPassword.length >= 8
    : otp.length === 6;

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
            {isReset ? "Set a new password" : "Verify your email"}
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

            {isReset && (
              <>
                <div>
                  <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                    New password
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
                <div>
                  <label className="block text-[11px] text-dim uppercase tracking-wider font-medium mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Repeat your password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border text-white text-sm placeholder:text-dim/60 outline-none focus:border-emerald/40 transition-colors"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading
                ? isReset
                  ? "Resetting..."
                  : "Verifying..."
                : isReset
                  ? "Reset password"
                  : "Verify and continue"}
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
                href="/auth/forgot-password"
                className="text-emerald hover:text-emerald/80 transition-colors"
              >
                Go back
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
