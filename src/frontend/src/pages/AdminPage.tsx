import { Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Server } from "../types/server";
import { ALL_TAGS } from "../types/server";
import {
  addServer,
  deleteServer,
  getServers,
  updateServer,
} from "../utils/storage";

// ============================================================
// TO CHANGE ADMIN PASSWORD: Update the string "Admin1234" below
// ============================================================
const ADMIN_PASSWORD = "Admin1234";

// Default empty form state
const EMPTY_FORM = {
  name: "",
  ip: "",
  rating: 3,
  tags: [] as string[],
  imageUrl: "",
  customTag: "",
};

type FormState = typeof EMPTY_FORM;

// Clickable star selector for rating
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Password gate — runs immediately on mount
  useEffect(() => {
    // Prompt the user for the admin password
    const entered = window.prompt("Enter admin password:");

    // TO CHANGE ADMIN PASSWORD: Update the ADMIN_PASSWORD constant at the top of this file
    if (entered === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setServers(getServers());
    } else {
      // Wrong password or cancelled — redirect to homepage
      window.location.replace("/");
    }
  }, []);

  const refreshServers = useCallback(() => {
    setServers(getServers());
  }, []);

  // Open form for adding a new server
  const handleAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // Open form pre-filled for editing an existing server
  const handleEdit = (server: Server) => {
    setEditingId(server.id);
    setForm({
      name: server.name,
      ip: server.ip,
      rating: server.rating,
      tags: [...server.tags],
      imageUrl: server.imageUrl,
      customTag: "",
    });
    setShowForm(true);
  };

  // Delete a server after confirmation
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteServer(id);
      refreshServers();
    }
  };

  // Toggle a tag checkbox in the form
  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Add a custom tag from the input field
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

  // Save form — either add or update
  const handleSave = () => {
    if (!form.name.trim() || !form.ip.trim()) return;

    if (editingId) {
      updateServer({
        id: editingId,
        name: form.name.trim(),
        ip: form.ip.trim(),
        rating: form.rating,
        tags: form.tags,
        imageUrl: form.imageUrl.trim(),
        createdAt:
          servers.find((s) => s.id === editingId)?.createdAt ??
          new Date().toISOString(),
      });
    } else {
      addServer({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        ip: form.ip.trim(),
        rating: form.rating,
        tags: form.tags,
        imageUrl: form.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    refreshServers();
  };

  // Don't render anything until authentication is resolved
  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <a
            href="/"
            data-ocid="admin.nav.link"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Public Site
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Add server button */}
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

        {/* ===== ADD / EDIT FORM ===== */}
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
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary"
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
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary"
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
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none input-glow focus:border-primary"
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
                {/* Custom tag */}
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
                {/* Show selected custom/extra tags */}
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

            {/* Form actions */}
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
                disabled={!form.name.trim() || !form.ip.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editingId ? "SAVE CHANGES" : "ADD SERVER"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== SERVER LIST TABLE ===== */}
        {servers.length === 0 ? (
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
                {/* Thumbnail */}
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

                {/* Info */}
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

                {/* Actions */}
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
      </main>
    </div>
  );
}
