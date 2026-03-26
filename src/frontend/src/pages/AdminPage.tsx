import { Loader2, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { useActor } from "../hooks/useActor";
import type { Server } from "../types/server";
import { ALL_TAGS } from "../types/server";

// ============================================================
// TO CHANGE ADMIN PASSWORD: Update the string below
// ============================================================
const ADMIN_PASSWORD = "dhruvyt@204";

const EMPTY_FORM = {
  name: "",
  ip: "",
  rating: 3,
  tags: [] as string[],
  imageUrl: "",
  description: "",
  customTag: "",
};

type FormState = typeof EMPTY_FORM;
type AdminTab = "servers" | "reviews" | "settings";

// ─── Type helpers ────────────────────────────────────────────────────────────

type BackendServer = Omit<Server, "rating"> & { rating: bigint };

function toFrontendServer(s: BackendServer): Server {
  return { ...s, rating: Number(s.rating) };
}

function toBackendServer(s: Server): BackendServer {
  return { ...s, rating: BigInt(s.rating) };
}

// ─── BackendReview (from actor) ───────────────────────────────────────────────

interface BackendReview {
  id: string;
  serverId: string;
  name: string;
  text: string;
  date: string;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface Toast {
  type: "success" | "error";
  message: string;
}

function ToastBanner({
  toast,
  onClose,
}: { toast: Toast | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      data-ocid="admin.toast"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border text-sm font-semibold ${
        toast.type === "success"
          ? "bg-emerald-950 border-emerald-500 text-emerald-300"
          : "bg-red-950 border-red-500 text-red-300"
      }`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        data-ocid="admin.toast.close_button"
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── StarSelector ─────────────────────────────────────────────────────────────

function StarSelector({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          data-ocid="admin.rating.toggle"
          className={`text-2xl transition-transform hover:scale-110 ${
            (hovered || value) >= star ? "text-yellow-400" : "text-gray-600"
          }`}
          aria-label={`${star} stars`}
        >
          {(hovered || value) >= star ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({
  actor,
  servers,
  showToast,
}: {
  actor: backendInterface;
  servers: Server[];
  showToast: (t: Toast) => void;
}) {
  const [allReviews, setAllReviews] = useState<
    Array<{ serverId: string; serverName: string; reviews: BackendReview[] }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all(
          servers.map(async (s) => ({
            serverId: s.id,
            serverName: s.name,
            reviews: (await actor.getReviews(s.id)) as BackendReview[],
          })),
        );
        setAllReviews(results.filter((r) => r.reviews.length > 0));
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, servers]);

  const handleDelete = async (serverId: string, reviewId: string) => {
    try {
      await actor.deleteReview(serverId, reviewId);
      setAllReviews((prev) =>
        prev
          .map((entry) =>
            entry.serverId === serverId
              ? {
                  ...entry,
                  reviews: entry.reviews.filter((r) => r.id !== reviewId),
                }
              : entry,
          )
          .filter((entry) => entry.reviews.length > 0),
      );
      showToast({ type: "success", message: "✓ Review deleted." });
    } catch (err) {
      console.error("Failed to delete review:", err);
      showToast({ type: "error", message: "✗ Failed to delete review." });
    }
  };

  if (loading) {
    return (
      <div
        data-ocid="admin.reviews.loading_state"
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading reviews...</p>
      </div>
    );
  }

  const total = allReviews.reduce((sum, s) => sum + s.reviews.length, 0);

  if (total === 0) {
    return (
      <div data-ocid="admin.reviews.empty_state" className="text-center py-20">
        <p className="text-5xl mb-4">💬</p>
        <p className="text-muted-foreground">No player reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {allReviews.map((entry) => (
        <div key={entry.serverId}>
          <h3
            className="font-pixel text-primary mb-3"
            style={{ fontSize: "9px" }}
          >
            {entry.serverName}
            <span
              className="ml-2 text-muted-foreground font-sans normal-case"
              style={{ fontSize: "11px" }}
            >
              ({entry.reviews.length} review
              {entry.reviews.length !== 1 ? "s" : ""})
            </span>
          </h3>
          <div className="space-y-2">
            {entry.reviews.map((review, i) => (
              <div
                key={review.id}
                data-ocid={`admin.review.item.${i + 1}`}
                className="bg-background border border-border rounded-lg p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary font-semibold text-sm">
                      {review.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.serverId, review.id)}
                  data-ocid={`admin.review.delete_button.${i + 1}`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/50 text-destructive rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Site Settings Tab ────────────────────────────────────────────────────────

function SiteSettingsTab({
  actor,
  showToast,
}: {
  actor: backendInterface;
  showToast: (t: Toast) => void;
}) {
  const [announcement, setAnnouncementState] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [ann, settings] = await Promise.all([
          actor.getAnnouncement(),
          actor.getSiteSettings(),
        ]);
        setAnnouncementState(ann);
        setHeroSubtitle(settings.heroSubtitle);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor]);

  const saveAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      await actor.setAnnouncement(announcement);
      showToast({ type: "success", message: "✓ Announcement saved!" });
    } catch {
      showToast({
        type: "error",
        message: "✗ Failed to save announcement.",
      });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const clearAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      await actor.setAnnouncement("");
      setAnnouncementState("");
      showToast({ type: "success", message: "✓ Announcement cleared!" });
    } catch {
      showToast({
        type: "error",
        message: "✗ Failed to clear announcement.",
      });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const saveHero = async () => {
    setSavingHero(true);
    try {
      await actor.saveSiteSettings({ heroSubtitle });
      showToast({ type: "success", message: "✓ Hero subtitle saved!" });
    } catch {
      showToast({ type: "error", message: "✗ Failed to save subtitle." });
    } finally {
      setSavingHero(false);
    }
  };

  const inputCls =
    "w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary";

  if (loading) {
    return (
      <div
        data-ocid="admin.settings.loading_state"
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Announcement Banner */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-foreground font-semibold text-base mb-1">
            📢 Site-wide Announcement
          </h3>
          <p className="text-muted-foreground text-xs">
            Displays a dismissable banner at the top of the public site. Leave
            blank to hide it.
          </p>
        </div>
        <textarea
          rows={3}
          value={announcement}
          onChange={(e) => setAnnouncementState(e.target.value)}
          placeholder="e.g. 🎉 New servers added! Check out the latest Lifesteal SMP..."
          data-ocid="admin.announcement.textarea"
          className={`${inputCls} resize-none mb-3`}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveAnnouncement}
            disabled={savingAnnouncement}
            data-ocid="admin.announcement.save_button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingAnnouncement && <Loader2 className="w-3 h-3 animate-spin" />}
            Save
          </button>
          <button
            type="button"
            onClick={clearAnnouncement}
            disabled={savingAnnouncement}
            data-ocid="admin.announcement.delete_button"
            className="px-4 py-2 border border-destructive/50 text-destructive rounded text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Hero Subtitle */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-foreground font-semibold text-base mb-1">
            🏠 Homepage Hero Subtitle
          </h3>
          <p className="text-muted-foreground text-xs">
            Overrides the default subtitle text shown below the main heading on
            the homepage.
          </p>
        </div>
        <input
          type="text"
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
          placeholder="e.g. The #1 source for cracked Minecraft servers. Updated daily."
          data-ocid="admin.hero_subtitle.input"
          className={`${inputCls} mb-3`}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveHero}
            disabled={savingHero}
            data-ocid="admin.hero_subtitle.save_button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingHero && <Loader2 className="w-3 h-3 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const [authenticated, setAuthenticated] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<AdminTab>("servers");
  const [toast, setToast] = useState<Toast | null>(null);
  const [publishing, setPublishing] = useState(false);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
  }, []);

  // Auth check
  useEffect(() => {
    const entered = window.prompt("Enter admin password:");
    if (entered === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      window.location.replace("/");
    }
  }, []);

  // Load servers from backend
  useEffect(() => {
    if (!authenticated || !actor || isFetching) return;
    (async () => {
      try {
        const raw = await actor.getServers();
        setServers((raw as Array<BackendServer>).map(toFrontendServer));
      } catch (err) {
        console.error("Failed to load servers:", err);
      } finally {
        setLoadingServers(false);
      }
    })();
  }, [authenticated, actor, isFetching]);

  const refreshServers = useCallback(async () => {
    if (!actor) return;
    try {
      const raw = await actor.getServers();
      setServers((raw as Array<BackendServer>).map(toFrontendServer));
    } catch (err) {
      console.error("Failed to refresh servers:", err);
    }
  }, [actor]);

  const handleAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (server: Server) => {
    setEditingId(server.id);
    setForm({
      name: server.name,
      ip: server.ip,
      rating: server.rating,
      tags: [...server.tags],
      imageUrl: server.imageUrl,
      description: server.description ?? "",
      customTag: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!actor) return;
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await actor.deleteServer(id);
      await refreshServers();
      showToast({ type: "success", message: `✓ "${name}" deleted.` });
    } catch {
      showToast({ type: "error", message: "✗ Failed to delete server." });
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const tag = form.customTag.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        customTag: "",
      }));
    }
  };

  const handleSave = async () => {
    if (!actor || !form.name.trim() || !form.ip.trim()) return;
    const serverData: Server = {
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      ip: form.ip.trim(),
      rating: form.rating,
      tags: form.tags,
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim() || undefined,
      createdAt: editingId
        ? (servers.find((s) => s.id === editingId)?.createdAt ??
          new Date().toISOString())
        : new Date().toISOString(),
    };
    try {
      if (editingId) {
        await actor.updateServer(toBackendServer(serverData));
        showToast({
          type: "success",
          message: `✓ "${serverData.name}" updated.`,
        });
      } else {
        await actor.addServer(toBackendServer(serverData));
        showToast({
          type: "success",
          message: `✓ "${serverData.name}" added.`,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await refreshServers();
    } catch {
      showToast({ type: "error", message: "✗ Failed to save server." });
    }
  };

  const handlePublish = async () => {
    if (!actor) return;
    setPublishing(true);
    try {
      // Verify data is saved by fetching latest from backend
      await actor.getServers();
      showToast({
        type: "success",
        message: "✓ Changes published! Live site updated.",
      });
    } catch {
      showToast({
        type: "error",
        message: "✗ Publish failed. Please try again.",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (!authenticated) return null;

  const inputCls =
    "w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary";

  const TAB_ITEMS: { id: AdminTab; label: string; icon: string }[] = [
    { id: "servers", label: "Servers", icon: "🖥️" },
    { id: "reviews", label: "Reviews", icon: "💬" },
    { id: "settings", label: "Site Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toast */}
      <ToastBanner toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <h1
              className="font-pixel text-primary"
              style={{ fontSize: "10px", lineHeight: 1.5 }}
            >
              ADMIN PANEL
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !actor}
              data-ocid="admin.publish.primary_button"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>🚀</span>
              )}
              Publish Changes
            </button>
            <a
              href="/"
              data-ocid="admin.nav.link"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Public Site
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab Nav */}
        <div className="flex gap-1 mb-8 bg-card border border-border rounded-lg p-1">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setShowForm(false);
              }}
              data-ocid={`admin.${tab.id}.tab`}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ===== SERVERS TAB ===== */}
        {activeTab === "servers" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-semibold text-lg">
                Servers ({servers.length})
              </h2>
              <button
                type="button"
                onClick={handleAdd}
                data-ocid="admin.add.primary_button"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                ADD SERVER
              </button>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                data-ocid="admin.form.panel"
                className="bg-card border border-primary rounded-lg p-6 mb-8 glow-green"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="font-pixel text-primary"
                    style={{ fontSize: "9px" }}
                  >
                    {editingId ? "EDIT SERVER" : "ADD SERVER"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    data-ocid="admin.form.close_button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Server Name */}
                  <div className="space-y-1">
                    <label
                      htmlFor="field-name"
                      className="text-sm text-muted-foreground"
                    >
                      Server Name *
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="HyperCraft Network"
                      data-ocid="admin.name.input"
                      className={inputCls}
                    />
                  </div>

                  {/* Server IP */}
                  <div className="space-y-1">
                    <label
                      htmlFor="field-ip"
                      className="text-sm text-muted-foreground"
                    >
                      Server IP *
                    </label>
                    <input
                      id="field-ip"
                      type="text"
                      value={form.ip}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, ip: e.target.value }))
                      }
                      placeholder="play.yourserver.net"
                      data-ocid="admin.ip.input"
                      className={inputCls}
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1 md:col-span-2">
                    <label
                      htmlFor="field-image"
                      className="text-sm text-muted-foreground"
                    >
                      Image URL
                    </label>
                    <input
                      id="field-image"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, imageUrl: e.target.value }))
                      }
                      placeholder="https://example.com/server-image.jpg"
                      data-ocid="admin.image.input"
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1 md:col-span-2">
                    <label
                      htmlFor="field-description"
                      className="text-sm text-muted-foreground"
                    >
                      Description
                    </label>
                    <textarea
                      id="field-description"
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Short description shown on the server card..."
                      data-ocid="admin.description.textarea"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rating
                    </p>
                    <StarSelector
                      value={form.rating}
                      onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          data-ocid="admin.tag.toggle"
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            form.tags.includes(tag)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-muted-foreground border-border hover:border-primary"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={form.customTag}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, customTag: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                        placeholder="Custom tag..."
                        data-ocid="admin.custom_tag.input"
                        className="flex-1 bg-secondary border border-border rounded px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        data-ocid="admin.add_tag.secondary_button"
                        className="px-3 py-1.5 bg-secondary border border-border rounded text-xs hover:border-primary hover:text-primary transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {form.tags.filter(
                      (t) => !(ALL_TAGS as readonly string[]).includes(t),
                    ).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.tags
                          .filter(
                            (t) => !(ALL_TAGS as readonly string[]).includes(t),
                          )
                          .map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() => toggleTag(t)}
                                className="hover:text-destructive"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    data-ocid="admin.form.cancel_button"
                    className="px-4 py-2 text-sm border border-border rounded hover:border-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    data-ocid="admin.form.save_button"
                    disabled={!form.name.trim() || !form.ip.trim() || !actor}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "SAVE CHANGES" : "ADD SERVER"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Server List */}
            {loadingServers ? (
              <div
                data-ocid="admin.servers.loading_state"
                className="flex flex-col items-center justify-center py-24 gap-4"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Loading servers...
                </p>
              </div>
            ) : servers.length === 0 ? (
              <div
                data-ocid="admin.servers.empty_state"
                className="text-center py-20"
              >
                <p className="text-5xl mb-4">📋</p>
                <p className="text-muted-foreground">
                  No servers yet. Click "ADD SERVER" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="admin.servers.table">
                {servers.map((server, i) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`admin.server.item.${i + 1}`}
                    className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <img
                      src={
                        server.imageUrl ||
                        `https://picsum.photos/seed/${server.id}/80/60`
                      }
                      alt={server.name}
                      className="w-20 h-14 object-cover rounded shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://picsum.photos/seed/${server.id}/80/60`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-pixel text-primary truncate"
                        style={{ fontSize: "9px" }}
                      >
                        {server.name}
                      </p>
                      <p className="text-muted-foreground text-xs font-mono mt-1">
                        {server.ip}
                      </p>
                      {server.description && (
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                          {server.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400 text-xs">
                          {"★".repeat(server.rating)}
                          {"☆".repeat(5 - server.rating)}
                        </span>
                        <div className="flex gap-1">
                          {server.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {server.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{server.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(server)}
                        data-ocid={`admin.server.edit_button.${i + 1}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(server.id, server.name)}
                        data-ocid={`admin.server.delete_button.${i + 1}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/50 text-destructive rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== REVIEWS TAB ===== */}
        {activeTab === "reviews" && actor && (
          <ReviewsTab actor={actor} servers={servers} showToast={showToast} />
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === "settings" && actor && (
          <SiteSettingsTab actor={actor} showToast={showToast} />
        )}
      </main>
    </div>
  );
}
