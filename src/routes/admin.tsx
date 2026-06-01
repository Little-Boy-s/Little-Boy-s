import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowLeft, Plus, Trash2, Save, RefreshCw, Upload, Database, 
  Code, HelpCircle, Check, Loader2, FileSpreadsheet, Eye, Image, Lock, Unlock
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useProjects, useBuilders, useServices, useCategories, useAchievements } from "@/hooks/useSupabaseData";
import { projects as mockProjects, achievements as mockAchievements } from "@/lib/site-data";
import { builders as mockBuilders } from "@/lib/team-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Little Boy's" },
      { name: "description", content: "Spreadsheet database and storage editor." },
    ],
  }),
  component: AdminDashboard,
});

type Tab = "projects" | "builders" | "services" | "categories" | "sql-setup" | "achievements";

function AdminDashboard() {
  const queryClient = useQueryClient();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  // Private Password Protection Gate states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Fetch real data (falls back to mock automatically if not connected)
  const { data: projectsData } = useProjects();
  const { data: buildersData } = useBuilders();
  const { data: servicesData } = useServices();
  const { data: categoriesData } = useCategories();
  const { data: achievementsData } = useAchievements();

  // Local grid states (draft values of Excel table before saving)
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [localBuilders, setLocalBuilders] = useState<any[]>([]);
  const [localServices, setLocalServices] = useState<any[]>([]);
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [localAchievements, setLocalAchievements] = useState<any[]>([]);

  // Track deleted IDs to perform delete queries on Save
  const [deletedProjects, setDeletedProjects] = useState<string[]>([]);
  const [deletedBuilders, setDeletedBuilders] = useState<string[]>([]);
  const [deletedServices, setDeletedServices] = useState<string[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<string[]>([]);
  const [deletedAchievements, setDeletedAchievements] = useState<string[]>([]);

  // Cell editing state: { rowIndex, field }
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  
  // Loading status for save & seed mutations
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [uploadingCell, setUploadingCell] = useState<{ rowIndex: number; field: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check sessionStorage on component mount to see if already unlocked
  useEffect(() => {
    const unlocked = sessionStorage.getItem("admin_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  // Sync state when DB data finishes loading
  useEffect(() => {
    if (projectsData) {
      setLocalProjects(
        projectsData.map((p, idx) => ({
          id: (p as any).id || `temp-p-${idx}`,
          title: p.title,
          description: p.description,
          stack: p.stack,
          repo_url: p.repoUrl,
          live_url: p.liveUrl,
          accent: p.accent,
          logo_url: p.logo || "",
        }))
      );
    }
  }, [projectsData]);

  useEffect(() => {
    if (buildersData) {
      setLocalBuilders(
        buildersData.map((b, idx) => ({
          id: (b as any).id || `temp-b-${idx}`,
          name: b.name,
          role: b.role,
          category: b.category,
          github: b.github,
          hue: b.hue,
          tagline: b.tagline,
          location: b.location,
          years_exp: b.yearsExp,
          bio: b.bio,
          skills: b.skills,
          fun_fact: b.funFact,
          email: b.email || "",
          website: b.website || "",
        }))
      );
    }
  }, [buildersData]);

  useEffect(() => {
    if (servicesData) {
      setLocalServices(
        servicesData.map((s, idx) => ({
          id: s.id || `temp-s-${idx}`,
          title: s.title,
          description: s.description,
          icon: s.icon,
        }))
      );
    }
  }, [servicesData]);

  useEffect(() => {
    if (categoriesData) {
      setLocalCategories(
        categoriesData.map((c, idx) => ({
          id: c.id || `temp-c-${idx}`,
          name: c.name,
        }))
      );
    }
  }, [categoriesData]);

  useEffect(() => {
    if (achievementsData) {
      setLocalAchievements(
        achievementsData.map((a, idx) => ({
          id: a.id || `temp-a-${idx}`,
          metric: a.metric,
          title: a.title,
          description: a.description,
          image_url: a.image_url || "",
        }))
      );
    }
  }, [achievementsData]);

  const LUCIDE_ICONS = ["Globe", "Server", "Bot", "TestTube", "Workflow", "Palette", "Terminal", "Cpu", "Layers"];

  // ================= PASSWORD GATE SUBMIT =================

  const handleUnlockConsole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      // Mock mode fallback check
      if (passwordInput === "admin123") {
        sessionStorage.setItem("admin_unlocked", "true");
        sessionStorage.setItem("admin_key", "admin123");
        setIsUnlocked(true);
        setPasswordInput("");
        toast.success("Console unlocked (Mock Mode). Welcome back, Administrator.");
      } else {
        toast.error("Invalid password. Access Denied.");
      }
      return;
    }

    const unlockToast = toast.loading("Verifying key securely with Postgres...");
    try {
      const { data: isValid, error } = await supabase.rpc("verify_admin_key", {
        input_key: passwordInput,
      });

      if (error) {
        throw error;
      }

      if (isValid) {
        sessionStorage.setItem("admin_unlocked", "true");
        sessionStorage.setItem("admin_key", passwordInput);
        setIsUnlocked(true);
        setPasswordInput("");
        toast.success("Console unlocked. Welcome back, Administrator.", { id: unlockToast });
      } else {
        toast.error("Invalid password. Access Denied.", { id: unlockToast });
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      toast.error(`Authentication failed: ${err.message || "Failed to communicate with database"}. Make sure your SQL setup is up-to-date! Check the status or SQL setup.`, { id: unlockToast, duration: 6000 });
    }
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem("admin_unlocked");
    sessionStorage.removeItem("admin_key");
    setIsUnlocked(false);
    toast.warning("Console locked securely.");
  };

  // ================= CELL EDITING ACTIONS =================

  const handleCellClick = (rowIndex: number, field: string) => {
    setEditingCell({ rowIndex, field });
  };

  const handleCellChange = (value: any, rowIndex: number, field: string) => {
    if (activeTab === "projects") {
      const updated = [...localProjects];
      updated[rowIndex][field] = value;
      setLocalProjects(updated);
    } else if (activeTab === "builders") {
      const updated = [...localBuilders];
      updated[rowIndex][field] = value;
      setLocalBuilders(updated);
    } else if (activeTab === "services") {
      const updated = [...localServices];
      updated[rowIndex][field] = value;
      setLocalServices(updated);
    } else if (activeTab === "categories") {
      const updated = [...localCategories];
      updated[rowIndex][field] = value;
      setLocalCategories(updated);
    } else if (activeTab === "achievements") {
      const updated = [...localAchievements];
      updated[rowIndex][field] = value;
      setLocalAchievements(updated);
    }
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditingCell(null);
    }
  };

  // ================= GRID ROW OPERATIONS =================

  const addRow = () => {
    const tempId = `new-${Date.now()}`;
    if (activeTab === "projects") {
      setLocalProjects([
        ...localProjects,
        {
          id: tempId,
          title: "New Project",
          description: "Describe this project.",
          stack: ["React"],
          repo_url: "",
          live_url: "",
          accent: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          logo_url: "",
        },
      ]);
      toast.info("Added empty row to projects grid");
    } else if (activeTab === "builders") {
      const firstCat = localCategories.length > 0 ? localCategories[0].name : "Fullstack";
      setLocalBuilders([
        ...localBuilders,
        {
          id: tempId,
          name: "New Builder",
          role: "Engineer",
          category: firstCat,
          github: "",
          hue: Math.floor(Math.random() * 360),
          tagline: "Ready to ship.",
          location: "Vietnam",
          years_exp: 1,
          bio: "Passionate code enthusiast.",
          skills: ["React"],
          fun_fact: "Compiles without errors.",
          email: "",
          website: "",
        },
      ]);
      toast.info("Added empty row to team grid");
    } else if (activeTab === "services") {
      setLocalServices([
        ...localServices,
        {
          id: tempId,
          title: "New Service",
          description: "Explain this service.",
          icon: "Terminal",
        },
      ]);
      toast.info("Added empty row to services grid");
    } else if (activeTab === "categories") {
      setLocalCategories([
        ...localCategories,
        {
          id: tempId,
          name: "New Category",
        },
      ]);
      toast.info("Added empty row to categories grid");
    } else if (activeTab === "achievements") {
      setLocalAchievements([
        ...localAchievements,
        {
          id: tempId,
          metric: "0+",
          title: "New Achievement",
          description: "Describe this milestone.",
          image_url: "",
        },
      ]);
      toast.info("Added empty row to achievements grid");
    }
  };

  const deleteRow = (rowIndex: number) => {
    if (activeTab === "projects") {
      const row = localProjects[rowIndex];
      if (!row.id.startsWith("new-") && !row.id.startsWith("temp-")) {
        setDeletedProjects([...deletedProjects, row.id]);
      }
      setLocalProjects(localProjects.filter((_, idx) => idx !== rowIndex));
      toast.warning("Row removed from projects buffer");
    } else if (activeTab === "builders") {
      const row = localBuilders[rowIndex];
      if (!row.id.startsWith("new-") && !row.id.startsWith("temp-")) {
        setDeletedBuilders([...deletedBuilders, row.id]);
      }
      setLocalBuilders(localBuilders.filter((_, idx) => idx !== rowIndex));
      toast.warning("Row removed from builders buffer");
    } else if (activeTab === "services") {
      const row = localServices[rowIndex];
      if (!row.id.startsWith("new-") && !row.id.startsWith("temp-")) {
        setDeletedServices([...deletedServices, row.id]);
      }
      setLocalServices(localServices.filter((_, idx) => idx !== rowIndex));
      toast.warning("Row removed from services buffer");
    } else if (activeTab === "categories") {
      const row = localCategories[rowIndex];
      if (!row.id.startsWith("new-") && !row.id.startsWith("temp-")) {
        setDeletedCategories([...deletedCategories, row.id]);
      }
      setLocalCategories(localCategories.filter((_, idx) => idx !== rowIndex));
      toast.warning("Row removed from categories buffer");
    } else if (activeTab === "achievements") {
      const row = localAchievements[rowIndex];
      if (!row.id.startsWith("new-") && !row.id.startsWith("temp-")) {
        setDeletedAchievements([...deletedAchievements, row.id]);
      }
      setLocalAchievements(localAchievements.filter((_, idx) => idx !== rowIndex));
      toast.warning("Row removed from achievements buffer");
    }
  };

  // ================= DYNAMIC IMAGE STORAGE UPLOADER =================

  const triggerImageUpload = (rowIndex: number, field: string) => {
    setUploadingCell({ rowIndex, field });
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadingCell || !e.target.files || e.target.files.length === 0) {
      setUploadingCell(null);
      return;
    }

    const file = e.target.files[0];
    const { rowIndex, field } = uploadingCell;

    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured yet! Setup credentials first.");
      setUploadingCell(null);
      return;
    }

    const uploadToast = toast.loading(`Uploading ${file.name} to storage bucket...`);

    try {
      const fileExt = file.name.split(".").pop();
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `portfolio/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      handleCellChange(publicUrl, rowIndex, field);

      toast.success("Image uploaded to Storage!", { id: uploadToast });
    } catch (error: any) {
      console.error("Storage upload failed:", error);
      toast.error(`Upload error: ${error.message || "Failed to upload"}`, { id: uploadToast });
    } finally {
      setUploadingCell(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ================= SAVE DATA TO SUPABASE DATABASE =================

  const saveChanges = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Cannot save changes. Supabase is not configured.");
      return;
    }

    setIsSaving(true);
    const saveToast = toast.loading("Saving changes to database...");

    try {
      // 1. Projects Saving
      if (activeTab === "projects") {
        if (deletedProjects.length > 0) {
          const { error } = await supabase.from("projects").delete().in("id", deletedProjects);
          if (error) throw error;
        }

        const upsertRows = localProjects.map((p) => {
          const item: any = {
            title: p.title,
            description: p.description,
            stack: p.stack,
            repo_url: p.repo_url,
            live_url: p.live_url,
            accent: p.accent,
            logo_url: p.logo_url,
          };
          if (!p.id.startsWith("new-") && !p.id.startsWith("temp-")) {
            item.id = p.id;
          }
          return item;
        });

        if (upsertRows.length > 0) {
          const { error } = await supabase.from("projects").upsert(upsertRows);
          if (error) throw error;
        }

        setDeletedProjects([]);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }

      // 2. Builders Saving
      if (activeTab === "builders") {
        if (deletedBuilders.length > 0) {
          const { error } = await supabase.from("builders").delete().in("id", deletedBuilders);
          if (error) throw error;
        }

        const upsertRows = localBuilders.map((b) => {
          const item: any = {
            name: b.name,
            role: b.role,
            category: b.category,
            github: b.github,
            hue: parseInt(b.hue) || 0,
            tagline: b.tagline,
            location: b.location,
            years_exp: parseInt(b.years_exp) || 0,
            bio: b.bio,
            skills: b.skills,
            fun_fact: b.fun_fact,
            email: b.email,
            website: b.website,
          };
          if (!b.id.startsWith("new-") && !b.id.startsWith("temp-")) {
            item.id = b.id;
          }
          return item;
        });

        if (upsertRows.length > 0) {
          const { error } = await supabase.from("builders").upsert(upsertRows);
          if (error) throw error;
        }

        setDeletedBuilders([]);
        queryClient.invalidateQueries({ queryKey: ["builders"] });
      }

      // 3. Services Saving
      if (activeTab === "services") {
        if (deletedServices.length > 0) {
          const { error } = await supabase.from("services").delete().in("id", deletedServices);
          if (error) throw error;
        }

        const upsertRows = localServices.map((s) => {
          const item: any = {
            title: s.title,
            description: s.description,
            icon: s.icon,
          };
          if (!s.id.startsWith("new-") && !s.id.startsWith("temp-")) {
            item.id = s.id;
          }
          return item;
        });

        if (upsertRows.length > 0) {
          const { error } = await supabase.from("services").upsert(upsertRows);
          if (error) throw error;
        }

        setDeletedServices([]);
        queryClient.invalidateQueries({ queryKey: ["services"] });
      }

      // 4. Categories Saving
      if (activeTab === "categories") {
        if (deletedCategories.length > 0) {
          const { error } = await supabase.from("categories").delete().in("id", deletedCategories);
          if (error) throw error;
        }

        const upsertRows = localCategories.map((c) => {
          const item: any = {
            name: c.name,
          };
          if (!c.id.startsWith("new-") && !c.id.startsWith("temp-")) {
            item.id = c.id;
          }
          return item;
        });

        if (upsertRows.length > 0) {
          const { error } = await supabase.from("categories").upsert(upsertRows);
          if (error) throw error;
        }

        setDeletedCategories([]);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }

      // 5. Achievements Saving
      if (activeTab === "achievements") {
        if (deletedAchievements.length > 0) {
          const { error } = await supabase.from("achievements").delete().in("id", deletedAchievements);
          if (error) throw error;
        }

        const upsertRows = localAchievements.map((a) => {
          const item: any = {
            metric: a.metric,
            title: a.title,
            description: a.description,
            image_url: a.image_url || "",
          };
          if (!a.id.startsWith("new-") && !a.id.startsWith("temp-")) {
            item.id = a.id;
          }
          return item;
        });

        if (upsertRows.length > 0) {
          const { error } = await supabase.from("achievements").upsert(upsertRows);
          if (error) throw error;
        }

        setDeletedAchievements([]);
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
      }

      toast.success("Database synced successfully!", { id: saveToast });
    } catch (err: any) {
      console.error("Save failure:", err);
      toast.error(`Database error: ${err.message || "Operation failed"}. Make sure your SQL setup is up-to-date! Check the 'SQL Setup' tab.`, { id: saveToast, duration: 6000 });
    } finally {
      setIsSaving(false);
    }
  };

  // ================= ONE-CLICK SEED DATABASE =================

  const seedDatabase = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Please configure your .env.local keys first.");
      return;
    }

    const confirm = window.confirm(
      "This will import your starting static portfolio files into your Supabase database. Continue?"
    );
    if (!confirm) return;

    setIsSeeding(true);
    const seedToast = toast.loading("Seeding starting tables to Supabase...");

    try {
      // 1. Seed Categories first
      const categoryRows = [
        { name: "Frontend" },
        { name: "Backend" },
        { name: "Fullstack" },
        { name: "AI" },
        { name: "DevOps" },
        { name: "Mobile" },
        { name: "Design" },
      ];
      const { error: cErr } = await supabase.from("categories").upsert(categoryRows, { onConflict: "name" });
      if (cErr) throw cErr;

      // 2. Seed Projects
      const projectRows = mockProjects.map((p) => ({
        title: p.title,
        description: p.description,
        stack: p.stack,
        repo_url: p.repoUrl,
        live_url: p.liveUrl,
        accent: p.accent,
        logo_url: "",
      }));
      const { error: pErr } = await supabase.from("projects").upsert(projectRows);
      if (pErr) throw pErr;

      // 3. Seed Builders
      const builderRows = mockBuilders.map((b) => ({
        name: b.name,
        role: b.role,
        category: b.category,
        github: b.github,
        hue: b.hue,
        tagline: b.tagline,
        location: b.location,
        years_exp: b.yearsExp,
        bio: b.bio,
        skills: b.skills,
        fun_fact: b.funFact,
        email: b.email,
        website: b.website,
      }));
      const { error: bErr } = await supabase.from("builders").upsert(builderRows);
      if (bErr) throw bErr;

      // 4. Seed Achievements
      const achievementRows = mockAchievements.map((a) => ({
        metric: a.metric,
        title: a.title,
        description: a.description,
        image_url: a.image_url || "",
      }));
      const { error: aErr } = await supabase.from("achievements").upsert(achievementRows);
      if (aErr) throw aErr;

      toast.success("Database populated with mock data!", { id: seedToast });
      
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["builders"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    } catch (err: any) {
      console.error("Seeding failed:", err);
      toast.error(`Database seeding failed: ${err.message}. Ensure you have created the tables in Supabase SQL editor! Check the 'SQL Setup' tab.`, { id: seedToast, duration: 6000 });
    } finally {
      setIsSeeding(false);
    }
  };

  // SQL Script
  const sqlScript = `-- 1. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    stack TEXT[] DEFAULT '{}',
    repo_url TEXT,
    live_url TEXT,
    accent TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE BUILDERS TABLE (TEAM)
CREATE TABLE IF NOT EXISTS public.builders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    category TEXT,
    github TEXT,
    hue INTEGER DEFAULT 0,
    tagline TEXT,
    location TEXT,
    years_exp INTEGER DEFAULT 0,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    fun_fact TEXT,
    email TEXT,
    website TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric TEXT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 6. DROP POLICIES IF THEY ALREADY EXIST (To prevent duplicate object errors)
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public read builders" ON public.builders;
DROP POLICY IF EXISTS "Allow public read services" ON public.services;
DROP POLICY IF EXISTS "Allow public read achievements" ON public.achievements;

DROP POLICY IF EXISTS "Allow secure write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow secure write projects" ON public.projects;
DROP POLICY IF EXISTS "Allow secure write builders" ON public.builders;
DROP POLICY IF EXISTS "Allow secure write services" ON public.services;
DROP POLICY IF EXISTS "Allow secure write achievements" ON public.achievements;

DROP POLICY IF EXISTS "Allow all actions categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all actions projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all actions builders" ON public.builders;
DROP POLICY IF EXISTS "Allow all actions services" ON public.services;

-- 7. CREATE READ POLICIES (Allow public select)
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read builders" ON public.builders FOR SELECT USING (true);
CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read achievements" ON public.achievements FOR SELECT USING (true);

-- 8. CREATE SERVER-SIDE PASSWORD VERIFICATION FUNCTION (Pentest-Proof)
-- Custom Postgres function running on the server side so the key is never exposed to the client!
-- IMPORTANT: Change 'your_secret_password' below to your desired secure password!
CREATE OR REPLACE FUNCTION public.verify_admin_key(input_key text)
RETURNS boolean AS $$
DECLARE
  correct_key text;
BEGIN
  correct_key := 'your_secret_password';
  RETURN input_key = correct_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE SECURE WRITE POLICIES (Checks custom HTTP header x-admin-key)
-- Enforces that all INSERT, UPDATE, DELETE requests have the correct x-admin-key header value!
-- IMPORTANT: Replace 'your_secret_password' below with your chosen password!

CREATE POLICY "Allow secure write categories" ON public.categories 
FOR ALL USING (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password') 
WITH CHECK (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password');

CREATE POLICY "Allow secure write projects" ON public.projects 
FOR ALL USING (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password') 
WITH CHECK (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password');

CREATE POLICY "Allow secure write builders" ON public.builders 
FOR ALL USING (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password') 
WITH CHECK (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password');

CREATE POLICY "Allow secure write services" ON public.services 
FOR ALL USING (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password') 
WITH CHECK (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password');

CREATE POLICY "Allow secure write achievements" ON public.achievements 
FOR ALL USING (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password') 
WITH CHECK (current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password');

-- 10. SETUP STORAGE BUCKETS FOR IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true) 
ON CONFLICT DO NOTHING;

-- Storage Policies cleanup
DROP POLICY IF EXISTS "Public Read Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Objects" ON storage.objects;
DROP POLICY IF EXISTS "Secure Upload Objects" ON storage.objects;
DROP POLICY IF EXISTS "Secure Update Objects" ON storage.objects;
DROP POLICY IF EXISTS "Secure Delete Objects" ON storage.objects;

-- Storage Read Policy
CREATE POLICY "Public Read Objects" ON storage.objects 
FOR SELECT USING (bucket_id = 'portfolio-images');

-- Storage Secure Write Policies (Requires x-admin-key custom header)
-- IMPORTANT: Replace 'your_secret_password' below with your chosen password!
CREATE POLICY "Secure Upload Objects" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-images' AND 
  current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password'
);

CREATE POLICY "Secure Update Objects" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'portfolio-images' AND 
  current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password'
);

CREATE POLICY "Secure Delete Objects" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'portfolio-images' AND 
  current_setting('request.headers', true)::json->>'x-admin-key' = 'your_secret_password'
);
`;

  // ================= RENDER INTERFACE GATES =================

  if (!isUnlocked) {
    /* SECURE PRIVATE PASSWORD GATE VIEW */
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.005_260)] flex items-center justify-center px-4 font-mono">
        <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
          <div
            className="absolute -top-24 -right-24 size-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--neon), transparent 65%)",
              opacity: 0.25,
              filter: "blur(40px)",
            }}
            aria-hidden
          />

          <div className="text-center">
            <div className="inline-flex size-12 rounded-xl bg-neon/10 border border-neon/30 text-neon items-center justify-center shadow-[0_0_15px_rgba(39,201,63,0.15)] mb-5">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-bold tracking-wider text-foreground">
              ADMINISTRATOR CONSOLE
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-widest">
              Private Security Authentication Gate
            </p>
          </div>

          <form onSubmit={handleUnlockConsole} className="mt-8 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Enter Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/60 border border-border hover:border-neon/40 focus:border-neon rounded-lg px-3 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/30 font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neon hover:bg-neon/90 text-black text-xs font-bold rounded-lg tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(39,201,63,0.15)] cursor-pointer"
            >
              Unlock Console
            </button>
          </form>

          <div className="mt-8 border-t border-border/50 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* FULL EXCEL SPREADSHEET EDITOR VIEW */
  return (
    <div className="min-h-screen bg-[oklch(0.08_0.005_260)] text-foreground pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-6 mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 border border-border bg-card/60 rounded-lg hover:text-neon hover:border-neon/60 transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-neon animate-pulse" />
                <h1 className="text-xl md:text-2xl font-mono font-bold tracking-tight">
                  Little-Boys/Admin
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Manage your real database tables & file uploads instantly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === "sql-setup" ? "projects" : "sql-setup")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-all ${
                isSupabaseConfigured
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-400"
              }`}
              title="Click to toggle SQL Database Setup Instructions"
            >
              <Database className="size-3" />
              {isSupabaseConfigured ? "Connected" : "Fallback Mode"}
            </button>

            <button
              onClick={handleLockConsole}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 text-red-400 font-mono text-[10px] uppercase tracking-wider rounded-md transition-colors cursor-pointer"
              title="Lock Admin Console"
            >
              <Unlock className="size-3" /> Lock
            </button>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-start gap-4 font-mono">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-300">Supabase Credentials Missing</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                The application is running in <strong>mock mode</strong>. Changes cannot be saved to the database. 
                Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local <code>.env.local</code> file and restart your local dev server.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card/40 border border-border p-4 rounded-xl backdrop-blur-xl">
          {/* Tab Selection */}
          <div className="flex bg-white/5 border border-border p-1 rounded-lg flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === "projects" ? "bg-neon text-black font-semibold shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" /> Projects
            </button>
            <button
              onClick={() => setActiveTab("builders")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === "builders" ? "bg-neon text-black font-semibold shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" /> Builders (Team)
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === "services" ? "bg-neon text-black font-semibold shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" /> Services
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === "categories" ? "bg-neon text-black font-semibold shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" /> Categories
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeTab === "achievements" ? "bg-neon text-black font-semibold shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-3.5" /> Achievements
            </button>
          </div>

          {activeTab !== "sql-setup" && (
            <div className="flex items-center gap-2">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-border hover:bg-white/10 text-xs font-mono rounded-md transition-colors"
              >
                <Plus className="size-3.5" /> Add Row
              </button>

              <button
                onClick={seedDatabase}
                disabled={isSeeding || !isSupabaseConfigured}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#092d1c] border border-emerald-500/30 hover:bg-[#0c3e27] disabled:opacity-50 disabled:pointer-events-none text-emerald-400 text-xs font-mono rounded-md transition-colors"
              >
                {isSeeding ? <Loader2 className="size-3.5 animate-spin" /> : <Database className="size-3.5" />}
                Import Defaults
              </button>

              <button
                onClick={saveChanges}
                disabled={isSaving || !isSupabaseConfigured}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-neon hover:bg-neon/90 text-black font-mono font-bold text-xs rounded-md shadow-md shadow-neon/15 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Sync Database
              </button>
            </div>
          )}
        </div>

        <div className="border border-border/80 bg-[oklch(0.12_0.01_260)] rounded-2xl overflow-hidden shadow-2xl">
          {activeTab === "sql-setup" ? (
            <div className="p-6 md:p-8 font-mono">
              <h2 className="text-lg font-mono font-semibold flex items-center gap-2 mb-4">
                <Code className="text-cyan size-5" /> Supabase Database & Storage Setup Instructions
              </h2>
              
              <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground mb-6 leading-relaxed">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-cyan underline">Supabase Dashboard</a> and open your project.</li>
                <li>Navigate to the <strong>SQL Editor</strong> tab on the left-side navigation bar.</li>
                <li>Click <strong>New Query</strong> and paste the entire SQL setup block below.</li>
                <li>Click <strong>Run</strong> on the top right to execute and build your PostgreSQL tables, access policies, and image Storage bucket.</li>
                <li>Once successful, return to this panel, click the green <strong>"Import Defaults"</strong> button above to populate the DB, and start typing!</li>
              </ol>

              <div className="relative">
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlScript);
                      toast.success("SQL Script copied to clipboard!");
                    }}
                    className="px-2.5 py-1.5 bg-card hover:bg-secondary text-[11px] font-mono border border-border rounded-md text-foreground transition-all"
                  >
                    Copy Script
                  </button>
                </div>

                <pre className="bg-[#07080c] border border-border/80 text-[#00ffcc] p-5 rounded-xl text-xs overflow-x-auto max-h-[480px] font-mono leading-6">
                  {sqlScript}
                </pre>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full">
              {activeTab === "projects" && (
                <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
                  <thead>
                    <tr className="bg-card border-b border-border/80 text-muted-foreground text-left select-none">
                      <th className="p-3 border-r border-border/40 w-12 text-center">No.</th>
                      <th className="p-3 border-r border-border/40 w-48">Title</th>
                      <th className="p-3 border-r border-border/40 w-72">Description</th>
                      <th className="p-3 border-r border-border/40 w-44">Tech Stack</th>
                      <th className="p-3 border-r border-border/40 w-40">Logo Preview / Storage</th>
                      <th className="p-3 border-r border-border/40 w-52">Repository URL</th>
                      <th className="p-3 border-r border-border/40 w-52">Live URL</th>
                      <th className="p-3 border-r border-border/40 w-48">CSS Accent Accent</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localProjects.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-muted-foreground select-none">
                          No projects. Click "Add Row" or "Import Defaults" to populate the grid.
                        </td>
                      </tr>
                    ) : (
                      localProjects.map((row, idx) => (
                        <tr key={row.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-3 border-r border-border/30 text-center text-muted-foreground/60 select-none bg-card/20">
                            {idx + 1}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => handleCellClick(idx, "title")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "title" ? (
                              <input
                                autoFocus
                                value={row.title || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "title")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.title || <span className="text-muted-foreground/40 italic">Double-click to edit</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-xs"
                            onClick={() => handleCellClick(idx, "description")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "description" ? (
                              <textarea
                                autoFocus
                                value={row.description || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "description")}
                                onBlur={handleCellBlur}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none min-h-[60px]"
                              />
                            ) : (
                              row.description || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => handleCellClick(idx, "stack")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "stack" ? (
                              <input
                                autoFocus
                                value={row.stack?.join(", ") || ""}
                                onChange={(e) => handleCellChange(e.target.value.split(",").map(s => s.trim()), idx, "stack")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                placeholder="Comma separated, e.g. React, Node"
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {row.stack && row.stack.length > 0 ? (
                                  row.stack.map((s: string) => (
                                    <span key={s} className="px-1.5 py-0.5 bg-white/5 ring-1 ring-border rounded text-[10px] text-muted-foreground">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground/40 italic">Empty</span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-3 border-r border-border/30 select-none">
                            <div className="flex items-center gap-2">
                              {row.logo_url ? (
                                <img src={row.logo_url} alt="Logo" className="size-8 object-cover rounded border border-border/60 bg-black/40" />
                              ) : (
                                <div className="size-8 rounded border border-dashed border-border/60 bg-black/40 flex items-center justify-center text-muted-foreground">
                                  <Image className="size-4" />
                                </div>
                              )}
                              <button
                                onClick={() => triggerImageUpload(idx, "logo_url")}
                                className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:text-neon rounded-md transition-colors"
                                title="Upload Logo to Supabase Storage"
                              >
                                <Upload className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-[150px]"
                            onClick={() => handleCellClick(idx, "repo_url")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "repo_url" ? (
                              <input
                                autoFocus
                                value={row.repo_url || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "repo_url")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.repo_url || <span className="text-muted-foreground/40 italic">Empty link</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-[150px]"
                            onClick={() => handleCellClick(idx, "live_url")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "live_url" ? (
                              <input
                                autoFocus
                                value={row.live_url || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "live_url")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.live_url || <span className="text-muted-foreground/40 italic">Empty link</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => handleCellClick(idx, "accent")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "accent" ? (
                              <input
                                autoFocus
                                value={row.accent || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "accent")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs">
                                <span className="size-3 rounded border border-border" style={{ background: row.accent }} />
                                <span className="text-muted-foreground truncate max-w-[140px]">{row.accent || "Default color"}</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteRow(idx)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "builders" && (
                <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
                  <thead>
                    <tr className="bg-card border-b border-border/80 text-muted-foreground text-left select-none">
                      <th className="p-3 border-r border-border/40 w-12 text-center">No.</th>
                      <th className="p-3 border-r border-border/40 w-44">Name</th>
                      <th className="p-3 border-r border-border/40 w-44">Role / Title</th>
                      <th className="p-3 border-r border-border/40 w-36">Category</th>
                      <th className="p-3 border-r border-border/40 w-32">Avatar / Storage</th>
                      <th className="p-3 border-r border-border/40 w-16 text-center">Hue</th>
                      <th className="p-3 border-r border-border/40 w-52">Tagline</th>
                      <th className="p-3 border-r border-border/40 w-44">Location</th>
                      <th className="p-3 border-r border-border/40 w-16 text-center">Exp (Yrs)</th>
                      <th className="p-3 border-r border-border/40 w-64">Biography</th>
                      <th className="p-3 border-r border-border/40 w-48">Skills Array</th>
                      <th className="p-3 border-r border-border/40 w-52">Fun Fact</th>
                      <th className="p-3 border-r border-border/40 w-44">Github Profile</th>
                      <th className="p-3 border-r border-border/40 w-44">Email Address</th>
                      <th className="p-3 border-r border-border/40 w-44">Website</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localBuilders.length === 0 ? (
                      <tr>
                        <td colSpan={16} className="p-8 text-center text-muted-foreground select-none">
                          No team builders. Click "Add Row" or "Import Defaults" to populate the grid.
                        </td>
                      </tr>
                    ) : (
                      localBuilders.map((row, idx) => (
                        <tr key={row.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-3 border-r border-border/30 text-center text-muted-foreground/60 select-none bg-card/20">
                            {idx + 1}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => handleCellClick(idx, "name")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "name" ? (
                              <input
                                autoFocus
                                value={row.name || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "name")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.name || <span className="text-muted-foreground/40 italic">Missing name</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => handleCellClick(idx, "role")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "role" ? (
                              <input
                                autoFocus
                                value={row.role || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "role")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.role || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td className="p-3 border-r border-border/30">
                            <select
                              value={row.category || "Fullstack"}
                              onChange={(e) => handleCellChange(e.target.value, idx, "category")}
                              className="w-full bg-black/60 border border-border/40 px-1.5 py-1 text-xs rounded text-foreground outline-none cursor-pointer font-mono"
                            >
                              {localCategories.map((cat) => (
                                <option key={cat.id} value={cat.name} className="bg-[oklch(0.12_0.01_260)] text-foreground">
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3 border-r border-border/30 select-none">
                            <div className="flex items-center gap-2">
                              {row.avatar_url ? (
                                <img src={row.avatar_url} alt="Avatar" className="size-8 object-cover rounded-full border border-border/60 bg-black/40" />
                              ) : (
                                <div 
                                  className="size-8 rounded-full border border-border/40 flex items-center justify-center font-bold text-xs"
                                  style={{
                                    background: `linear-gradient(135deg, hsl(${row.hue || 0}, 80%, 60%), hsl(${(row.hue || 0) + 60}, 80%, 40%))`,
                                    color: "#000",
                                  }}
                                >
                                  {row.name ? row.name.charAt(0) : "?"}
                                </div>
                              )}
                              <button
                                onClick={() => triggerImageUpload(idx, "avatar_url")}
                                className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:text-neon rounded-md transition-colors"
                                title="Upload Custom Avatar Image to Storage"
                              >
                                <Upload className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 text-center"
                            onClick={() => handleCellClick(idx, "hue")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "hue" ? (
                              <input
                                autoFocus
                                type="number"
                                min={0}
                                max={360}
                                value={row.hue ?? 0}
                                onChange={(e) => handleCellChange(parseInt(e.target.value) || 0, idx, "hue")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-16 bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-center text-foreground outline-none"
                              />
                            ) : (
                              row.hue ?? 0
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-xs truncate"
                            onClick={() => handleCellClick(idx, "tagline")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "tagline" ? (
                              <input
                                autoFocus
                                value={row.tagline || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "tagline")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.tagline || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => handleCellClick(idx, "location")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "location" ? (
                              <input
                                autoFocus
                                value={row.location || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "location")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.location || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 text-center"
                            onClick={() => handleCellClick(idx, "years_exp")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "years_exp" ? (
                              <input
                                autoFocus
                                type="number"
                                min={0}
                                max={50}
                                value={row.years_exp ?? 0}
                                onChange={(e) => handleCellChange(parseInt(e.target.value) || 0, idx, "years_exp")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-12 bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-center text-foreground outline-none"
                              />
                            ) : (
                              row.years_exp ?? 0
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-xs"
                            onClick={() => handleCellClick(idx, "bio")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "bio" ? (
                              <textarea
                                autoFocus
                                value={row.bio || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "bio")}
                                onBlur={handleCellBlur}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none min-h-[60px]"
                              />
                            ) : (
                              row.bio || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => handleCellClick(idx, "skills")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "skills" ? (
                              <input
                                autoFocus
                                value={row.skills?.join(", ") || ""}
                                onChange={(e) => handleCellChange(e.target.value.split(",").map(s => s.trim()), idx, "skills")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                placeholder="e.g. React, CSS"
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {row.skills && row.skills.length > 0 ? (
                                  row.skills.map((s: string) => (
                                    <span key={s} className="px-1.5 py-0.5 bg-white/5 ring-1 ring-border rounded text-[10px] text-muted-foreground">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground/40 italic">Empty</span>
                                )}
                              </div>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-xs truncate"
                            onClick={() => handleCellClick(idx, "fun_fact")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "fun_fact" ? (
                              <input
                                autoFocus
                                value={row.fun_fact || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "fun_fact")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.fun_fact || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => handleCellClick(idx, "github")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "github" ? (
                              <input
                                autoFocus
                                value={row.github || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "github")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.github || <span className="text-muted-foreground/40 italic">Empty link</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => handleCellClick(idx, "email")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "email" ? (
                              <input
                                autoFocus
                                type="email"
                                value={row.email || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "email")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.email || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => handleCellClick(idx, "website")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "website" ? (
                              <input
                                autoFocus
                                value={row.website || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "website")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.website || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteRow(idx)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "services" && (
                <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
                  <thead>
                    <tr className="bg-card border-b border-border/80 text-muted-foreground text-left select-none">
                      <th className="p-3 border-r border-border/40 w-12 text-center">No.</th>
                      <th className="p-3 border-r border-border/40 w-64">Service Name</th>
                      <th className="p-3 border-r border-border/40 w-96">Description</th>
                      <th className="p-3 border-r border-border/40 w-44">Lucide Icon</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground select-none">
                          No services. Click "Add Row" or "Import Defaults" to populate the grid.
                        </td>
                      </tr>
                    ) : (
                      localServices.map((row, idx) => (
                        <tr key={row.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-3 border-r border-border/30 text-center text-muted-foreground/60 select-none bg-card/20">
                            {idx + 1}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => handleCellClick(idx, "title")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "title" ? (
                              <input
                                autoFocus
                                value={row.title || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "title")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.title || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-sm"
                            onClick={() => handleCellClick(idx, "description")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "description" ? (
                              <textarea
                                autoFocus
                                value={row.description || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "description")}
                                onBlur={handleCellBlur}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none min-h-[60px]"
                              />
                            ) : (
                              row.description || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td className="p-3 border-r border-border/30">
                            <select
                              value={row.icon || "Terminal"}
                              onChange={(e) => handleCellChange(e.target.value, idx, "icon")}
                              className="w-full bg-black/60 border border-border/40 px-1.5 py-1 rounded text-foreground outline-none cursor-pointer"
                            >
                              {LUCIDE_ICONS.map((ico) => (
                                <option key={ico} value={ico} className="bg-[oklch(0.12_0.01_260)] text-foreground">
                                  {ico}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteRow(idx)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "categories" && (
                <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
                  <thead>
                    <tr className="bg-card border-b border-border/80 text-muted-foreground text-left select-none">
                      <th className="p-3 border-r border-border/40 w-12 text-center">No.</th>
                      <th className="p-3 border-r border-border/40 w-96">Category Name (Discipline)</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground select-none">
                          No categories. Click "Add Row" or "Import Defaults" to populate the grid.
                        </td>
                      </tr>
                    ) : (
                      localCategories.map((row, idx) => (
                        <tr key={row.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-3 border-r border-border/30 text-center text-muted-foreground/60 select-none bg-card/20">
                            {idx + 1}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => handleCellClick(idx, "name")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "name" ? (
                              <input
                                autoFocus
                                value={row.name || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "name")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.name || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteRow(idx)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "achievements" && (
                <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
                  <thead>
                    <tr className="bg-card border-b border-border/80 text-muted-foreground text-left select-none">
                      <th className="p-3 border-r border-border/40 w-12 text-center">No.</th>
                      <th className="p-3 border-r border-border/40 w-32">Metric</th>
                      <th className="p-3 border-r border-border/40 w-64">Title</th>
                      <th className="p-3 border-r border-border/40 w-96">Description</th>
                      <th className="p-3 border-r border-border/40 w-40">Certificate Image / Upload</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localAchievements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground select-none">
                          No achievements. Click "Add Row" or "Import Defaults" to populate the grid.
                        </td>
                      </tr>
                    ) : (
                      localAchievements.map((row, idx) => (
                        <tr key={row.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-3 border-r border-border/30 text-center text-muted-foreground/60 select-none bg-card/20">
                            {idx + 1}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold text-cyan"
                            onClick={() => handleCellClick(idx, "metric")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "metric" ? (
                              <input
                                autoFocus
                                value={row.metric || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "metric")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.metric || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => handleCellClick(idx, "title")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "title" ? (
                              <input
                                autoFocus
                                value={row.title || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "title")}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyPress}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none"
                              />
                            ) : (
                              row.title || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-sm"
                            onClick={() => handleCellClick(idx, "description")}
                          >
                            {editingCell?.rowIndex === idx && editingCell?.field === "description" ? (
                              <textarea
                                autoFocus
                                value={row.description || ""}
                                onChange={(e) => handleCellChange(e.target.value, idx, "description")}
                                onBlur={handleCellBlur}
                                className="w-full bg-black/60 border border-neon/50 px-1 py-0.5 rounded text-foreground outline-none min-h-[60px]"
                              />
                            ) : (
                              row.description || <span className="text-muted-foreground/40 italic">Empty</span>
                            )}
                          </td>

                          <td className="p-3 border-r border-border/30 select-none">
                            <div className="flex items-center gap-2">
                              {row.image_url ? (
                                <img src={row.image_url} alt="Certificate" className="size-8 object-cover rounded border border-border/60 bg-black/40" />
                              ) : (
                                <div className="size-8 rounded border border-dashed border-border/60 bg-black/40 flex items-center justify-center text-muted-foreground">
                                  <Image className="size-4" />
                                </div>
                              )}
                              <button
                                onClick={() => triggerImageUpload(idx, "image_url")}
                                className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:text-neon rounded-md transition-colors"
                                title="Upload Certificate Image to Storage"
                              >
                                <Upload className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteRow(idx)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
