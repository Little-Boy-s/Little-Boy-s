// Team members. Edit freely.
export type TeamCategory = "Frontend" | "Backend" | "AI" | "DevOps" | "Design" | "Mobile" | "Fullstack";

export type Builder = {
  name: string;
  role: string;
  category: TeamCategory;
  github: string;
  hue: number; // 0-360, hue for avatar gradient
  // Rich profile (shown in dialog)
  tagline: string;
  location: string;
  yearsExp: number;
  bio: string;
  skills: string[];
  funFact: string;
  email?: string;
  website?: string;
};

type Row = [string, string, TeamCategory, string, string, number, string, string[], string];

// [name, role, category, tagline, location, years, bio, skills, funFact]
const ROWS: Row[] = [
  ["Võ Đức Hiếu", "Full-stack Web Developer", "Fullstack", "Full-stack Web Developer", "Ho Chi Minh City, Vietnam", 4,
    "Full-stack Web Developer specializing in high-performance system architectures, AI/RAG integration, and CI/CD pipeline optimization.",
    ["React", "Node.js", "AI/RAG", "CI/CD", "Kubernetes", "Docker", "System Design"], "Automates any task repeated more than 3 times using Bash or Python."],
];

export const builders: Builder[] = ROWS.map(
  ([name, role, category, tagline, location, yearsExp, bio, skills, funFact], i) => ({
    name,
    role,
    category,
    tagline,
    location,
    yearsExp,
    bio,
    skills,
    funFact,
    github: name === "Võ Đức Hiếu" ? "https://github.com/h1eudayne" : "https://github.com/Little-Boy-s",
    email: name === "Võ Đức Hiếu" ? "voduchieu42@gmail.com" : "hieuvd@littleboy.com",
    website: name === "Võ Đức Hiếu" ? "https://h1eudayne.dev/" : undefined,
    hue: (i * 47) % 360,
  }),
);

export const TEAM_FILTERS: Array<"All" | TeamCategory> = [
  "All",
  "Frontend",
  "Backend",
  "Fullstack",
  "AI",
  "DevOps",
  "Mobile",
  "Design",
];
