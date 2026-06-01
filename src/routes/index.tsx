import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github, Play, Terminal } from "lucide-react";
import logo from "@/assets/logo.png";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProjectCard } from "@/components/site/ProjectCard";
import { TechMarquee } from "@/components/site/TechMarquee";
import { TeamGrid } from "@/components/site/TeamGrid";
import { Reveal } from "@/components/site/Reveal";
import { TerminalTyping } from "@/components/site/TerminalTyping";
import { projects, expertise } from "@/lib/site-data";
import { builders } from "@/lib/team-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Little Boy's — Engineering intelligent, scalable tech" },
      {
        name: "description",
        content:
          "Little Boy's is a tech collective shipping AI assistants, robust APIs and pixel-perfect frontends.",
      },
      { property: "og:title", content: "Little Boy's — Tech Collective" },
      {
        property: "og:description",
        content: "Engineering intelligent, scalable, robust tech.",
      },
    ],
  }),
  component: Home,
});

const COMMANDS = [
  "npx create-little-boys-app",
  "./deploy_innovation.sh --prod",
  "kubectl apply -f team.yaml",
  "pytest -q && pnpm run e2e",
];

function Home() {
  return (
    <>
      {/* ===== Hero — terminal + logo as artifact ===== */}
      <section className="relative mx-auto max-w-5xl px-5 pt-16 md:pt-24 pb-24 text-center">
        {/* Faint code-rain backdrop */}
        <div className="code-rain absolute inset-0 pointer-events-none" aria-hidden />

        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
            <span className="text-muted-foreground">main</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-neon">build: passing</span>
          </div>
        </Reveal>

        {/* Logo stage — wireframe / neon artifact */}
        <Reveal delay={80}>
          <div className="relative mx-auto mt-10 flex items-center justify-center" style={{ width: 280, height: 280 }}>
            <div
              className="absolute inset-0 rounded-full border border-neon/25"
              style={{ animation: "spin 22s linear infinite" }}
            />
            <div
              className="absolute inset-6 rounded-full border border-dashed border-cyan/30"
              style={{ animation: "spin 30s linear infinite reverse" }}
            />
            <div className="absolute inset-12 rounded-full border border-border" />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, var(--neon) 0%, transparent 60%)",
                opacity: 0.35,
                filter: "blur(56px)",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, var(--cyan) 0%, transparent 65%)",
                opacity: 0.35,
                filter: "blur(64px)",
                transform: "translate(28px, 28px)",
              }}
              aria-hidden
            />

            <div className="relative size-44 rounded-3xl border border-border bg-card/70 backdrop-blur-xl flex items-center justify-center glow-cyan">
              <img src={logo} alt="Little Boy's logo" className="w-32 h-auto float logo-neon" />
            </div>

            <span className="absolute -top-2 left-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">v1.0.0</span>
            <span className="absolute -top-2 right-0 font-mono text-[10px] uppercase tracking-wider text-neon">● online</span>
            <span className="absolute -bottom-2 left-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">~/team</span>
            <span className="absolute -bottom-2 right-0 font-mono text-[10px] uppercase tracking-wider text-neon">
              {builders.length} builder{builders.length > 1 ? "s" : ""}
            </span>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <h1 className="mt-12 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Little Boy<span className="gradient-text">'s</span>
          </h1>
        </Reveal>

        {/* Terminal typing block */}
        <Reveal delay={180}>
          <div className="mx-auto mt-7 max-w-2xl rounded-xl border border-border bg-[oklch(0.14_0.012_260)] shadow-2xl overflow-hidden text-left">
            <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border bg-card/60">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Terminal className="size-3" /> ~/little-boys — zsh
              </span>
            </div>
            <div className="px-4 py-4 font-mono text-sm md:text-base">
              <TerminalTyping commands={COMMANDS} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-md bg-neon px-6 py-3 text-sm font-mono font-semibold text-[#06250f] hover:brightness-110 transition-all shadow-[0_0_24px_-4px_var(--neon)]"
            >
              <Play className="size-4 fill-current" /> [Execute_]
            </Link>
            <a
              href="https://github.com/Little-Boy-s/Little-Boy-s"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-white/5 px-6 py-3 text-sm font-mono font-semibold hover:bg-white/10 transition-colors"
            >
              <Github className="size-4" /> ./view-source
            </a>
          </div>
        </Reveal>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </section>

      {/* ===== Engineering Philosophy — .md / code block ===== */}
      <section id="about" className="mx-auto max-w-5xl px-5 py-20">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="cat ./philosophy.md"
            title="Our engineering philosophy."
            description="Boring deploys. Loud alerts. Honest code review. Tests at every layer."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 rounded-2xl border border-border bg-[oklch(0.14_0.012_260)] overflow-hidden shadow-2xl">
            {/* file tab */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/60">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-1 rounded-md bg-background border border-border text-foreground">
                  philosophy.md
                </span>
                <span className="text-muted-foreground">utf-8 · md</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">main · {builders.length} ⭐</span>
            </div>

            {/* code body with line numbers */}
            <div className="grid grid-cols-[auto_1fr] font-mono text-[13px] md:text-sm leading-7">
              <pre className="select-none text-right pr-4 pl-4 py-5 text-muted-foreground/60 border-r border-border bg-card/30">
{Array.from({ length: 14 }, (_, i) => i + 1).join("\n")}
              </pre>
              <pre className="py-5 px-5 overflow-x-auto">
<span className="tok-cmt"># Little Boy's — Engineering Philosophy</span>{"\n\n"}
<span className="tok-key">## try-hard culture</span>{"\n"}
- We ship <span className="tok-str">"the boring stuff"</span>: tests, traces, dashboards.{"\n"}
- Every PR gets <span className="tok-num">2+</span> reviewers. No rubber stamps.{"\n\n"}
<span className="tok-key">## automated everything</span>{"\n"}
- <span className="tok-fn">pytest</span>, <span className="tok-fn">vitest</span>, <span className="tok-fn">playwright</span>, visual-regression.{"\n"}
- <span className="tok-fn">CI</span> blocks merge on red. Friday deploys are normal.{"\n\n"}
<span className="tok-key">## high-performance by default</span>{"\n"}
- p95 budgets per endpoint. Profilers in prod.{"\n"}
- <span className="tok-var">SLO</span> = <span className="tok-num">99.9%</span> uptime · <span className="tok-num">{"<200ms"}</span> p95 reads.{"\n\n"}
<span className="tok-cmt">// "Move fast, but you have to clean up after yourself."</span>
              </pre>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Stack & Sandbox — package.json style ===== */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="cat ./package.json"
            title="Our stack & sandbox."
            description="Dependencies we pull every day — chosen for boring reliability, then pushed hard."
            center
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 rounded-2xl border border-border bg-[oklch(0.14_0.012_260)] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/60">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-1 rounded-md bg-background border border-border">package.json</span>
                <span className="text-muted-foreground">json</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">deps · {expertise.reduce((n, g) => n + g.items.length, 0)}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] font-mono text-[12.5px] md:text-sm leading-7">
              <pre className="select-none text-right pr-4 pl-4 py-5 text-muted-foreground/60 border-r border-border bg-card/30">
{Array.from(
  { length: 3 + expertise.reduce((n, g) => n + g.items.length + 2, 0) },
  (_, i) => i + 1,
).join("\n")}
              </pre>
              <pre className="py-5 px-5 overflow-x-auto">
{"{"}{"\n"}
{"  "}<span className="tok-key">"name"</span>: <span className="tok-str">"little-boys"</span>,{"\n"}
{"  "}<span className="tok-key">"version"</span>: <span className="tok-str">"1.0.0"</span>,{"\n"}
{expertise.map((g, gi) => (
  <span key={g.title}>
    {"  "}<span className="tok-key">{`"${g.title.toLowerCase().replace(/\s+/g, "-")}"`}</span>: {"{"}{"\n"}
    {g.items.map((t, ti) => (
      <span key={t}>
        {"    "}<span className="tok-key">{`"${t}"`}</span>: <span className="tok-str">"^latest"</span>
        {ti < g.items.length - 1 ? "," : ""}{"\n"}
      </span>
    ))}
    {"  }"}{gi < expertise.length - 1 ? "," : ""}{"\n"}
  </span>
))}
{"}"}
              </pre>
            </div>
          </div>
        </Reveal>

        {/* Floating dependency badges */}
        <Reveal delay={200}>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {expertise.flatMap((g) => g.items).slice(0, 14).map((t, i) => (
              <span
                key={t}
                className="px-3 py-1.5 text-xs font-mono rounded-md bg-white/5 ring-1 ring-border hover:ring-neon/60 hover:text-neon transition-all"
                style={{ animation: `float 6s ease-in-out ${i * 0.25}s infinite` }}
              >
                <span className="text-muted-foreground">{">"}</span> {t}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== Marquee ===== */}
      <Reveal className="my-10">
        <TechMarquee />
      </Reveal>

      {/* ===== Projects ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="featured projects"
              title="Some things we've shipped."
              description="From AI assistants to data labeling systems and battle-tested APIs."
            />
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/projects"
              className="font-mono text-sm text-cyan inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              view_all <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 6).map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Team — dense avatar grid with filter ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="meet the builders"
            title="The crew behind the code."
            description="A team of engineers, designers and AI folks shipping together. Hover any avatar to peek."
            center
          />
        </Reveal>
        <Reveal delay={100}>
          <TeamGrid />
        </Reveal>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="relative rounded-3xl border border-border bg-card/60 backdrop-blur p-10 md:p-14 overflow-hidden">
            <div
              className="absolute -top-20 -right-20 size-72 rounded-full"
              style={{
                background: "radial-gradient(circle, var(--cyan), transparent 65%)",
                opacity: 0.35,
                filter: "blur(60px)",
              }}
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">
              // let's build
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl">
              Got an idea worth shipping? <span className="gradient-text">Let's talk.</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              We respond within 24 hours. No sales pitch — just engineers.
            </p>
            <div className="mt-7">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-cyan/90 transition-colors glow-cyan"
              >
                Start a conversation <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
