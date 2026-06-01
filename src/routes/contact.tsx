import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Github, Send } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Little Boy's" },
      { name: "description", content: "Get in touch with Little Boy's." },
      { property: "og:title", content: "Contact — Little Boy's" },
      { property: "og:description", content: "Get in touch with Little Boy's." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Sent — we will respond within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  }

  return (
    <section className="mx-auto max-w-5xl px-5 pt-20 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="contact"
          title="Let's build something."
          description="A new project, a quick question, or just to say hi — all welcome."
          center
        />
      </Reveal>
      <div className="mt-12 grid md:grid-cols-5 gap-6">
        <Reveal className="md:col-span-3">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-4"
          >
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // name
              </label>
              <input
                required
                className="mt-1.5 w-full rounded-md border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan/40"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // email
              </label>
              <input
                required
                type="email"
                className="mt-1.5 w-full rounded-md border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan/40"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // message
              </label>
              <textarea
                required
                rows={5}
                className="mt-1.5 w-full rounded-md border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan/40 resize-none"
                placeholder="Tell us about your idea..."
              />
            </div>
            <button
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-cyan/90 transition-colors disabled:opacity-60 glow-cyan"
            >
              <Send className="size-4" />
              {sending ? "Sending..." : "Send message"}
            </button>
          </form>
        </Reveal>

        <Reveal delay={120} className="md:col-span-2">
          <aside className="h-full rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // email
              </p>
              <a
                href="mailto:hello@littleboy.com"
                className="mt-1 inline-flex items-center gap-2 text-cyan font-medium hover:underline"
              >
                <Mail className="size-4" /> hello@littleboy.com
              </a>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // github
              </p>
              <a
                href="https://github.com/Little-Boy-s"
                className="mt-1 inline-flex items-center gap-2 text-cyan font-medium hover:underline"
              >
                <Github className="size-4" /> github.com/Little-Boy-s
              </a>
            </div>
            <div className="rounded-md border border-cyan/30 bg-cyan/5 p-4 text-sm">
              <p className="font-mono text-xs text-cyan uppercase tracking-wider">
                // response time
              </p>
              <p className="mt-1 text-foreground/90">
                We reply within <span className="font-semibold">24 hours</span>.
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
