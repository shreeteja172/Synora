import type { ReactNode } from "react";

interface TerminalProps {
  title?: string;
  children: ReactNode;
}

export function Terminal({ title = "bash", children }: TerminalProps) {
  return (
    <div className="bg-surface-2 border border-border rounded overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        {title && (
          <span className="ml-2 font-mono text-[11px] text-dim">{title}</span>
        )}
      </div>
      <div className="font-mono text-[12.5px] leading-[1.75] p-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
