import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import type {
  Review,
  Server,
  SiteSettings,
  UserSubmission,
} from "@/types/server";
import {
  Check,
  Copy,
  ExternalLink,
  LogIn,
  LogOut,
  MessageSquare,
  Send,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const ALL_TAGS = [
  "All",
  "PVP",
  "Survival",
  "Factions",
  "Skyblock",
  "Bedwars",
  "Lifesteal",
  "Minigames",
];

const TAG_COLORS: Record<string, string> = {
  PVP: "bg-red-900/60 text-red-300 border-red-700/50",
  Survival: "bg-green-900/60 text-green-300 border-green-700/50",
  Factions: "bg-orange-900/60 text-orange-300 border-orange-700/50",
  Skyblock: "bg-blue-900/60 text-blue-300 border-blue-700/50",
  Bedwars: "bg-purple-900/60 text-purple-300 border-purple-700/50",
  Lifesteal: "bg-pink-900/60 text-pink-300 border-pink-700/50",
  Minigames: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50",
  featured: "bg-yellow-800/60 text-yellow-200 border-yellow-600/50",
};

function extractYTId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))[\w-]{11}/,
  );
  if (!m) return null;
  const full = m[0];
  return full.split(/[/?=]/).pop() ?? null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function CopyButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="server.copy_ip_button"
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors"
      style={{
        borderColor: copied
          ? "oklch(0.88 0.22 158 / 0.6)"
          : "oklch(0.82 0.16 205 / 0.4)",
        color: copied ? "oklch(0.88 0.22 158)" : "oklch(0.82 0.16 205)",
        background: copied
          ? "oklch(0.88 0.22 158 / 0.08)"
          : "oklch(0.82 0.16 205 / 0.06)",
      }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy IP"}
    </button>
  );
}

