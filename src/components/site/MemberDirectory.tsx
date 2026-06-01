import { useMemo, useState } from "react";
import { Github, Mail, MapPin, Briefcase, Sparkles, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TEAM_FILTERS, type Builder } from "@/lib/team-data";
import { useBuilders } from "@/hooks/useSupabaseData";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

function avatarBg(hue: number) {
  return `linear-gradient(135deg, hsl(${hue} 80% 55%), hsl(${(hue + 60) % 360} 85% 50%))`;
}

function MemberCard({ b, onOpen }: { b: Builder; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left rounded-2xl border border-border bg-card/60 backdrop-blur p-5 transition-all hover:-translate-y-1 hover:border-neon/50 hover:shadow-[0_12px_40px_-12px_rgba(57,255,128,0.35)] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {b.avatarUrl ? (
          <img
            src={b.avatarUrl}
            alt={b.name}
            className="size-12 rounded-xl object-cover shrink-0 ring-1 ring-border"
          />
        ) : (
          <span
            className="size-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ring-1 ring-border"
            style={{ background: avatarBg(b.hue) }}
          >
            {initials(b.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate group-hover:text-neon transition-colors">
            {b.name}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan mt-0.5">
            {b.role}
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
          {b.category}
        </span>
      </div>

      <p className="mt-3 text-sm text-foreground/80 line-clamp-2">
        {b.tagline}
      </p>

      <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" /> {b.location.split(",")[0]}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="size-3" /> {b.yearsExp}y
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {b.skills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 ring-1 ring-border text-foreground/80"
          >
            {s}
          </span>
        ))}
        {b.skills.length > 3 && (
          <span className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            +{b.skills.length - 3}
          </span>
        )}
      </div>

      <p className="mt-4 font-mono text-[10px] text-muted-foreground/70 group-hover:text-neon transition-colors">
        ./view-profile →
      </p>
    </button>
  );
}

export function MemberDialog({ b }: { b: Builder }) {
  return (
    <DialogContent className="max-w-2xl bg-[oklch(0.17_0.012_260)] border-border text-foreground p-0 gap-0 block overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Header band */}
      <div
        className="relative h-32"
        style={{ background: avatarBg(b.hue), opacity: 0.9 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[oklch(0.17_0.012_260)]" />
      </div>

      <div className="px-6 pb-6 -mt-12 relative">
        <div className="flex items-end gap-4">
          {b.avatarUrl ? (
            <img
              src={b.avatarUrl}
              alt={b.name}
              className="size-24 rounded-2xl object-cover ring-4 ring-[oklch(0.17_0.012_260)] shadow-xl shrink-0"
            />
          ) : (
            <span
              className="size-24 rounded-2xl flex items-center justify-center text-2xl font-bold text-white ring-4 ring-[oklch(0.17_0.012_260)] shadow-xl shrink-0"
              style={{ background: avatarBg(b.hue) }}
            >
              {initials(b.name)}
            </span>
          )}
          <div className="pb-1 min-w-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold tracking-tight">
                {b.name}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-wider text-cyan mt-1">
                {b.role} · {b.category}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Meta strip */}
        <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="rounded-lg bg-white/5 ring-1 ring-border px-3 py-2">
            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
              location
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1">
              <MapPin className="size-3 text-neon" /> {b.location}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 ring-1 ring-border px-3 py-2">
            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
              experience
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1">
              <Briefcase className="size-3 text-neon" /> {b.yearsExp} years
            </p>
          </div>
          <div className="rounded-lg bg-white/5 ring-1 ring-border px-3 py-2">
            <p className="text-muted-foreground uppercase tracking-wider text-[9px]">
              status
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-neon">
              <span className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
              shipping
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-5 italic text-foreground/90">"{b.tagline}"</p>

        {/* Bio */}
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan">
            // bio
          </p>
          <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
            {b.bio}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan">
            // skills
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {b.skills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-white/5 ring-1 ring-border text-foreground/90"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-5 rounded-xl border border-border bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-orange inline-flex items-center gap-1">
            <Sparkles className="size-3" /> fun fact
          </p>
          <p className="mt-2 text-sm text-foreground/85">{b.funFact}</p>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={b.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white/5 ring-1 ring-border px-3.5 py-2 text-xs font-mono hover:bg-white/10 transition-colors"
          >
            <Github className="size-3.5" /> github
          </a>
          {b.email && (
            <a
              href={`mailto:${b.email}`}
              className="inline-flex items-center gap-2 rounded-md bg-white/5 ring-1 ring-border px-3.5 py-2 text-xs font-mono hover:bg-white/10 transition-colors"
            >
              <Mail className="size-3.5" /> {b.email}
            </a>
          )}
          {b.website && (
            <a
              href={b.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white/5 ring-1 ring-border px-3.5 py-2 text-xs font-mono hover:bg-white/10 transition-colors"
            >
              <Globe className="size-3.5" /> website
            </a>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export function MemberDirectory() {
  const { data: builders = [] } = useBuilders();
  const [filter, setFilter] = useState<(typeof TEAM_FILTERS)[number]>("All");
  const [active, setActive] = useState<Builder | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? builders : builders.filter((b) => b.category === filter)),
    [filter, builders],
  );

  return (
    <>
      {/* Filters */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {TEAM_FILTERS.map((f) => {
          const active = filter === f;
          const count =
            f === "All" ? builders.length : builders.filter((b) => b.category === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ring-1 ${
                active
                  ? "bg-neon/15 text-neon ring-neon/40"
                  : "bg-white/5 text-muted-foreground ring-border hover:text-foreground hover:bg-white/10"
              }`}
            >
              {f} <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <MemberCard key={b.name} b={b} onOpen={() => setActive(b)} />
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        // {filtered.length} builders · click any card for full profile
      </p>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && <MemberDialog b={active} />}
      </Dialog>
    </>
  );
}
