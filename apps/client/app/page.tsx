import Link from "next/link";

const features = [
  {
    title: "Instant Messaging",
    desc: "Messages delivered instantly with persistent WebSocket connections.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Online Presence",
    desc: "Know who's available in real time with live status indicators.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Typing Indicators",
    desc: "See conversations happening live as they unfold.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Media Sharing",
    desc: "Share files, images and documents seamlessly in conversations.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Group Chats",
    desc: "Create communities and collaborate with teams in shared spaces.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Message Reactions",
    desc: "Express naturally with reactions on every message.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Notifications",
    desc: "Never miss important updates with real-time push alerts.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Secure Authentication",
    desc: "Safe and reliable access with modern auth protocols.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Voice Messages",
    desc: "Communicate naturally with rich voice message support.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    span: "col-span-1",
  },
  {
    title: "Developer Friendly",
    desc: "Simple architecture built for scalability with type-safe SDKs and WebSocket integrations.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    span: "col-span-1 md:col-span-2",
  },
];

const faqs = [
  {
    q: "How does Synora deliver messages instantly?",
    a: "Synora uses persistent WebSocket connections to maintain an always-on link between clients and the server. When a message is sent, it's immediately pushed to all connected recipients without polling or delays.",
  },
  {
    q: "Does it support group chats?",
    a: "Yes. Synora supports both one-on-one and group conversations. You can create rooms, add members, and collaborate with teams in shared spaces.",
  },
  {
    q: "Can I share images and files?",
    a: "Absolutely. Synora supports media sharing including images, videos, documents, and voice messages with rich previews directly in the conversation.",
  },
  {
    q: "How are online users tracked?",
    a: "Presence is tracked through WebSocket connection state. When a user connects or disconnects, their status is broadcast to all relevant participants in real time.",
  },
  {
    q: "Is typing status updated in real time?",
    a: "Yes. Typing indicators are sent over the same WebSocket connection. When a user starts typing, a TYPING event is broadcast, and it automatically clears after a short timeout.",
  },
];

const logos = ["GitHub", "Vercel", "Supabase", "Prisma", "OpenAI", "Neon", "AWS"];

const stats = [
  { value: "100K+", label: "Messages Sent" },
  { value: "50K+", label: "Active Conversations" },
  { value: "99.9%", label: "Reliability" },
  { value: "24/7", label: "Availability" },
];

