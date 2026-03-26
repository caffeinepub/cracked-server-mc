import {
  Check,
  Cloud,
  Copy,
  Gamepad2,
  Palette,
  Search,
  Shield,
  Skull,
  Sword,
  TreePine,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Server } from "../types/server";
import { getServers, seedSampleServersIfEmpty } from "../utils/storage";

// Tag color mapping for colored badge pills
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
};

// Tag icon mapping
const TAG_ICONS: Record<string, React.ReactNode> = {
  PVP: <Sword className="w-3 h-3" />,
  Survival: <TreePine className="w-3 h-3" />,
  Creative: <Palette className="w-3 h-3" />,
  Skyblock: <Cloud className="w-3 h-3" />,
  Factions: <Shield className="w-3 h-3" />,
  "Mini-Games": <Gamepad2 className="w-3 h-3" />,
  Anarchy: <Skull className="w-3 h-3" />,
  Vanilla: <Wheat className="w-3 h-3" />,
};

const FILTER_TAGS = [
  "All",
  "PVP",
  "Survival",
  "Creative",
  "Skyblock",
  "Factions",
  "Mini-Games",
  "Anarchy",
  "Vanilla",
];

// Star rating display component
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

// Copy button with "Copied!" confirmation
function CopyButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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
      className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
        copied
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-primary border-primary hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> COPIED!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> COPY IP
        </>
      )}
    </button>
  );
}

// Individual server card
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
      {/* Server thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={
            server.imageUrl || `https://picsum.photos/seed/${server.id}/400/250`
          }
          alt={server.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${server.id}/400/250`;
          }}
        />
        {/* Rating overlay top-right */}
        <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
          <StarRating rating={server.rating} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Server name in pixel font */}
        <h2
          className="font-pixel text-primary text-xs leading-relaxed line-clamp-2"
          style={{ fontSize: "10px" }}
        >
          {server.name}
        </h2>

        {/* IP address */}
        <p
          className="text-muted-foreground text-xs font-mono truncate"
          title={server.ip}
        >
          {server.ip}
        </p>

        {/* Copy button */}
        <CopyButton ip={server.ip} />

        {/* Tags */}
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
      </div>
    </motion.article>
  );
}

export default function HomePage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  // Seed sample data on first visit and load servers
  useEffect(() => {
    seedSampleServersIfEmpty();
    setServers(getServers());
  }, []);

  // Filter servers by search query and active tag
  const filtered = servers.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === "All" || s.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛏️</span>
            <div>
              <h1
                className="font-pixel text-primary pixel-glow"
                style={{ fontSize: "clamp(8px, 2vw, 14px)", lineHeight: 1.4 }}
              >
                CRACKED SERVER
              </h1>
              <p
                className="font-pixel text-primary pixel-glow"
                style={{ fontSize: "clamp(8px, 2vw, 14px)", lineHeight: 1.4 }}
              >
                MC
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <a
              data-ocid="nav.link"
              href="#servers"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Servers
            </a>
            <a
              data-ocid="nav.link"
              href="#top"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Top Rated
            </a>
          </nav>
        </div>
      </header>

      {/* ===== HERO / SEARCH SECTION ===== */}
      <section className="py-12 px-4" id="top">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-pixel text-foreground mb-2"
            style={{ fontSize: "clamp(10px, 2.5vw, 16px)", lineHeight: 1.8 }}
          >
            FIND YOUR
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-pixel text-primary pixel-glow mb-8"
            style={{ fontSize: "clamp(10px, 2.5vw, 16px)", lineHeight: 1.8 }}
          >
            PERFECT SERVER
          </motion.h2>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search by name or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="search.input"
              className="w-full bg-card border-2 border-primary rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground input-glow outline-none text-sm glow-green"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== TAG FILTERS ===== */}
      <section className="px-4 pb-6">
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
          {/* Server count */}
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
        </div>
      </footer>
    </div>
  );
}
