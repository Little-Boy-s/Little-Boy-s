import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { projects } from "@/lib/site-data";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Little Boy's" },
      { name: "description", content: "Featured projects built by Little Boy's." },
      { property: "og:title", content: "Projects — Little Boy's" },
      { property: "og:description", content: "Featured projects built by Little Boy's." },
    ],
  }),
  component: Projects,
});

function Projects() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-20 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="projects"
          title="Things we've shipped."
          description="AI assistants, data labeling systems, complex APIs and developer tooling."
          center
        />
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 60}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
