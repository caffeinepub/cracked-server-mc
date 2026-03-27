// ─── Server ───────────────────────────────────────────────────────────────────

export interface Server {
  id: string;
  name: string;
  ip: string;
  rating: number; // 1-5 stars
  tags: string[];
  imageUrl: string;
  createdAt: string; // ISO date string
  description?: string; // Optional short description shown on card
  ytVideoUrl?: string; // Optional YouTube video URL
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
