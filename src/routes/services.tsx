import { createFileRoute } from "@tanstack/react-router";
import { Globe, Server, Bot, TestTube, Workflow, Palette } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { useServices } from "@/hooks/useSupabaseData";

const ICONS = { Globe, Server, Bot, TestTube, Workflow, Palette } as const;

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Little Boy's" },
      { name: "description", content: "Web, backend, AI, testing and DevOps services from Little Boy's." },
      { property: "og:title", content: "Services — Little Boy's" },
      { property: "og:description", content: "Web, backend, AI, testing, DevOps." },
    ],
  }),
  component: Services,
});

function Services() {
  const { data: services = [] } = useServices();
  return (
    <section className="mx-auto max-w-6xl px-5 pt-20 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="services"
          title="What we can help with."
          description="From the first idea to production — we run the whole pipeline."
          center
        />
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => {
          const Icon = ICONS[s.icon as keyof typeof ICONS] ?? Globe;
          return (
            <Reveal key={s.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-card/60 backdrop-blur p-6 transition-all hover:-translate-y-1 hover:border-cyan/40">
                <div className="size-11 rounded-xl bg-cyan/10 ring-1 ring-cyan/30 flex items-center justify-center text-cyan">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-bold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
