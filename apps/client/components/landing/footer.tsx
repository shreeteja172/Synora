import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-sm text-white font-semibold tracking-tight"
        >
          synora<span className="text-emerald cursor-blink">_</span>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="font-mono text-[12px] text-dim hover:text-white transition-colors"
          >
            features
          </a>
          <a
            href="#how"
            className="font-mono text-[12px] text-dim hover:text-white transition-colors"
          >
            how
          </a>
          <Link
            href="/auth/signin"
            className="font-mono text-[12px] text-dim hover:text-white transition-colors"
          >
            sign in
          </Link>
        </div>
        <p className="font-mono text-[11px] text-dim/60">© 2026 synora</p>
      </div>
    </footer>
  );
}
