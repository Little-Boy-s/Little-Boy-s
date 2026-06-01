import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, X, Eye, Trophy, Calendar } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { useAchievements } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Little Boy's" },
      { name: "description", content: "Team achievements, certificates, and milestones unlocked." },
      { property: "og:title", content: "Achievements — Little Boy's" },
      {
        property: "og:description",
        content: "Milestones and certificates unlocked by Little Boy's.",
      },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const { data: achievementsList = [] } = useAchievements();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-20 pb-24">
        {/* Back Link */}
        <Reveal>
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-cyan transition-colors"
            >
              <ArrowLeft className="size-3.5" /> ./back-to-home
            </Link>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={60}>
          <SectionHeading
            eyebrow="achievements & milestones"
            title="Our track record."
            description="A chronological log of engineering victories, hackathons, and operational standards."
            center
          />
        </Reveal>

        {/* Vertical Timeline / List */}
        <div className="mt-16 space-y-6">
          {achievementsList.length === 0 ? (
            <Reveal delay={120}>
              <div className="text-center p-12 border border-dashed border-border rounded-2xl font-mono text-sm text-muted-foreground bg-card/20">
                // No logged achievements found. Configure Supabase or import default mock data in
                admin.
              </div>
            </Reveal>
          ) : (
            achievementsList.map((item, idx) => (
              <Reveal key={item.id || idx} delay={idx * 80}>
                <div className="relative flex flex-col md:flex-row items-stretch gap-6 p-6 md:p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-xl hover:border-cyan/50 hover:bg-white/5 transition-all duration-300 group">
                  {/* Subtle index tag */}
                  <span className="absolute top-4 right-4 font-mono text-[10px] text-muted-foreground/30 select-none">
                    LOG_#{String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Left Column: Metric badge */}
                  <div className="flex flex-col items-start justify-center md:border-r md:border-border/40 md:pr-8 md:min-w-[160px] shrink-0 text-left">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-cyan/20 bg-cyan/5 rounded text-[10px] text-cyan font-mono uppercase tracking-wider mb-2">
                      <Trophy className="size-3" /> Metric
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-cyan">
                      {item.metric}
                    </h3>
                  </div>

                  {/* Middle Column: Details */}
                  <div className="flex-1 text-left flex flex-col justify-center">
                    <h4 className="text-lg md:text-xl font-bold font-mono tracking-tight text-foreground group-hover:text-cyan transition-colors">
                      {item.title}
                    </h4>
                    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Right Column: Optional certificate image upload preview */}
                  {item.image_url && (
                    <div className="shrink-0 flex items-center justify-center md:pl-4 mt-4 md:mt-0">
                      <div
                        onClick={() => setSelectedImage(item.image_url || null)}
                        className="relative rounded-xl overflow-hidden border border-border/60 bg-black/40 w-full md:w-44 h-28 cursor-pointer group/img"
                        title="Click to view full certificate"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <div className="p-2 bg-cyan/15 rounded-lg border border-cyan/40 text-cyan flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                            <Eye className="size-3.5" /> View_
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-xl z-50 cursor-pointer"
            title="Close certificate preview"
          >
            <X className="size-5" />
          </button>

          {/* Full size image stage */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Certificate Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-border shadow-2xl bg-black/40"
            />
          </div>
        </div>
      )}
    </>
  );
}
