import { Button } from "@/components/ui/button";
import { Terminal } from "@/components/ui/terminal";

const lines: { t: string; c: boolean }[] = [
  { t: "// 1. connect", c: true },
  { t: 'const ws = new WebSocket(url + "?token=" + session)', c: false },
  { t: "", c: false },
  { t: "// 2. send", c: true },
  { t: "ws.send(JSON.stringify({", c: false },
  { t: '  type: "MESSAGE",', c: false },
  { t: "  payload: { chatId, content },", c: false },
  { t: "}))", c: false },
  { t: "", c: false },
  { t: "// 3. receive", c: true },
  { t: "ws.onmessage = ({ data }) => {", c: false },
  { t: "  const msg = JSON.parse(data)", c: false },
  { t: '  // msg.type === "NEW_MESSAGE"', c: true },
  { t: "}", c: false },
];

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 px-6 grid-bg overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="font-mono text-[12px] text-emerald mb-6 animate-fade-up">
            {"// websocket-first messaging"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] mb-5 animate-fade-up-d1">
            Real-time chat,
            <br />
            wired <span className="text-emerald-glow">by hand</span>.
          </h1>
          <p className="text-[15px] text-muted leading-relaxed mb-8 max-w-md animate-fade-up-d2">
            Synora runs on persistent WebSocket connections. Presence, typing,
            and delivery — pushed the moment they happen. No polling, no SDK
            bloat.
          </p>
          <div className="flex items-center gap-3 animate-fade-up-d3">
            <Button href="/auth/signup">Start chatting</Button>
            <Button variant="ghost" href="#how">
              See how it works
            </Button>
          </div>
        </div>
        <div className="animate-fade-up-d4">
          <Terminal title="client.ts">
            {lines.map((l, i) => (
              <div
                key={i}
                className={`whitespace-pre ${l.c ? "text-dim" : "text-zinc-300"}`}
              >
                {l.t || "\u00A0"}
              </div>
            ))}
          </Terminal>
        </div>
      </div>
    </section>
  );
}
