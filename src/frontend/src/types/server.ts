// ─── Server ─────────────────────────────────────────────────────────────────────────────────

export interface Server {
  id: string;
  name: string;
  ip: string;
  rating: number; // 1-5 stars
  tags: string[];
  imageUrl: string;
  createdAt: string; // ISO date string
  description?: string;
  ytVideoUrl?: string;
  website?: string;
  discordUrl?: string;
  version?: string; // e.g. "1.8-1.20"
  maxPlayers?: number;
  location?: string; // e.g. "US", "EU"
  gameMode?: string; // e.g. "Survival", "PvP"
  status?: string; // "Online" | "Offline" | "Unknown"
}

// All available tags for filtering and selection
export const ALL_TAGS = [
  "PVP",
  "Survival",
  "Creative",
  "Skyblock",
  "Factions",
  "Mini-Games",
  "Anarchy",
  "Vanilla",
  "Modded",
  "Roleplay",
] as const;

export type TagName = (typeof ALL_TAGS)[number];

// Shared review type used across pages and storage utilities
export interface Review {
  id: string;
  serverid: string;
  name: string;
  text: string;
  date: string;
}
