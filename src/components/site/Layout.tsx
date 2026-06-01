import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" aria-hidden />
      {/* Ambient color blobs */}
      <div
        className="blob"
        style={{ top: -120, left: -120, width: 420, height: 420, background: "var(--cyan)" }}
        aria-hidden
      />
      <div
        className="blob"
        style={{ top: 260, right: -180, width: 520, height: 520, background: "var(--violet)" }}
        aria-hidden
      />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
