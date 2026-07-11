import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    glyph: "→",
    label: "ws.delivery",
    desc: "Persistent socket per user. Messages push on send, not on poll.",
  },
  {
    glyph: "●",
    label: "presence",
    desc: "Connect and disconnect broadcast live to everyone who matters.",
  },
  {
    glyph: "…",
    label: "typing",
    desc: "Keystroke indicators over the same channel. Zero extra requests.",
  },
  {
    glyph: "{}",
    label: "type-safe",
    desc: "Shared message types across client and server. One source of truth.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="font-mono text-[12px] text-emerald mb-3">
            {"// what's in the box"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
            Four primitives. That&apos;s the whole layer.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <Reveal key={f.label} delay={i * 70}>
              <div className="bg-surface border border-border rounded p-6 h-full transition-colors hover:border-emerald/30">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-mono text-sm text-emerald">{f.glyph}</span>
                  <span className="font-mono text-[13px] text-white">
                    {f.label}
                  </span>
                </div>
                <p className="text-[13.5px] text-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
