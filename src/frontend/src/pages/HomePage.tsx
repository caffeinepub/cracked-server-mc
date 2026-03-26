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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Server } from "../types/server";
import { getServers, seedSampleServersIfEmpty } from "../utils/storage";

// ─── Review helpers (localStorage) ──────────────────────────────────────────

export interface Review {
  id: string;
  serverid: string;
  name: string;
  text: string;
  date: string;
}

function getReviews(serverId: string): Review[] {
  try {
    const raw = localStorage.getItem(`reviews_${serverId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReview(review: Review) {
  const existing = getReviews(review.serverid);
  existing.push(review);
  localStorage.setItem(`reviews_${review.serverid}`, JSON.stringify(existing));
}

function hasReviewed(serverId: string): boolean {
  try {
    const raw = localStorage.getItem("reviewed_servers");
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(serverId);
  } catch {
    return false;
  }
}

function markReviewed(serverId: string) {
  try {
    const raw = localStorage.getItem("reviewed_servers");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(serverId)) list.push(serverId);
    localStorage.setItem("reviewed_servers", JSON.stringify(list));
  } catch {
    /* ignore */
  }
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

// ─── SEO server data (static, for content sections) ─────────────────────────

const SEO_PVP_SERVERS = [
  {
    name: "CrackPvP Universe",
    ip: "play.crackpvp.net",
    rating: 5,
    description:
      "CrackPvP Universe is one of the most popular cracked PVP servers in 2026. Featuring multiple competitive arenas, ranked matches, and a thriving community of over 10,000 active players. The server supports Minecraft Java cracked clients and offers custom kits, faction wars, and weekly PVP tournaments. No premium account needed — just connect and start fighting.",
  },
  {
    name: "PvP Champions Arena",
    ip: "pvp.champions-arena.net",
    rating: 5,
    description:
      "PvP Champions Arena is a high-performance cracked server designed specifically for PVP enthusiasts. With dedicated anti-cheat systems, low latency gameplay, and an active staff team, it stands out as one of the best free PVP Minecraft servers available. Enjoy 1v1 duels, team battles, and Factions-style warfare without needing a paid Minecraft account.",
  },
  {
    name: "HyperCraft Network",
    ip: "play.hypercraft.net",
    rating: 4,
    description:
      "HyperCraft Network offers a diverse PVP experience combining Factions, KitPvP, and Survival modes. It has long been a favorite among cracked Minecraft players for its stable performance and regular content updates. The server is fully accessible without premium accounts and hosts regular events with in-game rewards.",
  },
];

const SEO_LIFESTEAL_SERVERS = [
  {
    name: "LifeSteal SMP",
    ip: "play.lifesteal-smp.net",
    rating: 5,
    description:
      "LifeSteal SMP is the premier cracked Lifesteal server of 2026. In Lifesteal, killing another player steals one of their hearts and adds it to yours, creating intense high-stakes gameplay. This server features a balanced progression system, active seasons, and a passionate community. Cracked players are fully welcome — no premium account required to join the heart-stealing madness.",
  },
  {
    name: "HeartSteal Network",
    ip: "heartsteal.network.gg",
    rating: 4,
    description:
      "HeartSteal Network delivers an exciting cracked Lifesteal experience with custom plugins, seasonal resets, and a competitive leaderboard. Players start with 10 hearts and must fight to keep them — or steal more from enemies. The server supports cracked launchers and is well-maintained with regular anti-cheat updates to keep gameplay fair and fun.",
  },
];

const SEO_SURVIVAL_SERVERS = [
  {
    name: "SurvivalWorld MC",
    ip: "play.survivalworld.gg",
    rating: 4,
    description:
      "SurvivalWorld MC is a dedicated cracked survival server offering a rich vanilla-style experience with quality-of-life plugins. Players can build, explore, trade, and survive in a persistent world. The server features grief protection, land claiming, player shops, and a friendly community. Perfect for Minecraft fans without premium accounts who want a classic survival experience.",
  },
  {
    name: "Vanilla Realms SMP",
    ip: "vanillarealms.smp.gg",
    rating: 4,
    description:
      "Vanilla Realms SMP provides a nearly pure Minecraft survival experience with minimal plugins. Focused on community collaboration, this cracked server has an active playerbase, regular community events, and a strict no-griefing policy enforced by dedicated moderators. Join without a premium account and enjoy survival Minecraft the way it was meant to be played.",
  },
  {
    name: "HyperCraft Survival",
    ip: "survival.hypercraft.net",
    rating: 5,
    description:
      "HyperCraft Survival is the survival wing of the HyperCraft Network, offering an expansive world with custom biomes, dungeons, and boss encounters. Cracked players can join freely and enjoy a feature-rich survival experience with land claiming, player economies, and active seasonal events. One of the best free Minecraft survival servers available in 2026.",
  },
];

const SEO_BEDWARS_SERVERS = [
  {
    name: "BedWars Central",
    ip: "bedwars.central-mc.net",
    rating: 5,
    description:
      "BedWars Central is the best cracked Bedwars server in 2026, offering dozens of unique maps, multiple game modes (Solo, Doubles, Trios, Quads), and a fully-featured ranked mode. The server supports cracked Minecraft clients and has a peak concurrent playerbase in the thousands. Custom shop items, seasonal cosmetics, and regular map additions keep the experience fresh.",
  },
  {
    name: "SkyBlock Paradise (BW Mode)",
    ip: "bedwars.paradise.gg",
    rating: 4,
    description:
      "This server's dedicated Bedwars mode offers a polished and lag-free experience for cracked Minecraft players. With fast matchmaking, a fair anti-cheat system, and 30+ unique maps, it consistently ranks among the top Bedwars servers for free Minecraft users. The server hosts weekly tournaments with special rewards for top performers.",
  },
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
  const [reviews, setReviews] = useState<Review[]>(() => getReviews(serverId));
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
    saveReview(review);
    markReviewed(serverId);
    setReviews(getReviews(serverId));
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

// ─── ServerCard (live listing) ────────────────────────────────────────────────

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

// ─── SEO ServerRow (for curated content sections) ────────────────────────────

function SEOServerRow({
  name,
  ip,
  rating,
  description,
  index,
}: {
  name: string;
  ip: string;
  rating: number;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-start gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h3 className="text-primary font-bold text-base">{name}</h3>
          <StarRating rating={rating} />
        </div>
        <CopyButton ip={ip} />
        <p className="text-muted-foreground text-sm leading-relaxed mt-3">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    seedSampleServersIfEmpty();
    setServers(getServers());
  }, []);

  const filtered = servers.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === "All" || s.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const navLinks = [
    { label: "All Servers", href: "#servers" },
    { label: "PVP", href: "#pvp-servers" },
    { label: "Lifesteal", href: "#lifesteal-servers" },
    { label: "Survival", href: "#survival-servers" },
    { label: "Bedwars", href: "#bedwars-servers" },
    { label: "How to Join", href: "#how-to-join" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        {/* Mobile nav dropdown */}
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
          {/* SEO H1 */}
          <h1
            className="font-pixel text-primary pixel-glow mb-6"
            style={{ fontSize: "clamp(10px, 2.5vw, 16px)", lineHeight: 1.8 }}
          >
            BEST MINECRAFT CRACKED SERVERS 2026
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-xl mx-auto">
            Discover the top free Minecraft cracked servers — no premium account
            needed. Browse PVP, Lifesteal, Survival, and Bedwars servers with
            IPs, ratings, and player reviews.
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

      {/* ===== SEO CONTENT SECTIONS ===== */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-16">
          {/* ── PVP ── */}
          <section id="pvp-servers" aria-labelledby="pvp-heading">
            <h2
              id="pvp-heading"
              className="font-pixel text-primary pixel-glow mb-2"
              style={{ fontSize: "clamp(9px, 2vw, 13px)", lineHeight: 1.8 }}
            >
              BEST PVP CRACKED SERVERS
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              PVP (Player vs Player) servers are where Minecraft combat comes
              alive. The best cracked PVP servers offer competitive arenas,
              ranked systems, and dedicated anti-cheat without requiring a
              premium account. Whether you enjoy 1v1 duels, team-based Factions
              wars, or all-out Anarchy, these servers are fully accessible on
              any cracked Minecraft launcher.
            </p>
            <div className="flex flex-col gap-4">
              {SEO_PVP_SERVERS.map((s, i) => (
                <SEOServerRow key={s.ip} {...s} index={i} />
              ))}
            </div>
          </section>

          {/* ── Lifesteal ── */}
          <section id="lifesteal-servers" aria-labelledby="lifesteal-heading">
            <h2
              id="lifesteal-heading"
              className="font-pixel text-primary pixel-glow mb-2"
              style={{ fontSize: "clamp(9px, 2vw, 13px)", lineHeight: 1.8 }}
            >
              BEST LIFESTEAL SERVERS
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Lifesteal servers add a brutal twist to Minecraft survival: kill
              another player and you steal one of their hearts, adding it
              permanently to your own health pool. Die, and you lose a heart.
              It's a high-stakes game mode that's taken the cracked server
              community by storm in 2026. These servers are completely free to
              join with a cracked Minecraft account.
            </p>
            <div className="flex flex-col gap-4">
              {SEO_LIFESTEAL_SERVERS.map((s, i) => (
                <SEOServerRow key={s.ip} {...s} index={i} />
              ))}
            </div>
          </section>

          {/* ── Survival ── */}
          <section id="survival-servers" aria-labelledby="survival-heading">
            <h2
              id="survival-heading"
              className="font-pixel text-primary pixel-glow mb-2"
              style={{ fontSize: "clamp(9px, 2vw, 13px)", lineHeight: 1.8 }}
            >
              BEST SURVIVAL SERVERS
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Cracked survival servers let you enjoy the full Minecraft survival
              experience — mining, building, crafting, and exploring — without
              paying for a premium account. The best ones feature land
              protection, player economies, active communities, and regular
              content updates. Whether you want vanilla-style gameplay or
              feature-rich SMP servers, these picks are the best cracked
              survival servers in 2026.
            </p>
            <div className="flex flex-col gap-4">
              {SEO_SURVIVAL_SERVERS.map((s, i) => (
                <SEOServerRow key={s.ip} {...s} index={i} />
              ))}
            </div>
          </section>

          {/* ── Bedwars ── */}
          <section id="bedwars-servers" aria-labelledby="bedwars-heading">
            <h2
              id="bedwars-heading"
              className="font-pixel text-primary pixel-glow mb-2"
              style={{ fontSize: "clamp(9px, 2vw, 13px)", lineHeight: 1.8 }}
            >
              BEST BEDWARS SERVERS
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Bedwars is one of the most popular Minecraft mini-games of all
              time — and the best cracked Bedwars servers bring the full
              experience to free players. Protect your bed, eliminate opponents,
              and be the last team standing. These servers offer multiple modes
              (Solo, Duos, Squads), dozens of maps, and ranked matchmaking, all
              accessible without a premium Minecraft account.
            </p>
            <div className="flex flex-col gap-4">
              {SEO_BEDWARS_SERVERS.map((s, i) => (
                <SEOServerRow key={s.ip} {...s} index={i} />
              ))}
            </div>
          </section>

          {/* ── How to Join ── */}
          <section id="how-to-join" aria-labelledby="how-to-join-heading">
            <h2
              id="how-to-join-heading"
              className="font-pixel text-primary pixel-glow mb-2"
              style={{ fontSize: "clamp(9px, 2vw, 13px)", lineHeight: 1.8 }}
            >
              HOW TO JOIN CRACKED SERVERS
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed flex flex-col gap-4">
              <p>
                Cracked Minecraft servers are servers that have disabled
                Mojang's online authentication, meaning you can join them
                without owning an official (premium) Minecraft account. This
                makes them free to play for millions of players worldwide.
                Here's how to join any cracked Minecraft server in three easy
                steps:
              </p>
              <ol className="list-decimal list-inside flex flex-col gap-3 pl-2">
                <li>
                  <strong className="text-foreground">
                    Download a cracked Minecraft launcher.
                  </strong>{" "}
                  Popular options include TLauncher, SKLauncher, and PolyMC.
                  These launchers let you play Minecraft without a paid account.
                  Always download from official sources to stay safe.
                </li>
                <li>
                  <strong className="text-foreground">
                    Create a username.
                  </strong>{" "}
                  When setting up your cracked launcher, you'll create a local
                  username. This is the name other players will see. Choose
                  something unique — you don't need to verify it with Mojang.
                </li>
                <li>
                  <strong className="text-foreground">
                    Copy a server IP and add it to your server list.
                  </strong>{" "}
                  Launch the game, go to Multiplayer, click "Add Server", and
                  paste the IP address from any server listed above. Hit "Done"
                  and then connect. That's it!
                </li>
              </ol>
              <p>
                <strong className="text-foreground">
                  Recommended Minecraft version:
                </strong>{" "}
                Most cracked servers support Minecraft Java Edition 1.8 through
                1.21. Some servers also support Bedrock Edition. Check each
                server's website or Discord for the exact supported versions
                before joining.
              </p>
              <p>
                <strong className="text-foreground">Is it safe?</strong> Playing
                on cracked servers is generally safe as long as you use a
                reputable launcher and don't share personal information. The
                servers listed on this site are well-moderated and maintained by
                active communities.
              </p>
              <p>
                <strong className="text-foreground">
                  Tips for new players:
                </strong>{" "}
                Start with Survival or Mini-Games servers if you're new to
                multiplayer. PVP and Lifesteal servers can be intense for
                beginners. Most servers have a tutorial or starting area — take
                time to read the rules before diving in.
              </p>
            </div>
          </section>
        </div>
      </div>

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
