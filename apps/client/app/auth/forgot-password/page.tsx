"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { emailOtp } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await emailOtp.requestPasswordReset({ email });
      if (resetError) throw new Error(resetError.message || "Failed to send reset code");

      toast.success("Reset code sent to your email.");
      router.push(
        `/auth/verify?email=${encodeURIComponent(email)}&mode=reset`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset code");
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

          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-dim">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 glow-corner">
          <form onSubmit={handleSubmit} className="space-y-3">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-dim mt-6">
          Remember your password?{" "}
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
