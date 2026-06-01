import { useEffect, useState } from "react";

type Props = {
  commands: string[];
  typingSpeed?: number;
  holdMs?: number;
  className?: string;
};

/**
 * Loops through `commands`, typing each char-by-char then erasing.
 * Renders inline: `> {typed}_`
 */
export function TerminalTyping({ commands, typingSpeed = 55, holdMs = 1600, className }: Props) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const full = commands[i] ?? "";
    if (!erasing && text === full) {
      const t = setTimeout(() => setErasing(true), holdMs);
      return () => clearTimeout(t);
    }
    if (erasing && text === "") {
      setErasing(false);
      setI((v) => (v + 1) % commands.length);
      return;
    }
    const t = setTimeout(
      () => {
        setText((prev) => (erasing ? prev.slice(0, -1) : full.slice(0, prev.length + 1)));
      },
      erasing ? Math.max(20, typingSpeed / 2) : typingSpeed,
    );
    return () => clearTimeout(t);
  }, [text, erasing, i, commands, typingSpeed, holdMs]);

  return (
    <span className={className}>
      <span className="text-neon">$</span> <span className="text-foreground">{text}</span>
      <span className="cursor-blink ml-0.5 text-neon" aria-hidden />
    </span>
  );
}
