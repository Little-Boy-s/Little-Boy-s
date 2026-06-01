import { Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="mx-auto max-w-6xl px-5 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Little Boy's"
              className="h-9 w-auto rounded-md ring-1 ring-border"
            />
            <span className="font-bold">
              Little Boy<span className="text-cyan">'s</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Engineering intelligent, scalable, robust tech.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            // navigate
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-cyan">
                About
              </Link>
            </li>
            <li>
              <Link to="/projects" className="hover:text-cyan">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-cyan">
                Services
              </Link>
            </li>
            <li>
              <Link to="/skills" className="hover:text-cyan">
                Stack
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            // reach out
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="mailto:hello@littleboy.com"
                className="inline-flex items-center gap-2 hover:text-cyan"
              >
                <Mail className="size-4" /> hello@littleboy.com
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Little-Boy-s"
                className="inline-flex items-center gap-2 hover:text-cyan"
              >
                <Github className="size-4" /> github.com/Little-Boy-s
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
          <p>© {new Date().getFullYear()} Little Boy's — built with curiosity.</p>
          <p>v1.0.0 · all systems operational</p>
        </div>
      </div>
    </footer>
  );
}
