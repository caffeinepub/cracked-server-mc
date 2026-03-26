import {
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Copy,
  Gamepad2,
  Heart,
  MessageSquare,
  Palette,
  Search,
  Shield,
  Skull,
  Sword,
  TreePine,
  Wheat,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";
import { useActor } from "../hooks/useActor";
import type { Review, Server } from "../types/server";
import {
  getLocalReviews,
  hasReviewed,
  markReviewed,
  saveLocalReview,
} from "../utils/storage";

export type { Review };

// ─── Type conversion helpers ─────────────────────────────────────────────────

type BackendServer = Omit<Server, "rating"> & { rating: bigint };

function toFrontendServer(s: BackendServer): Server {
  return { ...s, rating: Number(s.rating) };
}

// ─── Tag maps ────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  PVP: "bg-red-600 text-white",
  Survival: "bg-emerald-700 text-white",
  Creative: "bg-purple-600 text-white",
  Skyblock: "bg-blue-600 text-white",
  Factions: "bg-orange-600 text-white",
  "Mini-Games": "bg-pink-600 text-white",
  Anarchy: "bg-red-900 text-white",
  Vanilla: "bg-green-800 text-white",
  Modded: "bg-yellow-700 text-white",
  Roleplay: "bg-indigo-600 text-white",
  Lifesteal: "bg-rose-700 text-white",
  Bedwars: "bg-cyan-700 text-white",
};

const TAG_ICONS: Record<string, React.ReactNode> = {
  PVP: <Sword className="w-3 h-3" />,
  Survival: <TreePine className="w-3 h-3" />,
  Creative: <Palette className="w-3 h-3" />,
  Skyblock: <Cloud className="w-3 h-3" />,
  Factions: <Shield className="w-3 h-3" />,
  "Mini-Games": <Gamepad2 className="w-3 h-3" />,
  Anarchy: <Skull className="w-3 h-3" />,
  Vanilla: <Wheat className="w-3 h-3" />,
  Lifesteal: <Heart className="w-3 h-3" />,
  Bedwars: <Shield className="w-3 h-3" />,
};

const FILTER_TAGS = [
  "All",
  "PVP",
  "Survival",
  "Lifesteal",
  "Bedwars",
  "Creative",
  "Skyblock",
  "Factions",
  "Mini-Games",
  "Anarchy",
  "Vanilla",
];

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-600"}
          style={{ fontSize: "14px" }}
        >
          {star <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = ip;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [ip]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="server.copy_button"
      className={`flex items-center gap-1.5 py-1 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
        copied
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-primary border-primary hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> {ip}
        </>
      )}
    </button>
  );
}

// ─── ExperienceBox ────────────────────────────────────────────────────────────

function ExperienceBox({ serverId }: { serverId: string }) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() =>
    getLocalReviews(serverId),
  );
  const [alreadyReviewed, setAlreadyReviewed] = useState(() =>
    hasReviewed(serverId),
  );
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const review: Review = {
      id: crypto.randomUUID(),
      serverid: serverId,
      name: name.trim(),
      text: text.trim(),
      date: new Date().toLocaleDateString(),
    };
    saveLocalReview(review);
    markReviewed(serverId);
    setReviews(getLocalReviews(serverId));
    setAlreadyReviewed(true);
    setSubmitted(true);
    setName("");
    setText("");
  };

  return (
    <div className="border-t border-border mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-1 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Player Experiences ({reviews.length})
        </span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-3 flex flex-col gap-3">
              {reviews.length > 0 && (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-background rounded p-2 border border-border text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-primary font-semibold">
                          {r.name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {r.date}
                        </span>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {submitted ? (
                <p className="text-xs text-emerald-400 text-center py-1">
                  ✓ Experience shared!
                </p>
              ) : alreadyReviewed ? (
                <p className="text-xs text-muted-foreground text-center py-1">
                  You already shared your experience for this server.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Your name / username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    className="bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                  <textarea
                    placeholder="Share your experience on this server..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={300}
                    rows={3}
                    className="bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!name.trim() || !text.trim()}
                    className="w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Share Experience
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ServerCard ───────────────────────────────────────────────────────────────

function ServerCard({ server, index }: { server: Server; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      data-ocid={`server.item.${index + 1}`}
      className="server-card bg-card rounded-lg border border-border overflow-hidden flex flex-col"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={
            server.imageUrl || `https://picsum.photos/seed/${server.id}/400/250`
          }
          alt={server.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${server.id}/400/250`;
          }}
        />
        <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
          <StarRating rating={server.rating} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3
          className="font-pixel text-primary text-xs leading-relaxed line-clamp-2"
          style={{ fontSize: "10px" }}
        >
          {server.name}
        </h3>

        {server.description && (
          <p className="text-xs text-muted-foreground leading-relaxed -mt-1">
            {server.description}
          </p>
        )}

        <CopyButton ip={server.ip} />

        {server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {server.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  TAG_COLORS[tag] ?? "bg-gray-700 text-white"
                }`}
              >
                {TAG_ICONS[tag]}
                {tag}
              </span>
            ))}
          </div>
        )}

        <ExperienceBox serverId={server.id} />
      </div>
    </motion.article>
  );
}

