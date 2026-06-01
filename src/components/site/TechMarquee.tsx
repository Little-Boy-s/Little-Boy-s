import { techStack } from "@/lib/site-data";

export function TechMarquee() {
  const items = [...techStack, ...techStack];
  return (
    <div
      className="relative overflow-hidden border-y border-border bg-background/40"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="marquee-track py-5">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="font-mono text-sm text-muted-foreground px-6 whitespace-nowrap flex items-center gap-3"
          >
            <span className="size-1.5 rounded-full bg-cyan" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
