import { Reveal } from "@/components/ui/reveal";

const lines = [
  'Most "real-time" stacks bolt polling onto a REST API and call it a day.',
  "Latency compounds. State drifts. Presence is a guess.",
  "Synora keeps a socket open and pushes the truth as it changes.",
];

export function Problem() {
  return (
    <section className="border-y border-border/50 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-3">
        {lines.map((line, i) => (
          <Reveal key={i} delay={i * 80}>
            <p className="text-[15px] text-muted leading-relaxed flex gap-3">
              <span className="text-emerald font-mono text-[13px] pt-0.5">
                →
              </span>
              {line}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
