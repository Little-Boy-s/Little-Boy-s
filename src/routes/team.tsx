import { createFileRoute } from "@tanstack/react-router";
import { Users, Github } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MemberDirectory } from "@/components/site/MemberDirectory";
import { Reveal } from "@/components/site/Reveal";
import { useBuilders, useCategories } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Little Boy's" },
      {
        name: "description",
        content:
          "Meet the builders behind Little Boy's — engineers, designers, and AI folks shipping together.",
      },
      { property: "og:title", content: "Team — Little Boy's" },
      {
        property: "og:description",
        content: "The crew behind the code.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data: builders = [] } = useBuilders();
  const { data: categories = [] } = useCategories();

  const counts = categories.map((cat) => ({
    label: cat.name,
    count: builders.filter((b) => b.category === cat.name).length,
  }));

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-20 pb-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
            <Users className="size-3 text-neon" />
            <span className="text-muted-foreground">team · roster</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
            Meet the <span className="gradient-text">builders</span>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            {builders.length} engineers, designers and AI folks shipping
            together. Filter by discipline · hover any avatar for name, role
            and GitHub.
          </p>
        </Reveal>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl bg-white/5 ring-1 ring-border p-4 text-center">
              <p className="text-2xl font-extrabold text-neon">{builders.length}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                total
              </p>
            </div>
            {counts.map((c) => (
              <div
                key={c.label}
                className="rounded-xl bg-white/5 ring-1 ring-border p-4 text-center"
              >
                <p className="text-2xl font-extrabold">{c.count}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Avatar grid */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <SectionHeading
            eyebrow="ls ./team"
            title="The whole crew."
            description="Hover any avatar to see name, role & GitHub link."
            center
          />
        </Reveal>
        <Reveal delay={100}>
          <MemberDirectory />
        </Reveal>
      </section>

      {/* Join CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <Reveal>
          <div className="relative rounded-3xl border border-border bg-card/60 backdrop-blur p-8 md:p-12 overflow-hidden">
            <div
              className="absolute -top-20 -right-20 size-72 rounded-full"
              style={{
                background: "radial-gradient(circle, var(--neon), transparent 65%)",
                opacity: 0.3,
                filter: "blur(60px)",
              }}
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-neon">
              // we're hiring
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
              Want to ship with us?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Open roles in frontend, backend, AI pipelines and DevOps. Send
              your GitHub — we read every PR history.
            </p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-neon px-5 py-2.5 text-sm font-mono font-semibold text-[#06250f] hover:brightness-110 transition-all shadow-[0_0_20px_-4px_var(--neon)]"
            >
              <Github className="size-4" /> ./apply
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
