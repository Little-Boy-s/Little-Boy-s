import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TeamGrid } from "@/components/site/TeamGrid";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Little Boy's" },
      { name: "description", content: "About the Little Boy's tech collective and the people behind it." },
      { property: "og:title", content: "About — Little Boy's" },
      { property: "og:description", content: "About Little Boy's." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-5 pt-20 pb-10 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan">
            // about us
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            We are <span className="gradient-text">Little Boy's</span> — a tech collective.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            A small-but-growing group of engineers obsessed with shipping
            software that actually works. Code review, observability, automated
            testing, CI/CD — the boring stuff that lets us move fast without
            breaking.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 grid md:grid-cols-3 gap-4">
        {[
          { t: "Mission", d: "Turn fuzzy ideas into reliable, useful software." },
          { t: "Values", d: "Honesty, curiosity, ownership. Users above features." },
          { t: "How we work", d: "Small PRs. Fast review. Tests at every layer. Boring deploys." },
        ].map((b, i) => (
          <Reveal key={b.t} delay={i * 90}>
            <div className="h-full rounded-2xl border border-border bg-card/60 backdrop-blur p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-cyan">// {b.t}</p>
              <p className="mt-3 text-foreground/90 leading-relaxed">{b.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <SectionHeading
            eyebrow="meet the builders"
            title="The whole crew."
            description="Filter by discipline · hover any avatar to see name & role."
            center
          />
        </Reveal>
        <Reveal delay={100}>
          <TeamGrid />
        </Reveal>
      </section>
    </>
  );
}
