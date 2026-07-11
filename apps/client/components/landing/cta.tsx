import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CTA() {
  return (
    <section className="py-28 px-6 relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="max-w-2xl mx-auto text-center relative">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Open a socket.
          </h2>
          <p className="text-muted text-[15px] mb-8">
            Spin up a chat in minutes. Bring your own Postgres.
          </p>
          <Button href="/auth/signup">Start chatting</Button>
        </Reveal>
      </div>
    </section>
  );
}
