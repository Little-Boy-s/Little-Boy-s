import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowLeft, Plus, Trash2, Save, RefreshCw, Upload, Database, 
  Code, HelpCircle, Check, Loader2, FileSpreadsheet, Eye, Image, Lock, Unlock,
  Edit, X
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
  const [isMockMode, setIsMockMode] = useState(() => {
    if (!isSupabaseConfigured) return true;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_use_mock") === "true";
    }
    return false;
  });

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
  
  // Row Editor Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [modalDraft, setModalDraft] = useState<any | null>(null);
  
  // Custom gradient builder states
  const [gradientColorA, setGradientColorA] = useState("#00f2fe");
  const [gradientColorB, setGradientColorB] = useState("#4facfe");
  const [gradientAngle, setGradientAngle] = useState(135);

  // Loading status for save & seed mutations
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [uploadingCell, setUploadingCell] = useState<{ rowIndex: number | null; field: string; isModal?: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check sessionStorage on component mount to see if already unlocked
  useEffect(() => {
    const unlocked = sessionStorage.getItem("admin_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
      const useMock = sessionStorage.getItem("admin_use_mock") === "true";
      setIsMockMode(!isSupabaseConfigured || useMock);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        setEditingRowIndex(null);
        setModalDraft(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

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
        sessionStorage.setItem("admin_use_mock", "true");
        setIsUnlocked(true);
        setIsMockMode(true);
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
        sessionStorage.removeItem("admin_use_mock");
        setIsUnlocked(true);
        setIsMockMode(false);
        setPasswordInput("");
        toast.success("Console unlocked. Welcome back, Administrator.", { id: unlockToast });
      } else {
        if (passwordInput === "admin123") {
          sessionStorage.setItem("admin_unlocked", "true");
          sessionStorage.setItem("admin_key", "admin123");
          sessionStorage.setItem("admin_use_mock", "true");
          setIsUnlocked(true);
          setIsMockMode(true);
          setPasswordInput("");
          toast.success("Console unlocked (Mock Mode). Welcome back, Administrator.", { id: unlockToast });
        } else {
          toast.error("Invalid password. Access Denied.", { id: unlockToast });
        }
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      
      const isNetworkError = err.message?.includes("fetch") || err.message?.includes("NetworkError") || err.name === "TypeError";
      
      if (isNetworkError && passwordInput === "admin123") {
        sessionStorage.setItem("admin_unlocked", "true");
        sessionStorage.setItem("admin_key", "admin123");
        sessionStorage.setItem("admin_use_mock", "true");
        setIsUnlocked(true);
        setIsMockMode(true);
        setPasswordInput("");
        toast.success("Database unreachable. Unlocked in Mock Mode successfully!", { id: unlockToast });
      } else {
        const errorMsg = isNetworkError 
          ? "Failed to connect to Supabase database. This is often caused by ISP blocks (common in Vietnam for supabase.co) or adblockers. Try using a VPN, changing your DNS to 1.1.1.1, or use the password 'admin123' to unlock Mock Mode."
          : (err.message || "Failed to communicate with database");
        
        toast.error(`Authentication failed: ${errorMsg}`, { id: unlockToast, duration: 8000 });
      }
    }
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem("admin_unlocked");
    sessionStorage.removeItem("admin_key");
    sessionStorage.removeItem("admin_use_mock");
    setIsUnlocked(false);
    setIsMockMode(!isSupabaseConfigured);
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

  // ================= MODAL EDITOR ACTIONS =================

  const updateCustomGradient = (colorA: string, colorB: string, angle: number) => {
    setGradientColorA(colorA);
    setGradientColorB(colorB);
    setGradientAngle(angle);
    setModalDraft((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        accent: `linear-gradient(${angle}deg, ${colorA}, ${colorB})`
      };
    });
  };

  const applyPresetGradient = (gradient: string) => {
    setModalDraft((prev: any) => {
      if (!prev) return prev;
      return { ...prev, accent: gradient };
    });

    const match = gradient.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}),\s*(#[a-fA-F0-9]{6})\)/);
    if (match) {
      setGradientAngle(parseInt(match[1]) || 135);
      setGradientColorA(match[2]);
      setGradientColorB(match[3]);
    }
  };

  const openEditorModal = (index: number) => {
    setEditingRowIndex(index);
    let originalRow = null;
    if (activeTab === "projects") {
      originalRow = localProjects[index];
    } else if (activeTab === "builders") {
      originalRow = localBuilders[index];
    } else if (activeTab === "services") {
      originalRow = localServices[index];
    } else if (activeTab === "categories") {
      originalRow = localCategories[index];
    } else if (activeTab === "achievements") {
      originalRow = localAchievements[index];
    }
    
    if (originalRow) {
      setModalDraft({ ...originalRow });
      
      // Parse accent to set initial gradient values if it's a projects row
      if (activeTab === "projects" && originalRow.accent) {
        const match = originalRow.accent.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}),\s*(#[a-fA-F0-9]{6})\)/);
        if (match) {
          const angle = parseInt(match[1]) || 135;
          const colorA = match[2];
          const colorB = match[3];
          setGradientAngle(angle);
          setGradientColorA(colorA);
          setGradientColorB(colorB);
        } else if (originalRow.accent.startsWith("#")) {
          setGradientColorA(originalRow.accent);
          setGradientColorB(originalRow.accent);
          setGradientAngle(135);
        } else {
          setGradientColorA("#00f2fe");
          setGradientColorB("#4facfe");
          setGradientAngle(135);
        }
      }
      setIsModalOpen(true);
    }
  };

  const saveModalChanges = () => {
    if (editingRowIndex === null || !modalDraft) return;
    
    if (activeTab === "projects") {
      const updated = [...localProjects];
      updated[editingRowIndex] = modalDraft;
      setLocalProjects(updated);
    } else if (activeTab === "builders") {
      const updated = [...localBuilders];
      updated[editingRowIndex] = modalDraft;
      setLocalBuilders(updated);
    } else if (activeTab === "services") {
      const updated = [...localServices];
      updated[editingRowIndex] = modalDraft;
      setLocalServices(updated);
    } else if (activeTab === "categories") {
      const updated = [...localCategories];
      updated[editingRowIndex] = modalDraft;
      setLocalCategories(updated);
    } else if (activeTab === "achievements") {
      const updated = [...localAchievements];
      updated[editingRowIndex] = modalDraft;
      setLocalAchievements(updated);
    }
    
    setIsModalOpen(false);
    setEditingRowIndex(null);
    setModalDraft(null);
    toast.success("Applied changes to draft spreadsheet buffer!");
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

  const triggerImageUpload = (rowIndex: number | null, field: string, isModal = false) => {
    setUploadingCell({ rowIndex, field, isModal });
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
    const { rowIndex, field, isModal } = uploadingCell;

    if (isMockMode) {
      toast.error("Cannot upload images while in Mock Mode. Set up a working Supabase configuration to use storage.");
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

      if (isModal) {
        setModalDraft((prev: any) => ({
          ...prev,
          [field]: publicUrl
        }));
      } else if (rowIndex !== null) {
        handleCellChange(publicUrl, rowIndex, field);
      }

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
    if (isMockMode) {
      toast.error("Cannot save changes while in Mock Mode. To save, please connect to a working Supabase database.");
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
    if (isMockMode) {
      toast.error("Cannot seed database while in Mock Mode. To seed, please connect to a working Supabase database.");
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
                !isMockMode
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-400"
              }`}
              title="Click to toggle SQL Database Setup Instructions"
            >
              <Database className="size-3" />
              {!isMockMode ? "Connected" : "Fallback Mode"}
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

        {isMockMode && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-start gap-4 font-mono">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-300">
                {!isSupabaseConfigured ? "Supabase Credentials Missing" : "Supabase Database Offline / Unreachable"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed text-left">
                {!isSupabaseConfigured ? (
                  <>
                    The application is running in <strong>mock mode</strong>. Changes cannot be saved to the database. 
                    Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local <code>.env.local</code> file and restart your local dev server.
                  </>
                ) : (
                  <>
                    The application is running in <strong>mock mode</strong> because the Supabase database is unreachable. 
                    This is often caused by ISP blocks (common in Vietnam for <code>supabase.co</code>) or network problems. 
                    Try using a VPN, changing your DNS to <code>1.1.1.1</code> or <code>8.8.8.8</code>, or check your connection to connect securely.
                  </>
                )}
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
                disabled={isSeeding || isMockMode}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#092d1c] border border-emerald-500/30 hover:bg-[#0c3e27] disabled:opacity-50 disabled:pointer-events-none text-emerald-400 text-xs font-mono rounded-md transition-colors"
              >
                {isSeeding ? <Loader2 className="size-3.5 animate-spin" /> : <Database className="size-3.5" />}
                Import Defaults
              </button>

              <button
                onClick={saveChanges}
                disabled={isSaving || isMockMode}
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
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.title || <span className="text-muted-foreground/40 italic">Click to edit</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-xs"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.description || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
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
                                className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:text-neon rounded-md transition-colors cursor-pointer"
                                title="Upload Logo to Supabase Storage"
                              >
                                <Upload className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-[150px]"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.repo_url || <span className="text-muted-foreground/40 italic">Empty link</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-[150px]"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.live_url || <span className="text-muted-foreground/40 italic">Empty link</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
                            <span className="flex items-center gap-1.5 text-xs">
                              <span className="size-3 rounded border border-border" style={{ background: row.accent }} />
                              <span className="text-muted-foreground truncate max-w-[140px]">{row.accent || "Default color"}</span>
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditorModal(idx)}
                                className="p-1.5 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded-md transition-colors cursor-pointer"
                                title="Edit row in spacious layout"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => deleteRow(idx)}
                                className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
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
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.name || <span className="text-muted-foreground/40 italic">Missing name</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.role || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
                            <span className="px-2 py-0.5 bg-white/5 border border-border rounded text-xs text-muted-foreground font-mono">
                              {row.category || "Fullstack"}
                            </span>
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
                                className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:text-neon rounded-md transition-colors cursor-pointer"
                                title="Upload Custom Avatar Image to Storage"
                              >
                                <Upload className="size-3.5" />
                              </button>
                            </div>
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 text-center"
                            onClick={() => openEditorModal(idx)}
                          >
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] text-black font-bold tracking-wide font-sans" style={{ background: `hsl(${row.hue || 0}, 85%, 60%)` }}>
                              {row.hue ?? 0}°
                            </span>
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-xs truncate"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.tagline || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.location || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 text-center"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.years_exp ?? 0} yrs
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-xs"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.bio || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
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
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-xs truncate"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.fun_fact || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.github || <span className="text-muted-foreground/40 italic">Empty link</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.email || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 max-w-[150px] truncate"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.website || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditorModal(idx)}
                                className="p-1.5 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded-md transition-colors cursor-pointer"
                                title="Edit row in spacious layout"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => deleteRow(idx)}
                                className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
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
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.title || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-sm"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.description || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5"
                            onClick={() => openEditorModal(idx)}
                          >
                            <span className="px-2 py-0.5 bg-white/5 border border-border rounded text-xs text-muted-foreground font-mono">
                              {row.icon || "Terminal"}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditorModal(idx)}
                                className="p-1.5 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded-md transition-colors cursor-pointer"
                                title="Edit row in spacious layout"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => deleteRow(idx)}
                                className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
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
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.name || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditorModal(idx)}
                                className="p-1.5 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded-md transition-colors cursor-pointer"
                                title="Edit row in spacious layout"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => deleteRow(idx)}
                                className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
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
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.metric || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 font-semibold"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.title || <span className="text-muted-foreground/40 italic">Empty</span>}
                          </td>

                          <td 
                            className="p-3 border-r border-border/30 cursor-pointer hover:bg-white/5 truncate max-w-sm"
                            onClick={() => openEditorModal(idx)}
                          >
                            {row.description || <span className="text-muted-foreground/40 italic">Empty</span>}
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
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditorModal(idx)}
                                className="p-1.5 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded-md transition-colors cursor-pointer"
                                title="Edit row in spacious layout"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => deleteRow(idx)}
                                className="p-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
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

      {isModalOpen && modalDraft && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setEditingRowIndex(null);
              setModalDraft(null);
            }
          }}
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-[#090b10] border border-border rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col my-8 max-h-[78vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan animate-pulse" />
                <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">
                  Row Editor — Tab: {activeTab}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRowIndex(null);
                  setModalDraft(null);
                }}
                className="p-1.5 hover:bg-white/5 text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 select-none">
              {activeTab === "projects" && (
                <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Project Title</label>
                      <input 
                        type="text" 
                        value={modalDraft.title || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, title: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>

                    <div className="bg-black/30 border border-border/60 p-4 rounded-xl space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">CSS Accent Theme</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={modalDraft.accent || ""} 
                            onChange={(e) => {
                              const newAccent = e.target.value;
                              setModalDraft({ ...modalDraft, accent: newAccent });
                              // Try parsing on the fly so sliders update if manual input matches a gradient
                              const match = newAccent.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}),\s*(#[a-fA-F0-9]{6})\)/);
                              if (match) {
                                setGradientAngle(parseInt(match[1]) || 135);
                                setGradientColorA(match[2]);
                                setGradientColorB(match[3]);
                              }
                            }}
                            placeholder="linear-gradient(135deg, #00f2fe, #4facfe)"
                            className="flex-1 bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                          />
                        </div>
                      </div>

                      {/* Custom Gradient Builder Interface */}
                      <div className="bg-black/50 border border-border/40 p-4 rounded-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan">Dynamic Gradient Builder</span>
                          <span className="text-[9px] text-muted-foreground bg-white/5 border border-border px-2 py-0.5 rounded-full">
                            Active: {gradientAngle}° angle
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Color A (Start)</label>
                            <div className="flex gap-2 items-center bg-black/40 border border-border/60 hover:border-cyan/30 rounded-lg p-1.5 transition-all">
                              <div className="relative size-7 rounded border border-border bg-black/20 overflow-hidden flex items-center justify-center shrink-0">
                                <input 
                                  type="color" 
                                  value={gradientColorA} 
                                  onChange={(e) => {
                                    const colA = e.target.value;
                                    updateCustomGradient(colA, gradientColorB, gradientAngle);
                                  }}
                                  className="absolute inset-0 size-full cursor-pointer scale-150 opacity-100 border-0 p-0"
                                />
                              </div>
                              <input 
                                type="text"
                                value={gradientColorA}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val.startsWith("#") && val.length <= 7) {
                                    setGradientColorA(val);
                                    if (val.length === 7) {
                                      updateCustomGradient(val, gradientColorB, gradientAngle);
                                    }
                                  }
                                }}
                                className="w-full bg-transparent border-0 text-xs font-mono focus:outline-none text-foreground"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Color B (End)</label>
                            <div className="flex gap-2 items-center bg-black/40 border border-border/60 hover:border-cyan/30 rounded-lg p-1.5 transition-all">
                              <div className="relative size-7 rounded border border-border bg-black/20 overflow-hidden flex items-center justify-center shrink-0">
                                <input 
                                  type="color" 
                                  value={gradientColorB} 
                                  onChange={(e) => {
                                    const colB = e.target.value;
                                    updateCustomGradient(gradientColorA, colB, gradientAngle);
                                  }}
                                  className="absolute inset-0 size-full cursor-pointer scale-150 opacity-100 border-0 p-0"
                                />
                              </div>
                              <input 
                                type="text"
                                value={gradientColorB}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (val.startsWith("#") && val.length <= 7) {
                                    setGradientColorB(val);
                                    if (val.length === 7) {
                                      updateCustomGradient(gradientColorA, val, gradientAngle);
                                    }
                                  }
                                }}
                                className="w-full bg-transparent border-0 text-xs font-mono focus:outline-none text-foreground"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>Gradient Angle</span>
                            <span>{gradientAngle}°</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="360"
                            value={gradientAngle}
                            onChange={(e) => {
                              const angle = parseInt(e.target.value) || 0;
                              updateCustomGradient(gradientColorA, gradientColorB, angle);
                            }}
                            className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-cyan"
                          />
                        </div>
                      </div>

                      {/* Gradient Presets */}
                      <div>
                        <span className="block text-[9px] text-muted-foreground mb-2">Preset Cyber Gradients (Click to apply instantly):</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "Cyan-Blue", gradient: "linear-gradient(135deg, #00f2fe, #4facfe)" },
                            { name: "Magenta-Purple", gradient: "linear-gradient(135deg, #e100ff, #7f00ff)" },
                            { name: "Pink-Violet", gradient: "linear-gradient(135deg, #f107a3, #7b2ff7)" },
                            { name: "Teal-Emerald", gradient: "linear-gradient(135deg, #00b09b, #96c93d)" },
                            { name: "Sunset Orange", gradient: "linear-gradient(135deg, #ff5f6d, #ffc371)" },
                            { name: "Toxic Pink", gradient: "linear-gradient(135deg, #f857a6, #ff5858)" },
                            { name: "Cyber Gold", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
                            { name: "Neon Lime", gradient: "linear-gradient(135deg, #11998e, #38ef7d)" },
                            { name: "Crimson Blood", gradient: "linear-gradient(135deg, #ff0844, #ffb199)" }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => applyPresetGradient(preset.gradient)}
                              className="size-7 rounded-lg border border-border/80 hover:scale-110 hover:border-white transition-all cursor-pointer shadow-md"
                              style={{ background: preset.gradient }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  {/* Accent Preview Block */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Accent Color Preview</label>
                    <div 
                      className="h-9 rounded-lg border border-border/80 flex items-center justify-center text-[10px] text-black font-semibold font-sans tracking-wide transition-all shadow-[inset_0_1px_3px_rgba(255,255,255,0.15)]"
                      style={{ background: modalDraft.accent || "#000", color: modalDraft.accent?.includes("#fff") || modalDraft.accent === "white" ? "#000" : "#fff" }}
                    >
                      Active Accent Theme Rendering
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Repository URL</label>
                      <input 
                        type="text" 
                        value={modalDraft.repo_url || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, repo_url: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Live URL</label>
                      <input 
                        type="text" 
                        value={modalDraft.live_url || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, live_url: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Tech Stack Tags</label>
                    <p className="text-[9px] text-muted-foreground mb-2">Use commas to separate tools (e.g. React, Tailwind CSS, Fastify, Supabase)</p>
                    <input 
                      type="text" 
                      value={modalDraft.stack?.join(", ") || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, stack: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="e.g. React, Next.js, Node.js"
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                    />
                    
                    {/* Live Tech Badges Preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {modalDraft.stack && modalDraft.stack.filter((s: string) => s !== "").length > 0 ? (
                        modalDraft.stack.filter((s: string) => s !== "").map((s: string) => (
                          <span key={s} className="px-2.5 py-0.5 bg-white/5 border border-cyan/20 rounded text-[9px] text-cyan font-sans tracking-wide">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">No stack badges yet</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Project Logo</label>
                    <div className="flex items-center gap-4 bg-black/40 border border-border/80 p-3.5 rounded-xl">
                      {modalDraft.logo_url ? (
                        <img src={modalDraft.logo_url} alt="Logo" className="size-16 object-cover rounded border border-border/80 bg-black" />
                      ) : (
                        <div className="size-16 rounded border border-dashed border-border/60 bg-black flex items-center justify-center text-muted-foreground">
                          <Image className="size-6" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => triggerImageUpload(null, "logo_url", true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:text-cyan border border-border text-[10px] uppercase font-bold rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          <Upload className="size-3" /> Upload Logo
                        </button>
                        <p className="text-[9px] text-muted-foreground">Upload square image to secure Supabase Storage.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Project Description</label>
                    <textarea 
                      value={modalDraft.description || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, description: e.target.value })}
                      rows={5}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {activeTab === "builders" && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Builder Name</label>
                      <input 
                        type="text" 
                        value={modalDraft.name || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, name: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Categories (Multiple allowed)</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 border border-border rounded-lg max-h-[140px] overflow-y-auto">
                        {localCategories.map((cat) => {
                          const activeCategories = modalDraft.category 
                            ? modalDraft.category.split(",").map((c: string) => c.trim())
                            : [];
                          const isSelected = activeCategories.includes(cat.name);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                let newCats;
                                if (isSelected) {
                                  newCats = activeCategories.filter((c: string) => c !== cat.name);
                                } else {
                                  newCats = [...activeCategories, cat.name];
                                }
                                setModalDraft({ 
                                  ...modalDraft, 
                                  category: newCats.filter((c: string) => c !== "").join(", ") 
                                });
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-cyan/15 text-cyan border-cyan/40 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                  : "bg-black/40 text-muted-foreground border-border/80 hover:text-foreground hover:bg-white/5"
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Role / Title</label>
                      <input 
                        type="text" 
                        value={modalDraft.role || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, role: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Location</label>
                      <input 
                        type="text" 
                        value={modalDraft.location || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, location: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Tagline</label>
                      <input 
                        type="text" 
                        value={modalDraft.tagline || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, tagline: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Experience (Years)</label>
                      <input 
                        type="number" 
                        value={modalDraft.years_exp ?? 0} 
                        onChange={(e) => setModalDraft({ ...modalDraft, years_exp: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Dynamic HSL Hue Interactive Slider! */}
                  <div className="bg-black/30 border border-border/60 p-4 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground">Color Theme Hue: {modalDraft.hue ?? 0}°</label>
                        <p className="text-[9px] text-muted-foreground">Drag to dynamically rotate the profile gradient colors</p>
                      </div>
                      {/* Avatar Dynamic HSL Theme Preview Circle */}
                      <div 
                        className="size-10 rounded-full border border-black/85 shadow-md flex items-center justify-center font-bold text-sm text-black select-none shrink-0 transition-all duration-150"
                        style={{
                          background: `linear-gradient(135deg, hsl(${modalDraft.hue || 0}, 80%, 60%), hsl(${(modalDraft.hue || 0) + 60}, 80%, 40%))`,
                        }}
                      >
                        {modalDraft.name ? modalDraft.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="360"
                      value={modalDraft.hue ?? 0}
                      onChange={(e) => setModalDraft({ ...modalDraft, hue: parseInt(e.target.value) || 0 })}
                      className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-cyan"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Github Username</label>
                      <input 
                        type="text" 
                        value={modalDraft.github || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, github: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        value={modalDraft.email || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, email: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Personal Website</label>
                      <input 
                        type="text" 
                        value={modalDraft.website || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, website: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Avatar Image</label>
                    <div className="flex items-center gap-4 bg-black/40 border border-border/80 p-3.5 rounded-xl">
                      {modalDraft.avatar_url ? (
                        <img src={modalDraft.avatar_url} alt="Avatar" className="size-16 object-cover rounded-full border border-border/80 bg-black" />
                      ) : (
                        <div 
                          className="size-16 rounded-full border border-border/80 flex items-center justify-center font-bold text-lg text-black"
                          style={{
                            background: `linear-gradient(135deg, hsl(${modalDraft.hue || 0}, 80%, 60%), hsl(${(modalDraft.hue || 0) + 60}, 80%, 40%))`,
                          }}
                        >
                          {modalDraft.name ? modalDraft.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => triggerImageUpload(null, "avatar_url", true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:text-cyan border border-border text-[10px] uppercase font-bold rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          <Upload className="size-3" /> Upload Avatar
                        </button>
                        <p className="text-[9px] text-muted-foreground">Upload high-res profile photo to Supabase storage.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Skills Array</label>
                    <p className="text-[9px] text-muted-foreground mb-2">Use commas to separate skills (e.g. TypeScript, React, Docker, CI/CD, Python)</p>
                    <input 
                      type="text" 
                      value={modalDraft.skills?.join(", ") || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, skills: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="e.g. Next.js, Node.js, AWS"
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                    />
                    
                    {/* Live Skills Preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {modalDraft.skills && modalDraft.skills.filter((s: string) => s !== "").length > 0 ? (
                        modalDraft.skills.filter((s: string) => s !== "").map((s: string) => (
                          <span key={s} className="px-2.5 py-0.5 bg-white/5 border border-cyan/20 rounded text-[9px] text-cyan font-sans tracking-wide">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Fun Fact</label>
                    <input 
                      type="text" 
                      value={modalDraft.fun_fact || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, fun_fact: e.target.value })}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Biography</label>
                    <textarea 
                      value={modalDraft.bio || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, bio: e.target.value })}
                      rows={5}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {activeTab === "services" && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Service Name</label>
                      <input 
                        type="text" 
                        value={modalDraft.title || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, title: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Lucide Icon</label>
                      <select
                        value={modalDraft.icon || "Terminal"}
                        onChange={(e) => setModalDraft({ ...modalDraft, icon: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all cursor-pointer font-sans"
                      >
                        {LUCIDE_ICONS.map((ico) => (
                          <option key={ico} value={ico} className="bg-[#0c0d12]">
                            {ico}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
                    <textarea 
                      value={modalDraft.description || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, description: e.target.value })}
                      rows={5}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {activeTab === "categories" && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Category Name</label>
                    <input 
                      type="text" 
                      value={modalDraft.name || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, name: e.target.value })}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                    />
                  </div>
                </div>
              )}

              {activeTab === "achievements" && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Metric / Badge</label>
                      <input 
                        type="text" 
                        value={modalDraft.metric || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, metric: e.target.value })}
                        placeholder="e.g. 1st Place, 10+"
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Achievement Title</label>
                      <input 
                        type="text" 
                        value={modalDraft.title || ""} 
                        onChange={(e) => setModalDraft({ ...modalDraft, title: e.target.value })}
                        className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Certificate Image</label>
                    <div className="flex items-center gap-4 bg-black/40 border border-border/80 p-3.5 rounded-xl">
                      {modalDraft.image_url ? (
                        <img src={modalDraft.image_url} alt="Certificate" className="size-20 object-cover rounded border border-border/80 bg-black" />
                      ) : (
                        <div className="size-20 rounded border border-dashed border-border/60 bg-black flex items-center justify-center text-muted-foreground">
                          <Image className="size-6" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => triggerImageUpload(null, "image_url", true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:text-cyan border border-border text-[10px] uppercase font-bold rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          <Upload className="size-3" /> Upload Certificate
                        </button>
                        <p className="text-[9px] text-muted-foreground">Upload official trophy or certificate scan to Supabase storage.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Achievement Description</label>
                    <textarea 
                      value={modalDraft.description || ""} 
                      onChange={(e) => setModalDraft({ ...modalDraft, description: e.target.value })}
                      rows={5}
                      className="w-full bg-black/60 border border-border hover:border-cyan/40 focus:border-cyan rounded-lg px-3 py-2 text-xs text-foreground outline-none transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-card/40">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRowIndex(null);
                  setModalDraft(null);
                }}
                className="px-4 py-2 border border-border hover:bg-white/5 hover:text-foreground text-xs text-muted-foreground font-bold uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveModalChanges}
                className="px-4 py-2 bg-cyan text-black hover:bg-cyan/90 text-xs font-bold uppercase rounded-lg tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.15)] transition-all cursor-pointer"
              >
                Apply Changes
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
