import { Reveal } from "@/components/ui/reveal";
import { Terminal } from "@/components/ui/terminal";

const steps = [
  {
    n: "01",
    label: "connect",
    desc: "Authenticate over HTTP, then upgrade to a WebSocket carrying your session token.",
  },
  {
    n: "02",
    label: "send",
    desc: "Emit a MESSAGE with a chatId and content. The server validates membership and persists it.",
  },
  {
    n: "03",
    label: "receive",
    desc: "The server fans out a NEW_MESSAGE to every member of the chat over their open sockets.",
  },
];

const lines: { t: string; c: boolean }[] = [
  { t: "// client → server", c: true },
  { t: '{ type: "MESSAGE", payload: { chatId, content } }', c: false },
  { t: "", c: false },
  { t: "// server → members", c: true },
  { t: '{ type: "NEW_MESSAGE", payload: { id, chatId, senderId, createdAt } }', c: false },
  { t: "", c: false },
  { t: "// side channels", c: true },
  { t: '{ type: "TYPING" }  { type: "SEEN" }  { type: "PRESENCE" }', c: false },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
        <div>
          <Reveal>
            <p className="font-mono text-[12px] text-emerald mb-3">
              {"// the protocol"}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
              Three messages. That&apos;s the whole loop.
            </h2>
          </Reveal>
          <div className="space-y-5">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="flex gap-4">
                  <span className="font-mono text-[12px] text-dim pt-1">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-mono text-[13px] text-white mb-1">
                      {s.label}
                    </p>
                    <p className="text-[13.5px] text-muted leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={120}>
          <Terminal title="protocol.ts">
            {lines.map((l, i) => (
              <div
                key={i}
                className={`whitespace-pre ${l.c ? "text-dim" : "text-zinc-300"}`}
              >
                {l.t || "\u00A0"}
              </div>
            ))}
          </Terminal>
        </Reveal>
      </div>
    </section>
  );
}