// ─── Announcement Banner ──────────────────────────────────────────────────────

function AnnouncementBanner({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (!text || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative bg-card border-l-4 border-primary px-5 py-3 flex items-start gap-3"
      role="alert"
    >
      <span className="text-base shrink-0">📢</span>
      <p className="text-sm text-foreground flex-1 leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        data-ocid="announcement.close_button"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

async function loadSiteData(actor: backendInterface) {
  const [rawServers, announcement, settings] = await Promise.all([
    actor.getServers(),
    actor.getAnnouncement(),
    actor.getSiteSettings(),
  ]);
  const servers = (rawServers as BackendServer[]).map(toFrontendServer);
  return { servers, announcement, settings };
}

export default function HomePage() {
  const { actor, isFetching } = useActor();
  const [servers, setServers] = useState<Server[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastUpdatedRef = useRef<bigint>(0n);
  const seededRef = useRef(false);

  // Initial load
  useEffect(() => {
    if (!actor || isFetching) return;
    if (seededRef.current) return;
    seededRef.current = true;

    (async () => {
      try {
        await actor.seedSampleServers();
        const data = await loadSiteData(actor);
        setServers(data.servers);
        setAnnouncement(data.announcement);
        setHeroSubtitle(data.settings.heroSubtitle);
        const ts = await actor.getLastUpdated();
        lastUpdatedRef.current = ts;
      } catch (err) {
        console.error("Failed to load site data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, isFetching]);

  // 30s polling for live updates
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(async () => {
      try {
        const ts = await actor.getLastUpdated();
        if (ts !== lastUpdatedRef.current) {
          lastUpdatedRef.current = ts;
          const data = await loadSiteData(actor);
          setServers(data.servers);
          setAnnouncement(data.announcement);
          setHeroSubtitle(data.settings.heroSubtitle);
        }
      } catch {
        /* silent poll failure */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [actor]);

  const filtered = servers.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === "All" || s.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const navLinks = [{ label: "All Servers", href: "#servers" }];

  const defaultSubtitle =
    "Discover the top free Minecraft cracked servers — no premium account needed. Browse PVP, Lifesteal, Survival, and Bedwars servers with IPs, ratings, and player reviews.";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ===== ANNOUNCEMENT BANNER ===== */}
      <AnnouncementBanner text={announcement} />

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛏️</span>
            <div>
              <span
                className="font-pixel text-primary pixel-glow block"
                style={{ fontSize: "clamp(8px, 2vw, 13px)", lineHeight: 1.4 }}
              >
                CRACKED SERVER MC
              </span>
            </div>
          </div>
          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-5"
            aria-label="Main navigation"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <div className="flex flex-col gap-1">
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-card overflow-hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col px-4 py-3 gap-3">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO / H1 / SEARCH ===== */}
      <section className="py-12 px-4" id="top">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="font-pixel text-primary pixel-glow mb-6"
            style={{ fontSize: "clamp(10px, 2.5vw, 16px)", lineHeight: 1.8 }}
          >
            BEST MINECRAFT CRACKED SERVERS 2026
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-xl mx-auto">
            {heroSubtitle || defaultSubtitle}
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="search"
              placeholder="Search by server name or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="search.input"
              aria-label="Search servers"
              className="w-full bg-card border-2 border-primary rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground input-glow outline-none text-sm glow-green"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== TAG FILTERS ===== */}
      <section className="px-4 pb-6" aria-label="Filter by game mode">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                data-ocid="filter.tab"
                aria-pressed={activeTag === tag}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVER GRID ===== */}
      <main className="flex-1 px-4 pb-12" id="servers">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div
              data-ocid="servers.loading_state"
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p
                className="font-pixel text-muted-foreground"
                style={{ fontSize: "9px", lineHeight: 2 }}
              >
                LOADING SERVERS...
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm mb-6">
                {filtered.length} server{filtered.length !== 1 ? "s" : ""} found
              </p>
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((server, i) => (
                      <ServerCard key={server.id} server={server} index={i} />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-ocid="servers.empty_state"
                    className="text-center py-20"
                  >
                    <p className="text-6xl mb-4">🔍</p>
                    <p
                      className="font-pixel text-muted-foreground"
                      style={{ fontSize: "10px", lineHeight: 2 }}
                    >
                      NO SERVERS FOUND
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Try a different search term or tag filter.
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setActiveTag("All");
                        }}
                        className="mt-4 px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                      >
                        Clear filters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⛏️</span>
            <span
              className="font-pixel text-muted-foreground"
              style={{ fontSize: "8px" }}
            >
              CRACKED SERVER MC
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-muted-foreground text-xs text-center">
              © {new Date().getFullYear()}. Built with{" "}
              <span className="text-red-500">♥</span> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-muted-foreground text-xs text-center">
              For business inquiries:{" "}
              <a
                href="mailto:zodiacmc11@gmail.com"
                className="text-primary hover:underline"
              >
                zodiacmc11@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