function HeroMockup() {
  return (
    <div className="perspective-float">
      <div className="bg-surface-2 border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/50 w-full max-w-lg">
        <div className="flex">
          <div className="w-36 border-r border-border p-3 space-y-3">
            <p className="text-[10px] text-dim font-medium uppercase tracking-wider">Direct Messages</p>
            {["Alex Chen", "Sarah Kim", "Dev Team", "Design"].map((name, i) => (
              <div key={name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full ${i === 0 ? "bg-emerald/20" : i === 1 ? "bg-violet-500/20" : i === 2 ? "bg-blue-500/20" : "bg-amber-500/20"} flex items-center justify-center`}>
                    <span className="text-[9px] text-white">{name[0]}</span>
                  </div>
                  {i < 2 && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald border border-surface-2" />}
                </div>
                <span className="text-[11px] text-zinc-400 truncate">{name}</span>
                {i === 3 && <span className="ml-auto w-4 h-4 rounded-full bg-emerald/20 text-emerald text-[8px] flex items-center justify-center">3</span>}
              </div>
            ))}
            <p className="text-[10px] text-dim font-medium uppercase tracking-wider pt-2">Channels</p>
            {["# general", "# engineering"].map((ch) => (
              <div key={ch} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-[11px] text-dim">{ch}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
              <span className="text-xs font-medium text-white">Dev Team</span>
              <span className="text-[10px] text-dim">4 members</span>
              <span className="ml-auto text-[10px] text-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                3 online
              </span>
            </div>

            <div className="flex-1 p-3 space-y-2.5 min-h-[200px]">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[7px] text-emerald">A</span>
                </div>
                <div>
                  <p className="text-[9px] text-dim">Alex Chen <span className="text-dim/60">10:42 AM</span></p>
                  <p className="text-[11px] text-zinc-300">deployed the new WebSocket handler</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[7px] text-violet-300">S</span>
                </div>
                <div>
                  <p className="text-[9px] text-dim">Sarah Kim <span className="text-dim/60">10:43 AM</span></p>
                  <p className="text-[11px] text-zinc-300">nice, latency looks great on the dashboard</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-emerald/10 border border-emerald/20 rounded-xl rounded-br-sm px-3 py-1.5 max-w-[70%]">
                  <p className="text-[11px] text-zinc-200">yeah, under 50ms across all regions</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-dim cursor-pointer hover:bg-white/10">👍 2</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-dim cursor-pointer hover:bg-white/10">🔥 1</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[7px] text-emerald">A</span>
                </div>
                <div>
                  <p className="text-[9px] text-dim">Alex Chen <span className="text-dim/60">10:44 AM</span></p>
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="h-1 bg-white/10 rounded-full w-20">
                        <div className="h-1 bg-emerald/60 rounded-full w-14" />
                      </div>
                    </div>
                    <span className="text-[9px] text-dim">0:12</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[7px] text-violet-300">S</span>
                </div>
                <div>
                  <p className="text-[9px] text-dim">Sarah Kim <span className="text-dim/60">10:44 AM</span></p>
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <svg className="w-3.5 h-3.5 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <span className="text-[10px] text-zinc-400">dashboard-preview.png</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 pt-1">
                <span className="text-[9px] text-dim mr-1">Sarah is typing</span>
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-1" />
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-2" />
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-3" />
              </div>
            </div>

            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2 border border-border">
                <span className="text-[10px] text-dim flex-1">Message #dev-team</span>
                <svg className="w-3 h-3 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseMockup() {
  return (
    <div className="perspective-float">
      <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/60 max-w-4xl w-full">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 rounded-md bg-white/5 text-[10px] text-dim">
              app.synora.dev
            </div>
          </div>
        </div>
        <div className="flex min-h-[320px]">
          <div className="w-44 border-r border-border p-3 space-y-1">
            <p className="text-[9px] text-dim uppercase tracking-wider font-medium mb-2">Navigation</p>
            {["Friends", "Communities", "Notifications", "Settings"].map((item, i) => (
              <div key={item} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] cursor-pointer ${i === 0 ? "bg-white/5 text-white" : "text-dim hover:bg-white/[0.03]"}`}>
                {item}
                {i === 2 && <span className="ml-auto w-3.5 h-3.5 rounded-full bg-emerald/20 text-emerald text-[8px] flex items-center justify-center">5</span>}
              </div>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <p className="text-[9px] text-dim uppercase tracking-wider font-medium mb-2">Recent</p>
              {["Engineering", "Design", "Product"].map((ch) => (
                <div key={ch} className="px-2.5 py-1.5 text-[11px] text-dim hover:bg-white/[0.03] rounded-lg cursor-pointer">
                  # {ch.toLowerCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white"># engineering</span>
              <span className="text-[9px] text-dim">12 members</span>
            </div>
            {[
              { name: "Marcus", time: "2:14 PM", msg: "shipped the presence refactor", color: "bg-blue-500/20 text-blue-300" },
              { name: "Elena", time: "2:15 PM", msg: "saw it, typing indicators are smoother now", color: "bg-rose-500/20 text-rose-300" },
              { name: "You", time: "2:16 PM", msg: "latency dropped to 38ms on average", color: "bg-emerald/20 text-emerald" },
            ].map((m) => (
              <div key={m.time} className="flex gap-2">
                <div className={`w-5 h-5 rounded-full ${m.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-[7px]">{m.name[0]}</span>
                </div>
                <div>
                  <p className="text-[9px]"><span className="text-zinc-300">{m.name}</span> <span className="text-dim">{m.time}</span></p>
                  <p className="text-[11px] text-zinc-400">{m.msg}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 px-2 pt-1">
              <span className="text-[9px] text-dim mr-1">Marcus is typing</span>
              <span className="w-1 h-1 rounded-full bg-dim typing-dot-1" />
              <span className="w-1 h-1 rounded-full bg-dim typing-dot-2" />
              <span className="w-1 h-1 rounded-full bg-dim typing-dot-3" />
            </div>
          </div>
          <div className="w-40 border-l border-border p-3 space-y-3">
            <p className="text-[9px] text-dim uppercase tracking-wider font-medium">Online - 4</p>
            {["Marcus W.", "Elena R.", "Jin Park", "Aisha M."].map((u, i) => (
              <div key={u} className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-5 h-5 rounded-full ${["bg-blue-500/20", "bg-rose-500/20", "bg-amber-500/20", "bg-violet-500/20"][i]} flex items-center justify-center`}>
                    <span className="text-[7px] text-white">{u[0]}</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald border border-surface-2" />
                </div>
                <span className="text-[10px] text-zinc-400">{u}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <p className="text-[9px] text-dim uppercase tracking-wider font-medium mb-2">Shared Media</p>
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="aspect-square rounded-md bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock() {
  return (
    <div className="code-block p-5 text-zinc-300">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-3 text-[11px] text-dim">client.ts</span>
      </div>
      <div className="space-y-0.5">
        <div className="flex">
          <span className="line-number">1</span>
          <span><span className="keyword">const</span> <span className="variable">socket</span> = <span className="keyword">new</span> <span className="function">WebSocket</span>(<span className="string">&quot;ws://api.synora.dev&quot;</span>)</span>
        </div>
        <div className="flex">
          <span className="line-number">2</span>
          <span></span>
        </div>
        <div className="flex">
          <span className="line-number">3</span>
          <span><span className="variable">socket</span>.<span className="function">send</span>(<span className="function">JSON</span>.<span className="function">stringify</span>({"{"}</span>
        </div>
        <div className="flex">
          <span className="line-number">4</span>
          <span>  <span className="property">type</span>: <span className="string">&quot;MESSAGE&quot;</span>,</span>
        </div>
        <div className="flex">
          <span className="line-number">5</span>
          <span>  <span className="property">payload</span>: {"{"}</span>
        </div>
        <div className="flex">
          <span className="line-number">6</span>
          <span>    <span className="property">chatId</span>: <span className="string">&quot;conv_9x2k&quot;</span>,</span>
        </div>
        <div className="flex">
          <span className="line-number">7</span>
          <span>    <span className="property">content</span>: <span className="string">&quot;Hello, are you online?&quot;</span></span>
        </div>
        <div className="flex">
          <span className="line-number">8</span>
          <span>  {"}"}</span>
        </div>
        <div className="flex">
          <span className="line-number">9</span>
          <span>{"}"}))</span>
        </div>
        <div className="flex">
          <span className="line-number">10</span>
          <span></span>
        </div>
        <div className="flex">
          <span className="line-number">11</span>
          <span><span className="variable">socket</span>.<span className="property">onmessage</span> = (<span className="variable">event</span>) =&gt; {"{"}</span>
        </div>
        <div className="flex">
          <span className="line-number">12</span>
          <span>  <span className="keyword">const</span> <span className="variable">data</span> = <span className="function">JSON</span>.<span className="function">parse</span>(<span className="variable">event</span>.<span className="property">data</span>)</span>
        </div>
        <div className="flex">
          <span className="line-number">13</span>
          <span>  <span className="variable">console</span>.<span className="function">log</span>(<span className="variable">data</span>.<span className="property">payload</span>)</span>
        </div>
        <div className="flex">
          <span className="line-number">14</span>
          <span>{"}"}</span>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-border rounded-2xl overflow-hidden card-hover">
      <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
        <span className="text-sm text-white font-medium">{q}</span>
        <svg
          className="w-4 h-4 text-dim transition-transform duration-300 group-open:rotate-45"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </summary>
      <div className="px-6 pb-5">
        <p className="text-sm text-dim leading-relaxed">{a}</p>
      </div>
    </details>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">Synora</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-dim hover:text-white transition-colors">Features</a>
            <a href="#showcase" className="text-[13px] text-dim hover:text-white transition-colors">Showcase</a>
            <a href="#developers" className="text-[13px] text-dim hover:text-white transition-colors">Developers</a>
            <a href="#pricing" className="text-[13px] text-dim hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-dim hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="text-[13px] px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 grid-bg overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald/[0.04] rounded-full blur-[120px] animate-pulse-subtle pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 max-w-xl">
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/20 bg-emerald/[0.06] mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                  <span className="text-[11px] font-medium text-emerald">WebSocket Powered</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.1] mb-6 animate-fade-up-d1">
                <span className="text-emerald-glow">Real-time</span> conversations, built for modern{" "}
                <span className="text-emerald-glow">communication</span>.
              </h1>

              <p className="text-base text-dim leading-relaxed mb-10 max-w-md animate-fade-up-d2">
                Synora delivers instant messaging, online presence, typing indicators, media sharing, and seamless communication with the speed and reliability of WebSockets.
              </p>

              <div className="flex items-center gap-4 animate-fade-up-d3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-2xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Start Chatting
                </Link>
                <a
                  href="#developers"
                  className="px-5 py-2.5 rounded-2xl border border-border text-white text-sm font-medium hover:border-white/20 hover:bg-white/[0.03] transition-all"
                >
                  View Docs
                </a>
              </div>
            </div>

            <div className="flex-1 animate-fade-up-d4 animate-float">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-border/50 overflow-hidden">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center justify-center min-w-[140px] px-8">
              <span className="text-sm text-dim/40 font-medium tracking-wider">{logo}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Everything you need for modern conversations.
            </h2>
            <p className="text-dim text-base max-w-md mx-auto">
              Built from the ground up with real-time performance and developer experience in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className={`${f.span} p-6 rounded-3xl border border-border bg-surface card-hover glow-corner group`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald/[0.08] border border-emerald/10 flex items-center justify-center text-emerald mb-4 group-hover:bg-emerald/[0.15] transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-dim leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="showcase" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Built for how teams actually work.
            </h2>
            <p className="text-dim text-base">
              A complete communication platform, designed from the inside out.
            </p>
          </div>
          <div className="flex justify-center">
            <ShowcaseMockup />
          </div>
        </div>
      </section>

      <section id="developers" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <CodeBlock />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
                Built on WebSockets.
              </h2>
              <p className="text-dim text-base leading-relaxed mb-8">
                Deliver conversations instantly with persistent connections and low latency. No polling, no delays.
              </p>
              <div className="space-y-3">
                {[
                  "Real-time delivery",
                  "Presence system",
                  "Typing indicators",
                  "Group messaging",
                  "Fast and scalable architecture",
                  "Persistent connections",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className="space-y-2">
                <p className="text-4xl font-semibold text-white tracking-tight">{s.value}</p>
                <p className="text-sm text-dim">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              What developers are saying.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Marcus Wei",
                role: "Engineering Lead, Raycast",
                quote: "Synora's WebSocket architecture gave us the real-time layer we needed. Integration took a day, not a month.",
              },
              {
                name: "Elena Rodriguez",
                role: "CTO, Acme Inc",
                quote: "The developer experience is exceptional. Type-safe APIs and clean abstractions made our chat feature ship in record time.",
              },
              {
                name: "Jin Park",
                role: "Senior Engineer, Vercel",
                quote: "Finally a messaging platform built by developers, for developers. The presence and typing indicators just work.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl border border-border bg-surface card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald/20 to-violet-500/20 flex items-center justify-center">
                    <span className="text-xs text-white">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-[11px] text-dim">{t.role}</p>
                  </div>
                </div>
                <p className="text-[13px] text-dim leading-relaxed">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-dim text-base">Start free. Scale when you need to.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Starter",
                price: "Free",
                desc: "For personal projects and exploration.",
                features: ["1,000 messages/day", "5 conversations", "Basic presence", "Community support"],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/month",
                desc: "For teams building real products.",
                features: ["Unlimited messages", "Unlimited conversations", "Advanced presence", "Priority support", "Media sharing", "Group chats"],
                cta: "Get Started",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For organizations that need more.",
                features: ["Everything in Pro", "SLA guarantee", "Dedicated support", "Custom integrations", "Self-hosted option"],
                cta: "Contact Us",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border card-hover ${
                  plan.highlight
                    ? "border-emerald/30 bg-emerald/[0.04]"
                    : "border-border bg-surface"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-dim">{plan.period}</span>}
                  </div>
                  <p className="text-[13px] text-dim mt-2">{plan.desc}</p>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[13px] text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-emerald text-black hover:bg-emerald/90"
                      : "bg-white/5 text-white border border-border hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
              Frequently asked questions.
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Start conversations without delays.
          </h2>
          <p className="text-dim text-base mb-10">
            Build real-time experiences in minutes, not months.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-2xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all active:scale-[0.98]"
            >
              Start Free
            </Link>
            <a
              href="#developers"
              className="px-6 py-3 rounded-2xl border border-border text-white text-sm font-medium hover:border-white/20 hover:bg-white/[0.03] transition-all"
            >
              Read Docs
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">Synora</span>
              </div>
              <p className="text-[13px] text-dim leading-relaxed">
                Real-time conversations built for modern communication.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Docs", "Changelog"] },
              { title: "Resources", links: ["Blog", "API Reference", "Status", "Community"] },
              { title: "Company", links: ["About", "Careers", "Contact", "Legal"] },
              { title: "Socials", links: ["GitHub", "X", "Discord", "LinkedIn"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] text-dim uppercase tracking-wider font-medium mb-4">{col.title}</p>
                <div className="space-y-2.5">
                  {col.links.map((link) => (
                    <a key={link} href="#" className="block text-[13px] text-dim hover:text-white transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border/50 flex items-center justify-between">
            <p className="text-[12px] text-dim/60">2026 Synora. All rights reserved.</p>
            <p className="text-[12px] text-dim/60">Built with WebSockets and precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
