import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  projects as mockProjects,
  services as mockServices,
  Project,
  achievements as mockAchievements,
  Achievement,
} from "@/lib/site-data";
import { builders as mockBuilders, Builder } from "@/lib/team-data";

// Helper to map Supabase database projects (snake_case) to client Project types (camelCase)
function mapDbProject(dbProj: any): Project {
  return {
    title: dbProj.title,
    description: dbProj.description || "",
    stack: dbProj.stack || [],
    repoUrl: dbProj.repo_url || "",
    liveUrl: dbProj.live_url || "",
    accent: dbProj.accent || "linear-gradient(135deg, #06b6d4, #3b82f6)",
    logo: dbProj.logo_url || undefined,
  };
}

// Helper to map Supabase database builders (snake_case) to client Builder types (camelCase)
function mapDbBuilder(dbBuilder: any): Builder {
  return {
    name: dbBuilder.name,
    role: dbBuilder.role || "",
    category: dbBuilder.category || "Fullstack",
    github: dbBuilder.github || "",
    hue: typeof dbBuilder.hue === "number" ? dbBuilder.hue : 0,
    tagline: dbBuilder.tagline || "",
    location: dbBuilder.location || "",
    yearsExp: typeof dbBuilder.years_exp === "number" ? dbBuilder.years_exp : 0,
    bio: dbBuilder.bio || "",
    skills: dbBuilder.skills || [],
    funFact: dbBuilder.fun_fact || "",
    email: dbBuilder.email || undefined,
    website: dbBuilder.website || undefined,
    avatarUrl: dbBuilder.avatar_url || undefined,
  };
}

// 1. Projects Hook
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Falling back to mock projects data.");
        return mockProjects;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching projects, falling back to mock projects:", error.message);
          return mockProjects;
        }

        if (!data || data.length === 0) {
          console.info("Projects database table is empty. Showing mock projects.");
          return mockProjects;
        }

        return data.map(mapDbProject);
      } catch (err) {
        console.warn(
          "Failed to reach Supabase database for projects. Falling back to mock data.",
          err,
        );
        return mockProjects;
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
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Falling back to mock builders data.");
        return mockBuilders;
      }

      try {
        const { data, error } = await supabase
          .from("builders")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching builders, falling back to mock builders:", error.message);
          return mockBuilders;
        }

        if (!data || data.length === 0) {
          console.info("Builders database table is empty. Showing mock builders.");
          return mockBuilders;
        }

        return data.map(mapDbBuilder);
      } catch (err) {
        console.warn(
          "Failed to reach Supabase database for builders. Falling back to mock data.",
          err,
        );
        return mockBuilders;
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
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Falling back to mock services data.");
        return mockServices;
      }

      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Error fetching services, falling back to mock services:", error.message);
          return mockServices;
        }

        if (!data || data.length === 0) {
          console.info("Services database table is empty. Showing mock services.");
          return mockServices;
        }

        return data as Service[];
      } catch (err) {
        console.warn(
          "Failed to reach Supabase database for services. Falling back to mock data.",
          err,
        );
        return mockServices;
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
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Falling back to mock categories.");
        return mockCategories;
      }

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.warn(
            "Error fetching categories, falling back to mock categories:",
            error.message,
          );
          return mockCategories;
        }

        if (!data || data.length === 0) {
          console.info("Categories database table is empty. Showing mock categories.");
          return mockCategories;
        }

        return data as Category[];
      } catch (err) {
        console.warn(
          "Failed to reach Supabase database for categories. Falling back to mock data.",
          err,
        );
        return mockCategories;
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
      if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Falling back to mock achievements.");
        return mockAchievements;
      }

      try {
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn(
            "Error fetching achievements, falling back to mock achievements:",
            error.message,
          );
          return mockAchievements;
        }

        return data.map((d: any) => ({
          id: d.id,
          metric: d.metric || "",
          title: d.title,
          description: d.description || "",
          image_url: d.image_url || "",
        }));
      } catch (err) {
        console.warn(
          "Failed to reach Supabase database for achievements. Falling back to mock data.",
          err,
        );
        return mockAchievements;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
