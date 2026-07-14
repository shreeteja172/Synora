"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [hasResolvedSession, setHasResolvedSession] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setHasResolvedSession(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/chats");
    }
  }, [session, isPending, router]);

  // Only block first paint — do not remount children on tab-focus session refetch
  if (!hasResolvedSession && isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-dim text-sm">
          <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-dim text-sm">
          <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return children;
}
