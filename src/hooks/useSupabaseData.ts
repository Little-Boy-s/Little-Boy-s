import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { projects as mockProjects, services as mockServices, Project, achievements as mockAchievements, Achievement } from "@/lib/site-data";
import { builders as mockBuilders, Builder } from "@/lib/team-data";

// Helper to check if mock/localStorage mode is active
function isMockActive(): boolean {
  if (!isSupabaseConfigured) return true;
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_use_mock") === "true";
  }
  return false;
}

// Helper to read JSON from localStorage
function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local storage for key", key, e);
    }
  }
  return defaultValue;
}

// Helper to map Supabase database projects (snake_case) to client Project types (camelCase)
function mapDbProject(dbProj: any): Project {
  return {
    id: dbProj.id,
    title: dbProj.title,
    description: dbProj.description || "",
    stack: dbProj.stack || [],
    repoUrl: dbProj.repo_url || dbProj.repoUrl || "",
    liveUrl: dbProj.live_url || dbProj.liveUrl || "",
    accent: dbProj.accent || "linear-gradient(135deg, #06b6d4, #3b82f6)",
    logo: dbProj.logo_url || dbProj.logo || undefined,
  };
}

// Helper to map Supabase database builders (snake_case) to client Builder types (camelCase)
function mapDbBuilder(dbBuilder: any): Builder {
  return {
    id: dbBuilder.id,
    name: dbBuilder.name,
    role: dbBuilder.role || "",
    category: dbBuilder.category || "Fullstack",
    github: dbBuilder.github || "",
    hue: typeof dbBuilder.hue === "number" ? dbBuilder.hue : 0,
    tagline: dbBuilder.tagline || "",
    location: dbBuilder.location || "",
    yearsExp: typeof dbBuilder.years_exp === "number" ? dbBuilder.years_exp : (typeof dbBuilder.yearsExp === "number" ? dbBuilder.yearsExp : 0),
    bio: dbBuilder.bio || "",
    skills: dbBuilder.skills || [],
    funFact: dbBuilder.fun_fact || dbBuilder.funFact || "",
    email: dbBuilder.email || undefined,
    website: dbBuilder.website || undefined,
    avatarUrl: dbBuilder.avatar_url || dbBuilder.avatarUrl || undefined,
    aka: dbBuilder.aka || "",
  };
}

// 1. Projects Hook
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (isMockActive()) {
        const local = getLocalData<any[] | null>("portfolio_mock_projects", null);
        return local ? local.map(mapDbProject) : mockProjects;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching projects, falling back to local/mock:", error.message);
          const local = getLocalData<any[] | null>("portfolio_mock_projects", null);
          return local ? local.map(mapDbProject) : mockProjects;
        }

        if (!data || data.length === 0) {
          return mockProjects;
        }

        return data.map(mapDbProject);
      } catch (err) {
        console.warn("Failed to reach Supabase. Falling back to local/mock projects.", err);
        const local = getLocalData<any[] | null>("portfolio_mock_projects", null);
        return local ? local.map(mapDbProject) : mockProjects;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// 2. Builders (Team members) Hook
export function useBuilders() {
  return useQuery<Builder[]>({
    queryKey: ["builders"],
    queryFn: async () => {
      if (isMockActive()) {
        const local = getLocalData<any[] | null>("portfolio_mock_builders", null);
        return local ? local.map(mapDbBuilder) : mockBuilders;
      }

      try {
        const { data, error } = await supabase
          .from("builders")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching builders, falling back to local/mock:", error.message);
          const local = getLocalData<any[] | null>("portfolio_mock_builders", null);
          return local ? local.map(mapDbBuilder) : mockBuilders;
        }

        if (!data || data.length === 0) {
          return mockBuilders;
        }

        return data.map(mapDbBuilder);
      } catch (err) {
        console.warn("Failed to reach Supabase. Falling back to local/mock builders.", err);
        const local = getLocalData<any[] | null>("portfolio_mock_builders", null);
        return local ? local.map(mapDbBuilder) : mockBuilders;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 3. Services Hook
export interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (isMockActive()) {
        const local = getLocalData<Service[] | null>("portfolio_mock_services", null);
        return local ? local : mockServices;
      }

      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching services, falling back to local/mock:", error.message);
          const local = getLocalData<Service[] | null>("portfolio_mock_services", null);
          return local ? local : mockServices;
        }

        if (!data || data.length === 0) {
          return mockServices;
        }

        return data as Service[];
      } catch (err) {
        console.warn("Failed to reach Supabase. Falling back to local/mock services.", err);
        const local = getLocalData<Service[] | null>("portfolio_mock_services", null);
        return local ? local : mockServices;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 4. Categories Hook & Types
export interface Category {
  id?: string;
  name: string;
  created_at?: string;
}

const mockCategories: Category[] = [
  { name: "Frontend" },
  { name: "Backend" },
  { name: "Fullstack" },
  { name: "AI" },
  { name: "DevOps" },
  { name: "Mobile" },
  { name: "Design" },
];

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (isMockActive()) {
        const local = getLocalData<Category[] | null>("portfolio_mock_categories", null);
        return local ? local : mockCategories;
      }

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.warn("Error fetching categories, falling back to local/mock:", error.message);
          const local = getLocalData<Category[] | null>("portfolio_mock_categories", null);
          return local ? local : mockCategories;
        }

        if (!data || data.length === 0) {
          return mockCategories;
        }

        return data as Category[];
      } catch (err) {
        console.warn("Failed to reach Supabase. Falling back to local/mock categories.", err);
        const local = getLocalData<Category[] | null>("portfolio_mock_categories", null);
        return local ? local : mockCategories;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 5. Achievements Hook
export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      if (isMockActive()) {
        const local = getLocalData<any[] | null>("portfolio_mock_achievements", null);
        if (local) {
          return local.map((d: any) => ({
            id: d.id,
            metric: d.metric || "",
            title: d.title,
            description: d.description || "",
            image_url: d.image_url || d.imageUrl || "",
          }));
        }
        return mockAchievements;
      }

      try {
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching achievements, falling back to local/mock:", error.message);
          const local = getLocalData<any[] | null>("portfolio_mock_achievements", null);
          return local ? local.map((d: any) => ({
            id: d.id,
            metric: d.metric || "",
            title: d.title,
            description: d.description || "",
            image_url: d.image_url || d.imageUrl || "",
          })) : mockAchievements;
        }

        return data.map((d: any) => ({
          id: d.id,
          metric: d.metric || "",
          title: d.title,
          description: d.description || "",
          image_url: d.image_url || "",
        }));
      } catch (err) {
        console.warn("Failed to reach Supabase. Falling back to local/mock achievements.", err);
        const local = getLocalData<any[] | null>("portfolio_mock_achievements", null);
        return local ? local.map((d: any) => ({
          id: d.id,
          metric: d.metric || "",
          title: d.title,
          description: d.description || "",
          image_url: d.image_url || d.imageUrl || "",
        })) : mockAchievements;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
