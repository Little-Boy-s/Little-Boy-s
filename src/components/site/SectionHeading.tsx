interface Props {
  index?: string; // e.g. "01"
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}

export function SectionHeading({ index, eyebrow, title, description, center }: Props) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">
        // {index ? `${index} — ` : ""}
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}
