/**
 * Server data structure stored in localStorage under key "mc_servers".
 *
 * HOW TO MANUALLY ADD SERVERS VIA BROWSER CONSOLE:
 * 1. Open DevTools > Console
 * 2. Run:
 *    const servers = JSON.parse(localStorage.getItem('mc_servers') || '[]');
 *    servers.push({
 *      id: crypto.randomUUID(),
 *      name: 'My Server Name',
 *      ip: 'play.myserver.net',
 *      rating: 4,
 *      tags: ['Survival', 'PVP'],
 *      imageUrl: 'https://picsum.photos/seed/myserver/400/300',
 *      createdAt: new Date().toISOString()
 *    });
 *    localStorage.setItem('mc_servers', JSON.stringify(servers));
 * 3. Refresh the page.
 */
export interface Server {
  id: string;
  name: string;
  ip: string;
  rating: number; // 1-5 stars
  tags: string[];
  imageUrl: string;
  createdAt: string; // ISO date string
  description?: string; // Optional short description shown on card
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
