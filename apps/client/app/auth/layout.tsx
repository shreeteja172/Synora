"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const AUTH_PAGES_ALLOWED_WITH_SESSION: string[] = [];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const allowWithSession = AUTH_PAGES_ALLOWED_WITH_SESSION.some((path) =>
    pathname.startsWith(path),
  );

  useEffect(() => {
    if (!isPending && session && !allowWithSession) {
      router.replace("/chats");
    }
  }, [session, isPending, router, allowWithSession]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-dim text-sm">
          <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (session && !allowWithSession) {
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
