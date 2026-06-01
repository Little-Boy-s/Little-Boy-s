import { Github, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/site-data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative rounded-2xl bg-card/80 backdrop-blur border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-[0_10px_50px_-12px_rgba(34,211,238,0.35)]">
      <div
        className="h-40 relative overflow-hidden"
        style={{ background: project.accent }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:14px_14px] opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-700">
          {project.logo ? (
            <img
              src={project.logo}
              alt={`${project.title} logo`}
              className="absolute size-72 object-contain opacity-85 filter drop-shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-100"
            />
          ) : (
            <span className="font-black text-4xl text-white/95 tracking-tight transition-transform duration-500 group-hover:scale-110">
              {project.title.split(" ").map((w) => w[0]).join("")}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg tracking-tight">{project.title}</h3>
          <div className="flex gap-1.5 shrink-0">
            <a
              href={project.repoUrl}
              aria-label={`${project.title} repo`}
              className="p-1.5 rounded-md text-muted-foreground hover:text-cyan hover:bg-white/5 transition-colors"
            >
              <Github className="size-4" />
            </a>
            <a
              href={project.liveUrl}
              aria-label={`${project.title} live demo`}
              className="p-1.5 rounded-md text-muted-foreground hover:text-cyan hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-white/5 text-muted-foreground ring-1 ring-border"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
