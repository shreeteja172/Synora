import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-white font-semibold tracking-tight"
        >
          synora<span className="text-emerald cursor-blink">_</span>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="font-mono text-[13px] text-dim hover:text-white transition-colors"
          >
            features
          </a>
          <a
            href="#how"
            className="font-mono text-[13px] text-dim hover:text-white transition-colors"
          >
            how
          </a>
          <Link
            href="/auth/signin"
            className="font-mono text-[13px] text-dim hover:text-white transition-colors"
          >
            sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
