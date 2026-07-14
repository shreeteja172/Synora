"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border border-border bg-surface text-white shadow-lg",
            title: "text-sm font-medium",
            description: "text-sm text-dim",
            error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
            success: "border-emerald/20 bg-emerald/10 text-emerald-100",
          },
        }}
      />
    </QueryClientProvider>
  );
}