import { useMemo, useState } from "react";
import { Github } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Builder } from "@/lib/team-data";
import { useBuilders, useCategories } from "@/hooks/useSupabaseData";
import { Dialog } from "@/components/ui/dialog";
import { MemberDialog } from "@/components/site/MemberDirectory";

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

function Avatar({ b, onOpen }: { b: Builder; onOpen: () => void }) {
  return (
    <Tooltip delayDuration={80}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${b.name} — ${b.role}`}
          className="group relative block cursor-pointer"
        >
          {b.avatarUrl ? (
            <img
              src={b.avatarUrl}
              alt={b.name}
              className="block size-12 sm:size-14 rounded-full object-cover ring-2 ring-border transition-all duration-200 group-hover:ring-cyan group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_-8px_rgba(34,211,238,0.55)] shrink-0"
            />
          ) : (
            <span
              className="block size-12 sm:size-14 rounded-full ring-2 ring-border transition-all duration-200 group-hover:ring-cyan group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_-8px_rgba(34,211,238,0.55)] flex items-center justify-center text-[11px] sm:text-xs font-bold text-white shrink-0"
              style={{ background: avatarBg(b.hue) }}
            >
              {initials(b.name)}
            </span>
          )}
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-background opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-card text-foreground border border-border shadow-xl rounded-lg px-3 py-2"
      >
        <div className="flex items-center gap-2.5 min-w-[180px]">
          {b.avatarUrl ? (
            <img
              src={b.avatarUrl}
              alt={b.name}
              className="size-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <span
              className="size-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: avatarBg(b.hue) }}
            >
              {initials(b.name)}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{b.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-cyan">
              {b.role}
            </p>
          </div>
          <Github className="size-3.5 text-muted-foreground" />
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function TeamGrid() {
  const { data: builders = [] } = useBuilders();
  const { data: categories = [] } = useCategories();
  const [filter, setFilter] = useState<string>("All");
  const [active, setActive] = useState<Builder | null>(null);

  const filters = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories]);

  const filtered = useMemo(
    () => (filter === "All" ? builders : builders.filter((b) => b.category === filter)),
    [filter, builders],
  );

  return (
    <TooltipProvider>
      {/* Filter tabs */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ring-1 ${
                active
                  ? "bg-cyan/15 text-cyan ring-cyan/40"
                  : "bg-white/5 text-muted-foreground ring-border hover:text-foreground hover:bg-white/10"
              }`}
            >
              {f}
              <span className="ml-1.5 text-[10px] opacity-70">
                {f === "All" ? builders.length : builders.filter((b) => b.category === f).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Avatar grid */}
      <div className="mt-10 rounded-3xl border border-border bg-card/40 backdrop-blur p-6 md:p-10">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 sm:gap-4 justify-items-center">
          {filtered.map((b) => (
            <Avatar key={b.name} b={b} onOpen={() => setActive(b)} />
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          // {filtered.length} builders shipping together
        </p>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && <MemberDialog b={active} />}
      </Dialog>
    </TooltipProvider>
  );
}
