import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import type {
  Review,
  Server,
  SiteSettings,
  UserSubmission,
} from "@/types/server";
import {
  CheckCircle,
  Edit,
  Loader2,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// TO CHANGE ADMIN PASSWORD — change the value below:
const ADMIN_PASSWORD = "dhruvyt@204";

const EMPTY_FORM = {
  id: "",
  name: "",
  ip: "",
  tags: "",
  rating: "4",
  description: "",
  ytVideoUrl: "",
  website: "",
  discordUrl: "",
  version: "",
  maxPlayers: "",
  location: "",
  gameMode: "",
  status: "Unknown" as string,
  createdAt: "",
  imageUrl: "",
  featured: false,
  serverType: "" as string,
};

type FormState = typeof EMPTY_FORM;

function opt(val: string): [] | [string] {
  return val.trim() ? [val.trim()] : [];
}

function optBigInt(val: string): [] | [bigint] {
  const n = Number.parseInt(val, 10);
  return Number.isFinite(n) ? [BigInt(n)] : [];
}

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  // Servers tab
  const [servers, setServers] = useState<Server[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);

  // Submissions tab
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Reviews tab
  const [reviewsByServer, setReviewsByServer] = useState<
    Record<string, Review[]>
  >({});
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Site Settings tab
  const [announcement, setAnnouncement] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [submissionsEnabled, setSubmissionsEnabled] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const loadServers = useCallback(async () => {
    if (!actor) return;
    setServersLoading(true);
    try {
      const s = (await actor.getServers()) as unknown as Server[];
      setServers(s);
    } catch (e: any) {
      toast.error(`Failed to load servers: ${e?.message ?? e}`);
    } finally {
      setServersLoading(false);
    }
  }, [actor]);

  const loadSubmissions = useCallback(async () => {
    if (!actor) return;
    setSubmissionsLoading(true);
    try {
      const subs = await (actor as any).getPendingSubmissions();
      setSubmissions(subs);
    } catch (e: any) {
      toast.error(`Failed to load submissions: ${e?.message ?? e}`);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [actor]);

  const loadReviews = useCallback(async () => {
    if (!actor) return;
    setReviewsLoading(true);
    try {
      const s = (await actor.getServers()) as unknown as Server[];
      const entries = await Promise.all(
        s.map(async (sv) => {
          const reviews = await actor.getReviews(sv.id);
          return [sv.id, reviews] as [string, Review[]];
        }),
      );
      const map: Record<string, Review[]> = {};
      for (const [sid, reviews] of entries) map[sid] = reviews;
      setReviewsByServer(map);
      setServers(s);
    } catch (e: any) {
      toast.error(`Failed to load reviews: ${e?.message ?? e}`);
    } finally {
      setReviewsLoading(false);
    }
  }, [actor]);

  const loadSettings = useCallback(async () => {
    if (!actor) return;
    try {
      const [ann, settings, enabled] = await Promise.all([
        actor.getAnnouncement(),
        actor.getSiteSettings(),
        (actor as any).getSubmissionsEnabled(),
      ]);
      setAnnouncement(ann);
      setHeroSubtitle(settings.heroSubtitle);
      setSubmissionsEnabled(enabled);
    } catch {
      // silent
    }
  }, [actor]);

  useEffect(() => {
    if (authed && actor && !isFetching) {
      loadServers();
      loadSettings();
    }
  }, [authed, actor, isFetching, loadServers, loadSettings]);

  const handleLookup = async () => {
    if (!form.ip.trim()) return;
    setLookingUp(true);
    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${form.ip.trim()}`);
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        name: data.hostname || data.ip || prev.name,
        version: data.version || prev.version,
        maxPlayers:
          data.players?.max != null
            ? String(data.players.max)
            : prev.maxPlayers,
        status: data.online ? "Online" : "Offline",
      }));
      toast.success("Server info loaded!");
    } catch {
      toast.error("Lookup failed. Check IP and try again.");
    } finally {
      setLookingUp(false);
    }
  };

  const openAddForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (server: Server) => {
    setForm({
      id: server.id,
      name: server.name,
      ip: server.ip,
      tags: server.tags.join(", "),
      rating: String(Number(server.rating)),
      description: server.description[0] ?? "",
      ytVideoUrl: server.ytVideoUrl[0] ?? "",
      website: server.website[0] ?? "",
      discordUrl: server.discordUrl[0] ?? "",
      version: server.version[0] ?? "",
      maxPlayers:
        server.maxPlayers[0] != null
          ? String(Number(server.maxPlayers[0]))
          : "",
      location: server.location[0] ?? "",
      gameMode: server.gameMode[0] ?? "",
      status: server.status[0] ?? "Unknown",
      createdAt: server.createdAt,
      imageUrl: server.imageUrl ?? "",
      featured: server.featured ?? false,
      serverType: server.serverType ?? "",
    });
    setEditingId(server.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!actor || !form.ip.trim() || !form.name.trim()) {
      toast.error("Name and IP are required.");
      return;
    }
    if (!form.serverType) {
      toast.error("Server Type is required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !editingId;
      const server: Server = {
        id: editingId || Date.now().toString(),
        ip: form.ip.trim(),
        name: form.name.trim(),
        createdAt: isNew
          ? new Date().toISOString()
          : form.createdAt || new Date().toISOString(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        description: opt(form.description),
        imageUrl: form.imageUrl.trim(),
        rating: BigInt(Number.parseInt(form.rating, 10) || 4),
        ytVideoUrl: opt(form.ytVideoUrl),
        website: opt(form.website),
        discordUrl: opt(form.discordUrl),
        version: opt(form.version),
        maxPlayers: optBigInt(form.maxPlayers),
        location: opt(form.location),
        gameMode: opt(form.gameMode),
        status: opt(form.status),
        featured: form.featured,
        serverType: form.serverType,
      };
      if (isNew) {
        await actor.addServer(server);
        toast.success("Server saved successfully!");
      } else {
        await actor.updateServer(server);
        toast.success("Server saved successfully!");
      }
      setShowForm(false);
      setEditingId(null);
      loadServers();
    } catch (e: any) {
      toast.error(`Failed to save server: ${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    if (!confirm("Delete this server?")) return;
    try {
      await actor.deleteServer(id);
      toast.success("Server deleted.");
      loadServers();
    } catch (e: any) {
      toast.error(`Failed to delete: ${e?.message ?? e}`);
    }
  };

  const handleApproveSubmission = async (id: string) => {
    if (!actor) return;
    try {
      await (actor as any).approveSubmission(id);
      toast.success("Submission approved!");
      await Promise.all([loadSubmissions(), loadServers()]);
    } catch (e: any) {
      toast.error(`Failed to approve: ${e?.message ?? e}`);
    }
  };

  const handleRejectSubmission = async (id: string) => {
    if (!actor) return;
    try {
      await (actor as any).rejectSubmission(id);
      toast.success("Submission rejected.");
      loadSubmissions();
    } catch (e: any) {
      toast.error(`Failed to reject: ${e?.message ?? e}`);
    }
  };

  const handleDeleteReview = async (serverId: string, reviewId: string) => {
    if (!actor) return;
    try {
      await actor.deleteReview(serverId, reviewId);
      toast.success("Review deleted.");
      loadReviews();
    } catch (e: any) {
      toast.error(`Failed to delete review: ${e?.message ?? e}`);
    }
  };

  const handleSaveSettings = async () => {
    if (!actor) return;
    setSettingsSaving(true);
    try {
      await Promise.all([
        actor.setAnnouncement(announcement),
        actor.saveSiteSettings({ heroSubtitle }),
        (actor as any).setSubmissionsEnabled(submissionsEnabled),
      ]);
      toast.success("Settings saved and published!");
    } catch (e: any) {
      toast.error(`Failed to save settings: ${e?.message ?? e}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!actor) return;
    try {
      await Promise.all([
        actor.setAnnouncement(announcement),
        actor.saveSiteSettings({ heroSubtitle }),
        (actor as any).setSubmissionsEnabled(submissionsEnabled),
      ]);
      toast.success(
        "Changes published! Users will see updates within 30 seconds.",
      );
    } catch (e: any) {
      toast.error(`Publish failed: ${e?.message ?? e}`);
    }
  };

  // Login screen
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.07 0.008 280)" }}
      >
        <Card
          className="w-full max-w-sm bg-card border-border"
          data-ocid="admin.login_modal"
        >
          <CardHeader className="text-center">
            <CardTitle
              className="text-xl"
              style={{ color: "oklch(0.88 0.22 158)" }}
            >
              ⚔ Admin Panel
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">MINE lister</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              data-ocid="admin.password_input"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-secondary/50"
            />
            {authError && (
              <p
                data-ocid="admin.login_error_state"
                className="text-destructive text-xs"
              >
                {authError}
              </p>
            )}
            <Button
              data-ocid="admin.login_button"
              className="w-full"
              onClick={handleLogin}
              style={{
                background: "oklch(0.88 0.22 158 / 0.15)",
                color: "oklch(0.88 0.22 158)",
                border: "1px solid oklch(0.88 0.22 158 / 0.4)",
              }}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.07 0.008 280)" }}
    >
      {/* Admin Header */}
      <header
        className="border-b border-border px-4 py-3 flex items-center justify-between"
        style={{ background: "oklch(0.10 0.01 270)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ color: "oklch(0.88 0.22 158)" }}>
            ⚔ MINE lister Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="admin.publish_button"
            size="sm"
            onClick={handlePublish}
            style={{
              background: "oklch(0.88 0.22 158 / 0.15)",
              color: "oklch(0.88 0.22 158)",
              border: "1px solid oklch(0.88 0.22 158 / 0.4)",
            }}
          >
            <Save className="w-3.5 h-3.5 mr-1" /> Publish Changes
          </Button>
          <Button
            data-ocid="admin.logout_button"
            size="sm"
            variant="outline"
            onClick={() => setAuthed(false)}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="servers">
          <TabsList className="mb-6">
            <TabsTrigger data-ocid="admin.servers_tab" value="servers">
              Servers
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.submissions_tab"
              value="submissions"
              onClick={loadSubmissions}
            >
              Submissions
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.reviews_tab"
              value="reviews"
              onClick={loadReviews}
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger data-ocid="admin.settings_tab" value="settings">
              Site Settings
            </TabsTrigger>
          </TabsList>

          {/* SERVERS TAB */}
          <TabsContent value="servers">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-foreground">
                {servers.length} Servers
              </h2>
              <Button
                data-ocid="admin.add_server_button"
                size="sm"
                onClick={openAddForm}
                style={{
                  background: "oklch(0.88 0.22 158 / 0.15)",
                  color: "oklch(0.88 0.22 158)",
                  border: "1px solid oklch(0.88 0.22 158 / 0.4)",
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Server
              </Button>
            </div>

            {/* Server Form */}
            {showForm && (
              <Card
                className="bg-card border-border mb-6"
                data-ocid="admin.server_form"
              >
                <CardHeader>
                  <CardTitle className="text-base">
                    {editingId ? "Edit Server" : "Add Server"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">
                        Server Name *
                      </Label>
                      <Input
                        data-ocid="admin.server_name_input"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="My Cracked Server"
                        className="bg-secondary/50 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Server IP *</Label>
                      <div className="flex gap-2">
                        <Input
                          data-ocid="admin.server_ip_input"
                          value={form.ip}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, ip: e.target.value }))
                          }
                          placeholder="play.server.net"
                          className="bg-secondary/50 h-9 text-sm font-mono flex-1"
                        />
                        <Button
                          data-ocid="admin.server_lookup_button"
                          size="sm"
                          variant="outline"
                          className="h-9 px-3 text-xs"
                          onClick={handleLookup}
                          disabled={lookingUp || !form.ip.trim()}
                        >
                          {lookingUp ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Search className="w-3 h-3" />
                          )}
                          {lookingUp ? "" : " Lookup"}
                        </Button>
                      </div>
                    </div>

                    {/* Server Type - mandatory */}
                    <div>
                      <Label className="text-xs mb-1 block">
                        Server Type *
                      </Label>
                      <Select
                        value={form.serverType}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, serverType: v }))
                        }
                      >
                        <SelectTrigger
                          data-ocid="admin.server_type_select"
                          className="bg-secondary/50 h-9 text-sm"
                        >
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Cracked">Cracked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">Rating (1-5)</Label>
                      <Input
                        data-ocid="admin.server_rating_input"
                        type="number"
                        min="1"
                        max="5"
                        value={form.rating}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, rating: e.target.value }))
                        }
                        className="bg-secondary/50 h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">
                        Tags (comma-separated)
                      </Label>
                      <Input
                        data-ocid="admin.server_tags_input"
                        value={form.tags}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, tags: e.target.value }))
                        }
                        placeholder="PVP, Survival, Factions"
                        className="bg-secondary/50 h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">
                        Image / Logo URL (optional)
                      </Label>
                      <Input
                        data-ocid="admin.server_image_input"
                        value={form.imageUrl}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, imageUrl: e.target.value }))
                        }
                        placeholder="https://example.com/logo.png"
                        className="bg-secondary/50 h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Featured checkbox */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="featured-checkbox"
                      data-ocid="admin.server_featured_checkbox"
                      checked={form.featured}
                      onCheckedChange={(checked) =>
                        setForm((p) => ({ ...p, featured: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="featured-checkbox"
                      className="text-xs cursor-pointer select-none"
                    >
                      ★ Featured / Paid Slot
                    </Label>
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Description</Label>
                    <Textarea
                      data-ocid="admin.server_description_textarea"
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Describe the server..."
                      className="bg-secondary/50 text-sm resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">
                      YouTube Video URL (optional)
                    </Label>
                    <Input
                      data-ocid="admin.server_yt_input"
                      value={form.ytVideoUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, ytVideoUrl: e.target.value }))
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="bg-secondary/50 h-9 text-sm"
                    />
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                      ▶ Server Details (optional fields)
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs mb-1 block">
                          Website URL
                        </Label>
                        <Input
                          data-ocid="admin.server_website_input"
                          value={form.website}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, website: e.target.value }))
                          }
                          placeholder="https://server.net"
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          Discord URL
                        </Label>
                        <Input
                          data-ocid="admin.server_discord_input"
                          value={form.discordUrl}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              discordUrl: e.target.value,
                            }))
                          }
                          placeholder="https://discord.gg/..."
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          Minecraft Version
                        </Label>
                        <Input
                          data-ocid="admin.server_version_input"
                          value={form.version}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, version: e.target.value }))
                          }
                          placeholder="1.8 - 1.20"
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">
                          Max Players
                        </Label>
                        <Input
                          data-ocid="admin.server_maxplayers_input"
                          type="number"
                          value={form.maxPlayers}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              maxPlayers: e.target.value,
                            }))
                          }
                          placeholder="100"
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Location</Label>
                        <Input
                          data-ocid="admin.server_location_input"
                          value={form.location}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, location: e.target.value }))
                          }
                          placeholder="US, EU, Asia..."
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Game Mode</Label>
                        <Input
                          data-ocid="admin.server_gamemode_input"
                          value={form.gameMode}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, gameMode: e.target.value }))
                          }
                          placeholder="Survival, PvP, Factions..."
                          className="bg-secondary/50 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Status</Label>
                        <Select
                          value={form.status}
                          onValueChange={(v) =>
                            setForm((p) => ({ ...p, status: v }))
                          }
                        >
                          <SelectTrigger
                            data-ocid="admin.server_status_select"
                            className="bg-secondary/50 h-9 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Offline">Offline</SelectItem>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </details>

                  <div className="flex gap-2 pt-2">
                    <Button
                      data-ocid="admin.server_save_button"
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        background: "oklch(0.88 0.22 158 / 0.15)",
                        color: "oklch(0.88 0.22 158)",
                        border: "1px solid oklch(0.88 0.22 158 / 0.4)",
                      }}
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {saving ? "Saving..." : "Save Server"}
                    </Button>
                    <Button
                      data-ocid="admin.server_cancel_button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Server List */}
            {serversLoading ? (
              <div
                data-ocid="admin.servers_loading_state"
                className="text-center py-10 text-muted-foreground"
              >
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />{" "}
                Loading servers...
              </div>
            ) : servers.length === 0 ? (
              <div
                data-ocid="admin.servers_empty_state"
                className="text-center py-10 text-muted-foreground"
              >
                No servers yet.
              </div>
            ) : (
              <div className="space-y-2">
                {servers.map((server, i) => (
                  <Card
                    key={server.id}
                    data-ocid={`admin.servers.item.${i + 1}`}
                    className="bg-card border-border"
                  >
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {server.featured && (
                            <span className="text-yellow-400 text-xs">★</span>
                          )}
                          <p className="font-medium text-sm text-foreground truncate">
                            {server.name}
                          </p>
                          {server.serverType && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded border"
                              style={
                                server.serverType === "Premium"
                                  ? {
                                      background: "oklch(0.82 0.16 205 / 0.15)",
                                      color: "oklch(0.82 0.16 205)",
                                      borderColor: "oklch(0.82 0.16 205 / 0.4)",
                                    }
                                  : {
                                      background: "oklch(0.88 0.22 158 / 0.15)",
                                      color: "oklch(0.88 0.22 158)",
                                      borderColor: "oklch(0.88 0.22 158 / 0.4)",
                                    }
                              }
                            >
                              {server.serverType}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {server.ip}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          data-ocid={`admin.servers.edit_button.${i + 1}`}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => openEditForm(server)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`admin.servers.delete_button.${i + 1}`}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(server.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SUBMISSIONS TAB */}
          <TabsContent value="submissions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-foreground">
                Pending Submissions
              </h2>
              <Button
                data-ocid="admin.refresh_submissions_button"
                size="sm"
                variant="outline"
                onClick={loadSubmissions}
                disabled={submissionsLoading}
              >
                {submissionsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
            {submissionsLoading ? (
              <div
                data-ocid="admin.submissions_loading_state"
                className="text-center py-10 text-muted-foreground"
              >
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading submissions...
              </div>
            ) : submissions.length === 0 ? (
              <div
                data-ocid="admin.submissions_empty_state"
                className="text-center py-10 text-muted-foreground"
              >
                No pending submissions.
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub, i) => (
                  <Card
                    key={sub.id}
                    data-ocid={`admin.submissions.item.${i + 1}`}
                    className="bg-card border-border"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-sm text-foreground">
                              {sub.name}
                            </p>
                            {sub.serverType && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded border"
                                style={
                                  sub.serverType === "Premium"
                                    ? {
                                        background:
                                          "oklch(0.82 0.16 205 / 0.15)",
                                        color: "oklch(0.82 0.16 205)",
                                        borderColor:
                                          "oklch(0.82 0.16 205 / 0.4)",
                                      }
                                    : {
                                        background:
                                          "oklch(0.88 0.22 158 / 0.15)",
                                        color: "oklch(0.88 0.22 158)",
                                        borderColor:
                                          "oklch(0.88 0.22 158 / 0.4)",
                                      }
                                }
                              >
                                {sub.serverType}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-muted-foreground mb-1">
                            {sub.ip}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-1">
                            {sub.version && <span>v{sub.version}</span>}
                            {sub.gameMode && <span>• {sub.gameMode}</span>}
                            <span>• by {sub.submitterName}</span>
                          </div>
                          {sub.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {sub.description}
                            </p>
                          )}
                          {sub.imageUrl && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Logo: {sub.imageUrl}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            data-ocid={`admin.submissions.confirm_button.${i + 1}`}
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => handleApproveSubmission(sub.id)}
                            style={{
                              background: "oklch(0.88 0.22 158 / 0.15)",
                              color: "oklch(0.88 0.22 158)",
                              border: "1px solid oklch(0.88 0.22 158 / 0.4)",
                            }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            data-ocid={`admin.submissions.delete_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectSubmission(sub.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews">
            <h2 className="font-semibold text-foreground mb-4">
              Player Reviews
            </h2>
            {reviewsLoading ? (
              <div
                data-ocid="admin.reviews_loading_state"
                className="text-center py-10 text-muted-foreground"
              >
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />{" "}
                Loading reviews...
              </div>
            ) : (
              <div className="space-y-4">
                {servers.map((server) => {
                  const reviews = reviewsByServer[server.id] ?? [];
                  if (reviews.length === 0) return null;
                  return (
                    <div key={server.id}>
                      <h3 className="text-sm font-semibold mb-2 text-foreground">
                        {server.name}
                      </h3>
                      <div className="space-y-2">
                        {reviews.map((r, ri) => (
                          <Card
                            key={r.id}
                            data-ocid={`admin.reviews.item.${ri + 1}`}
                            className="bg-card border-border"
                          >
                            <CardContent className="p-3 flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {r.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(r.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {r.text}
                                </p>
                              </div>
                              <Button
                                data-ocid={`admin.reviews.delete_button.${ri + 1}`}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleDeleteReview(server.id, r.id)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {servers.every((s) => !reviewsByServer[s.id]?.length) && (
                  <div
                    data-ocid="admin.reviews_empty_state"
                    className="text-center py-10 text-muted-foreground"
                  >
                    No reviews yet.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <Card
              className="bg-card border-border"
              data-ocid="admin.settings_panel"
            >
              <CardHeader>
                <CardTitle className="text-base">Site Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-1 block">
                    Announcement Banner (leave blank to hide)
                  </Label>
                  <Textarea
                    data-ocid="admin.announcement_textarea"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="e.g. Server maintenance on Sunday 2AM UTC"
                    className="bg-secondary/50 text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Hero Subtitle</Label>
                  <Input
                    data-ocid="admin.hero_subtitle_input"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Find FREE Cracked Minecraft Servers"
                    className="bg-secondary/50 h-9 text-sm"
                  />
                </div>

                {/* User Submissions Toggle */}
                <div
                  className="flex items-center justify-between py-3 px-3 rounded-md border border-border"
                  style={{ background: "oklch(0.12 0.01 270)" }}
                >
                  <div>
                    <Label className="text-sm font-medium block">
                      Allow User Server Submissions
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When enabled, users can submit servers for admin review.
                    </p>
                  </div>
                  <Switch
                    data-ocid="admin.submissions_toggle"
                    checked={submissionsEnabled}
                    onCheckedChange={(checked) => {
                      setSubmissionsEnabled(checked);
                      if (actor) (actor as any).setSubmissionsEnabled(checked);
                    }}
                  />
                </div>

                <Button
                  data-ocid="admin.settings_save_button"
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  style={{
                    background: "oklch(0.88 0.22 158 / 0.15)",
                    color: "oklch(0.88 0.22 158)",
                    border: "1px solid oklch(0.88 0.22 158 / 0.4)",
                  }}
                >
                  {settingsSaving ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {settingsSaving ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