function ReviewSection({ server, actor }: { server: Server; actor: any }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const hasReviewed = !!localStorage.getItem(`reviewed_${server.id}`);
  const [submitted, setSubmitted] = useState(hasReviewed);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!actor) return;
    try {
      const r = await actor.getReviews(server.id);
      setReviews(r);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [actor, server.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async () => {
    if (!actor || !name.trim() || !text.trim()) return;
    setSubmitting(true);
    try {
      const review: Review = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        name: name.trim(),
        text: text.trim(),
        serverId: server.id,
      };
      await actor.addReview(review);
      localStorage.setItem(`reviewed_${server.id}`, "1");
      setSubmitted(true);
      setName("");
      setText("");
      loadReviews();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare
          className="w-4 h-4"
          style={{ color: "oklch(0.82 0.16 205)" }}
        />
        <h3
          className="text-sm font-semibold"
          style={{ color: "oklch(0.82 0.16 205)" }}
        >
          Player Experiences
        </h3>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-muted-foreground mb-3">
          No experiences shared yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-secondary/40 rounded p-2.5 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{r.text}</p>
            </div>
          ))}
        </div>
      )}
      {submitted ? (
        <p className="text-xs text-muted-foreground italic">
          You've already shared your experience for this server.
        </p>
      ) : (
        <div className="space-y-2">
          <Input
            data-ocid="server.review_name_input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm bg-secondary/50 border-border"
          />
          <Textarea
            data-ocid="server.review_textarea"
            placeholder="Share your experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm bg-secondary/50 border-border resize-none"
            rows={2}
          />
          <Button
            data-ocid="server.review_submit_button"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !text.trim()}
            className="h-8 text-xs"
            style={{
              background: "oklch(0.88 0.22 158 / 0.15)",
              color: "oklch(0.88 0.22 158)",
              border: "1px solid oklch(0.88 0.22 158 / 0.4)",
            }}
          >
            <Send className="w-3 h-3 mr-1" />
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ServerTypeBadge({ serverType }: { serverType: string }) {
  if (!serverType) return null;
  const isPremium = serverType === "Premium";
  return (
    <span
      className="text-xs px-2 py-0.5 rounded border font-medium"
      style={
        isPremium
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
      {serverType}
    </span>
  );
}

function ServerLogo({
  imageUrl,
  name,
}: { imageUrl: string | undefined; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
        style={{ borderColor: "oklch(0.82 0.16 205 / 0.25)" }}
      />
    );
  }

  return (
    <div
      className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xl border"
      style={{
        background: "oklch(0.14 0.015 270)",
        borderColor: "oklch(0.82 0.16 205 / 0.2)",
        color: "oklch(0.82 0.16 205 / 0.6)",
      }}
    >
      ⚔
    </div>
  );
}

function ServerCard({
  server,
  actor,
  index,
}: { server: Server; actor: any; index: number }) {
  const isFeatured = server.featured;
  const description = server.description[0];
  const ytUrl = server.ytVideoUrl[0];
  const ytId = ytUrl ? extractYTId(ytUrl) : null;
  const website = server.website[0];
  const discord = server.discordUrl[0];
  const version = server.version[0];
  const maxPlayers = server.maxPlayers[0];
  const location = server.location[0];
  const gameMode = server.gameMode[0];
  const status = server.status[0];
  const rating = Number(server.rating);
  const imageUrl = server.imageUrl[0];

  return (
    <Card
      data-ocid={`servers.item.${index}`}
      className="server-card bg-card border-border overflow-hidden"
      style={isFeatured ? { borderColor: "oklch(0.75 0.18 80 / 0.45)" } : {}}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Logo */}
          <ServerLogo imageUrl={imageUrl} name={server.name} />

          {/* Name + IP */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isFeatured && (
                <span
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.88 0.22 80)" }}
                  title="Featured server"
                >
                  ★
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground truncate">
                {server.name}
              </h2>
              <ServerTypeBadge serverType={server.serverType} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <code
                className="font-mono text-sm px-2 py-0.5 rounded"
                style={{
                  background: "oklch(0.82 0.16 205 / 0.08)",
                  color: "oklch(0.82 0.16 205)",
                  border: "1px solid oklch(0.82 0.16 205 / 0.25)",
                }}
              >
                {server.ip}
              </code>
              <CopyButton ip={server.ip} />
            </div>
          </div>

          <StarRating rating={rating} />
        </div>

        {/* Tags */}
        {server.tags.filter((t) => t !== "featured").length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {server.tags
              .filter((t) => t !== "featured")
              .map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-0.5 rounded border ${
                    TAG_COLORS[tag] ??
                    "bg-secondary/60 text-muted-foreground border-border"
                  }`}
                >
                  {tag}
                </span>
              ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Detail chips */}
        {(version || maxPlayers != null || location || gameMode || status) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {version && (
              <Badge variant="outline" className="text-xs">
                {version}
              </Badge>
            )}
            {maxPlayers != null && (
              <Badge variant="outline" className="text-xs">
                👥 {Number(maxPlayers)} players
              </Badge>
            )}
            {location && (
              <Badge variant="outline" className="text-xs">
                📍 {location}
              </Badge>
            )}
            {gameMode && (
              <Badge variant="outline" className="text-xs">
                {gameMode}
              </Badge>
            )}
            {status && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  status === "Online"
                    ? "border-green-700/50 text-green-400"
                    : status === "Offline"
                      ? "border-red-700/50 text-red-400"
                      : "border-muted text-muted-foreground"
                }`}
              >
                {status === "Online"
                  ? "🟢"
                  : status === "Offline"
                    ? "🔴"
                    : "⚪"}{" "}
                {status}
              </Badge>
            )}
          </div>
        )}

        {/* Links */}
        {(website || discord) && (
          <div className="flex gap-2 mb-3">
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Website
                </Button>
              </a>
            )}
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Discord
                </Button>
              </a>
            )}
          </div>
        )}

        {/* YouTube embed */}
        {ytId && (
          <div className="mb-3 rounded overflow-hidden aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${server.name} video`}
            />
          </div>
        )}

        <ReviewSection server={server} actor={actor} />
      </CardContent>
    </Card>
  );
}

const EMPTY_SUBMISSION = {
  name: "",
  ip: "",
  version: "",
  gameMode: "",
  description: "",
  imageUrl: "",
  serverType: "",
};

