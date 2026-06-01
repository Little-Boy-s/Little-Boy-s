import historyMindLogo from "@/assets/historymind-logo.png";

export type Project = {
  title: string;
  description: string;
  stack: string[];
  repoUrl: string;
  liveUrl: string;
  accent: string;
  logo?: string;
};

export const projects: Project[] = [
  {
    title: "HistoryMind AI",
    description:
      "An interactive AI-powered platform for historical exploration and learning, featuring semantic search, timeline generation, and cognitive AI history mentors.",
    stack: ["React", "Next.js", "Tailwind CSS", "FastAPI", "LangChain", "Vector DB"],
    repoUrl: "https://github.com/HistoryMindAI",
    liveUrl: "https://fe-history-mind-ai.vercel.app/",
    accent: "linear-gradient(135deg, #f59e0b, #ef4444)",
    logo: historyMindLogo,
  },
];

export const expertise = [
  {
    title: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind", "TanStack"],
  },
  {
    title: "Backend",
    items: ["Spring Boot", "FastAPI", ".NET", "Node.js", "PostgreSQL"],
  },
  {
    title: "AI & Data",
    items: ["RAG", "LangChain", "pgvector", "Python", "MLflow"],
  },
  {
    title: "DevOps & QA",
    items: ["Docker", "Kubernetes", "GitHub Actions", "Playwright", "Terraform"],
  },
];

export const techStack = [
  "React", "TypeScript", "Next.js", "TanStack", "Tailwind CSS",
  "Spring Boot", "FastAPI", ".NET", "Node.js", "Python",
  "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes",
  "GitHub Actions", "Terraform", "RAG", "LangChain", "Playwright",
];

export const services = [
  {
    title: "Web Development",
    description: "SaaS, internal tools, high-speed landing pages, SEO-optimized.",
    icon: "Globe",
  },
  {
    title: "Backend & APIs",
    description: "Microservices, REST/GraphQL, message queues, observability.",
    icon: "Server",
  },
  {
    title: "AI Integration",
    description: "RAG, agents, LLM orchestration integrated into production systems.",
    icon: "Bot",
  },
  {
    title: "Automated Testing",
    description: "E2E, visual regression, contract tests, performance budgets.",
    icon: "TestTube",
  },
  {
    title: "CI/CD & DevOps",
    description: "Standard pipelines, infra-as-code, multi-env setups, zero-downtime deployment.",
    icon: "Workflow",
  },
  {
    title: "UI/UX Design",
    description: "Design systems, prototyping, polished micro-interactions.",
    icon: "Palette",
  },
];
