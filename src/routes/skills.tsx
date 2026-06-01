import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { TechMarquee } from "@/components/site/TechMarquee";
import { expertise } from "@/lib/site-data";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Stack — Little Boy's" },
      { name: "description", content: "The technology stack used by Little Boy's on a daily basis." },
      { property: "og:title", content: "Stack — Little Boy's" },
      { property: "og:description", content: "Tech stack of Little Boy's." },
    ],
  }),
  component: Skills,
});

function Skills() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-10">
        <Reveal>
          <SectionHeading
            eyebrow="stack"
            title="What we work with."
            description="A pragmatic selection — proven, fast, observable."
            center
          />
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {expertise.map((g, i) => (
            <Reveal key={g.title} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-cyan">// {g.title}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-md bg-white/5 text-sm font-mono text-foreground/90 ring-1 ring-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal className="my-10">
        <TechMarquee />
      </Reveal>
    </>
  );
}