function SubmitServerSection({ actor }: { actor: any }) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const [form, setForm] = useState({ ...EMPTY_SUBMISSION });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.ip.trim()) {
      toast.error("Server Name and IP are required.");
      return;
    }
    if (!form.serverType) {
      toast.error("Server Type is required.");
      return;
    }
    setSubmitting(true);
    try {
      const submission: UserSubmission = {
        id: Date.now().toString(),
        name: form.name.trim(),
        ip: form.ip.trim(),
        version: form.version.trim(),
        gameMode: form.gameMode.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        serverType: form.serverType,
        submitterName: identity!.getPrincipal().toString(),
        submittedAt: new Date().toISOString(),
        submissionStatus: "pending",
      };
      await actor.submitServer(submission);
      toast.success("Server submitted! Pending admin approval.");
      setForm({ ...EMPTY_SUBMISSION });
    } catch (e: any) {
      toast.error(`Submission failed: ${e?.message ?? e}`);
    } finally {
      setSubmitting(false);
    }
  };

  const accentStyle = {
    background: "oklch(0.82 0.16 205 / 0.15)",
    color: "oklch(0.82 0.16 205)",
    border: "1px solid oklch(0.82 0.16 205 / 0.4)",
  };

  return (
    <section className="mt-10" data-ocid="submit.section">
      <Card
        className="bg-card border-border"
        style={{ borderColor: "oklch(0.82 0.16 205 / 0.3)" }}
      >
        <CardHeader>
          <CardTitle
            className="text-lg"
            style={{ color: "oklch(0.82 0.16 205)" }}
          >
            Submit Your Server
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All submissions are reviewed by our admin before going live.
          </p>
        </CardHeader>
        <CardContent>
          {!identity ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-muted-foreground max-w-xs">
                Sign in to submit your server for review.
              </p>
              <Button
                data-ocid="submit.login_button"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                style={accentStyle}
                className="gap-2"
              >
                {isLoggingIn || isInitializing ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoggingIn
                  ? "Signing in..."
                  : isInitializing
                    ? "Loading..."
                    : "Login to Submit"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="flex items-center justify-between px-3 py-2 rounded text-xs"
                style={{
                  background: "oklch(0.82 0.16 205 / 0.08)",
                  border: "1px solid oklch(0.82 0.16 205 / 0.25)",
                }}
              >
                <span style={{ color: "oklch(0.82 0.16 205)" }}>
                  ✓ Signed in as{" "}
                  <span className="font-mono opacity-75">
                    {identity.getPrincipal().toString().slice(0, 16)}…
                  </span>
                </span>
                <button
                  type="button"
                  data-ocid="submit.logout_button"
                  onClick={clear}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Server Name *</Label>
                  <Input
                    data-ocid="submit.server_name_input"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="My Awesome Server"
                    className="bg-secondary/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Server IP *</Label>
                  <Input
                    data-ocid="submit.server_ip_input"
                    value={form.ip}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ip: e.target.value }))
                    }
                    placeholder="play.myserver.net"
                    className="bg-secondary/50 h-9 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Server Type *</Label>
                  <Select
                    value={form.serverType}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, serverType: v }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="submit.server_type_select"
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
                  <Label className="text-xs mb-1 block">
                    Minecraft Version
                  </Label>
                  <Input
                    data-ocid="submit.version_input"
                    value={form.version}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, version: e.target.value }))
                    }
                    placeholder="1.8 - 1.20"
                    className="bg-secondary/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Gamemode</Label>
                  <Input
                    data-ocid="submit.gamemode_input"
                    value={form.gameMode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, gameMode: e.target.value }))
                    }
                    placeholder="Survival, PvP, Factions..."
                    className="bg-secondary/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Image / Logo URL</Label>
                  <Input
                    data-ocid="submit.image_url_input"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, imageUrl: e.target.value }))
                    }
                    placeholder="https://example.com/logo.png"
                    className="bg-secondary/50 h-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Description</Label>
                <Textarea
                  data-ocid="submit.description_textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Tell us about your server..."
                  className="bg-secondary/50 text-sm resize-none"
                  rows={3}
                />
              </div>
              <Button
                data-ocid="submit.submit_button"
                onClick={handleSubmit}
                disabled={submitting}
                style={accentStyle}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {submitting ? "Submitting..." : "Submit Server"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function HomePage() {
  const { actor, isFetching } = useActor();
  const [servers, setServers] = useState<Server[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroSubtitle: "Find FREE Cracked Minecraft Servers",
  });
  const [submissionsEnabled, setSubmissionsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [filterVersion, setFilterVersion] = useState("");
  const [filterGamemode, setFilterGamemode] = useState("");
  const [filterServerType, setFilterServerType] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const lastUpdatedRef = useRef<bigint>(0n);

  const loadAll = useCallback(async () => {
    if (!actor) return;
    try {
      const [s, ann, settings, enabled] = await Promise.all([
        actor.getServers(),
        actor.getAnnouncement(),
        actor.getSiteSettings(),
        (actor as any).getSubmissionsEnabled(),
      ]);
      if (s.length === 0) {
        await actor.seedSampleServers();
        const seeded = (await actor.getServers()) as unknown as Server[];
        setServers(seeded);
      } else {
        setServers(s as unknown as Server[]);
      }
      setAnnouncement(ann);
      setSiteSettings(settings);
      setSubmissionsEnabled(enabled);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    loadAll();
  }, [actor, isFetching, loadAll]);

  // Poll for updates every 30s
  useEffect(() => {
    if (!actor || isFetching) return;
    const interval = setInterval(async () => {
      try {
        const lu = await actor.getLastUpdated();
        if (lu > lastUpdatedRef.current) {
          lastUpdatedRef.current = lu;
          loadAll();
        }
      } catch {
        // silent
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [actor, isFetching, loadAll]);

  // Unique version/gamemode values for filter dropdowns
  const uniqueVersions = useMemo(() => {
    const seen = new Set<string>();
    for (const s of servers) {
      const v = s.version[0];
      if (v) seen.add(v);
    }
    return Array.from(seen).sort();
  }, [servers]);

  const uniqueGamemodes = useMemo(() => {
    const seen = new Set<string>();
    for (const s of servers) {
      const g = s.gameMode[0];
      if (g) seen.add(g);
    }
    return Array.from(seen).sort();
  }, [servers]);

  const hasActiveFilters =
    filterVersion !== "" ||
    filterGamemode !== "" ||
    filterServerType !== "" ||
    filterFeatured;

  const clearFilters = () => {
    setFilterVersion("");
    setFilterGamemode("");
    setFilterServerType("");
    setFilterFeatured(false);
  };

  const filtered = servers
    .filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = activeTag === "All" || s.tags.includes(activeTag);
      const matchVersion = !filterVersion || s.version[0] === filterVersion;
      const matchGamemode = !filterGamemode || s.gameMode[0] === filterGamemode;
      const matchServerType =
        !filterServerType || s.serverType === filterServerType;
      const matchFeatured = !filterFeatured || s.featured;
      return (
        matchSearch &&
        matchTag &&
        matchVersion &&
        matchGamemode &&
        matchServerType &&
        matchFeatured
      );
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const totalOnline = servers.filter((s) => s.status[0] === "Online");
  const totalPlayers = totalOnline.reduce(
    (sum, s) => sum + Number(s.maxPlayers[0] ?? 0n),
    0,
  );

  const selectTriggerStyle = {
    background: "oklch(0.12 0.01 270)",
    borderColor: "oklch(0.25 0.02 270)",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.07 0.008 280)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border"
        style={{
          background: "oklch(0.10 0.01 270 / 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: "oklch(0.88 0.22 158)" }}
            >
              ⚔
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: "oklch(0.88 0.22 158)" }}
            >
              MINE lister
            </span>
          </div>
          <a
            href="mailto:zodiacmc11@gmail.com"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            zodiacmc11@gmail.com
          </a>
        </div>
      </header>

      {/* Announcement */}
      {announcement && (
        <div
          className="text-center text-sm py-2.5 px-4 font-medium"
          style={{
            background: "oklch(0.82 0.16 205 / 0.15)",
            color: "oklch(0.82 0.16 205)",
            borderBottom: "1px solid oklch(0.82 0.16 205 / 0.3)",
          }}
        >
          📢 {announcement}
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight"
            style={{
              color: "oklch(0.88 0.22 158)",
              textShadow: "0 0 30px oklch(0.88 0.22 158 / 0.4)",
            }}
          >
            Best Minecraft Cracked Servers 2026
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            {siteSettings.heroSubtitle || "Find FREE Cracked Minecraft Servers"}
          </p>
        </section>

        {/* Search + Filters */}
        <section className="mb-6" data-ocid="search.section">
          {/* Search bar */}
          <Input
            data-ocid="search.input"
            placeholder="Search by server name or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 bg-secondary/50 border-border h-11 text-sm"
          />

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Version */}
            <Select
              value={filterVersion || "__all__"}
              onValueChange={(v) => setFilterVersion(v === "__all__" ? "" : v)}
            >
              <SelectTrigger
                data-ocid="filter.version.select"
                className="h-9 text-xs w-auto min-w-[130px]"
                style={selectTriggerStyle}
              >
                <SelectValue placeholder="All Versions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Versions</SelectItem>
                {uniqueVersions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gamemode */}
            <Select
              value={filterGamemode || "__all__"}
              onValueChange={(v) => setFilterGamemode(v === "__all__" ? "" : v)}
            >
              <SelectTrigger
                data-ocid="filter.gamemode.select"
                className="h-9 text-xs w-auto min-w-[140px]"
                style={selectTriggerStyle}
              >
                <SelectValue placeholder="All Gamemodes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Gamemodes</SelectItem>
                {uniqueGamemodes.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Server Type */}
            <Select
              value={filterServerType || "__all__"}
              onValueChange={(v) =>
                setFilterServerType(v === "__all__" ? "" : v)
              }
            >
              <SelectTrigger
                data-ocid="filter.server_type.select"
                className="h-9 text-xs w-auto min-w-[120px]"
                style={selectTriggerStyle}
              >
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Cracked">Cracked</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured toggle */}
            <button
              type="button"
              data-ocid="filter.featured.toggle"
              onClick={() => setFilterFeatured((p) => !p)}
              className="h-9 px-3 rounded text-xs border transition-colors font-medium"
              style={
                filterFeatured
                  ? {
                      background: "oklch(0.88 0.22 80 / 0.18)",
                      color: "oklch(0.88 0.22 80)",
                      borderColor: "oklch(0.88 0.22 80 / 0.5)",
                    }
                  : {
                      background: "oklch(0.12 0.01 270)",
                      color: "oklch(0.6 0.01 270)",
                      borderColor: "oklch(0.25 0.02 270)",
                    }
              }
            >
              ★ Featured Only
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                type="button"
                data-ocid="filter.clear.button"
                onClick={clearFilters}
                className="h-9 px-3 rounded text-xs border transition-colors flex items-center gap-1"
                style={{
                  background: "oklch(0.12 0.01 270)",
                  color: "oklch(0.65 0.01 270)",
                  borderColor: "oklch(0.25 0.02 270)",
                }}
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Tag pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {ALL_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                data-ocid={`filter.${tag.toLowerCase()}.tab`}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded text-sm transition-colors border ${
                  activeTag === tag
                    ? "border-primary/60 text-foreground"
                    : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                style={
                  activeTag === tag
                    ? {
                        background: "oklch(0.88 0.22 158 / 0.12)",
                        color: "oklch(0.88 0.22 158)",
                      }
                    : {}
                }
              >
                {tag}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} server{filtered.length !== 1 ? "s" : ""}
          </p>
        </section>

        {/* Server List */}
        <section data-ocid="servers.list">
          {loading ? (
            <div
              data-ocid="servers.loading_state"
              className="text-center py-16"
            >
              <div className="text-muted-foreground">Loading servers...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="servers.empty_state"
              className="text-center py-16 text-muted-foreground"
            >
              No servers found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((server, i) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  actor={actor}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* User Submission Section */}
        {submissionsEnabled && actor && <SubmitServerSection actor={actor} />}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border text-center text-sm text-muted-foreground py-8 px-4"
        style={{ background: "oklch(0.10 0.01 270)", lineHeight: 1.8 }}
      >
        <p className="mb-2 text-foreground font-medium">
          © {new Date().getFullYear()} MINE lister – All rights reserved.
        </p>
        <p className="mb-2 text-xs max-w-2xl mx-auto">
          Minecraft® is a trademark of Mojang Studios / Microsoft Corporation.
          This site is not affiliated with or endorsed by Mojang or Microsoft.
        </p>
        <p className="mb-3 text-xs max-w-2xl mx-auto">
          The top servers listed may include paid or featured slots, marked with
          a <span style={{ color: "oklch(0.82 0.16 205)" }}>★</span> icon. These
          featured placements can be purchased via{" "}
          <a
            href="mailto:zodiacmc11@gmail.com"
            style={{ color: "oklch(0.82 0.16 205)" }}
          >
            zodiacmc11@gmail.com
          </a>
          .
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-3 text-xs">
          {(
            [
              ["Contact", "/contact"],
              ["Terms of Service", "/terms"],
              ["Privacy Policy", "/privacy"],
              ["Sale Terms", "/sale-terms"],
              ["FAQ", "/faq"],
              ["Partners", "/partners"],
              ["Service Status", "/service-status"],
              ["OptiFine Downloads", "/optifine-downloads"],
            ] as [string, string][]
          ).map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{ color: "oklch(0.82 0.16 205)" }}
              className="hover:underline"
            >
              {label}
            </a>
          ))}
        </div>
        <p className="text-xs">
          Tracking {servers.length} server{servers.length !== 1 ? "s" : ""},
          with a total of {totalPlayers} players online.
        </p>
        <p className="text-xs mt-3 text-muted-foreground/60">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
