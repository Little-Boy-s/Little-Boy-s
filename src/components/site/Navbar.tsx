import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Github } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "home" },
  { to: "/about", label: "about" },
  { to: "/projects", label: "projects" },
  { to: "/team", label: "team" },
  { to: "/services", label: "services" },
  { to: "/skills", label: "stack" },
  { to: "/contact", label: "contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt="Little Boy's"
            className="h-9 w-auto rounded-md ring-1 ring-border transition-transform group-hover:-rotate-3"
          />
          <span className="font-bold tracking-tight text-foreground hidden sm:inline">
            Little Boy<span className="text-cyan">'s</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 text-sm font-mono text-muted-foreground rounded-md hover:text-foreground hover:bg-white/5 transition-colors"
              activeProps={{ className: "text-cyan bg-white/5" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Little-Boy-s"
            aria-label="GitHub"
            className="hidden md:inline-flex p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <Github className="size-4" />
          </a>
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center rounded-md bg-cyan/15 text-cyan px-3.5 py-1.5 text-sm font-mono font-semibold ring-1 ring-cyan/30 hover:bg-cyan/25 transition-colors"
          >
            ./hire-us
          </Link>
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-background/95 px-5 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm font-mono rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
              activeProps={{ className: "text-cyan bg-white/5" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
