"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => authClient.signIn.social({ provider: "google" })}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Continue with Google
      </button>
    </div>
  );
}