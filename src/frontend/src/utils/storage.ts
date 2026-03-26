import type { Server } from "../types/server";

// localStorage key for all server data
const STORAGE_KEY = "mc_servers";

/**
 * Sample servers pre-loaded on first visit.
 * These look like real Minecraft servers to make the page feel populated.
 */
const SAMPLE_SERVERS: Server[] = [
  {
    id: "sample-1",
    name: "HyperCraft Network",
    ip: "play.hypercraft.net",
    rating: 5,
    tags: ["Survival", "PVP", "Factions"],
    imageUrl: "https://picsum.photos/seed/hypercraft/400/250",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "sample-2",
    name: "SkyBlock Paradise",
    ip: "skyblock.paradise.gg",
    rating: 4,
    tags: ["Skyblock", "Mini-Games"],
    imageUrl: "https://picsum.photos/seed/skyblock/400/250",
    createdAt: "2026-01-20T14:30:00.000Z",
  },
  {
    id: "sample-3",
    name: "CreativeMC Pro",
    ip: "creative.mcpro.com",
    rating: 4,
    tags: ["Creative", "Vanilla"],
    imageUrl: "https://picsum.photos/seed/creativemc/400/250",
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "sample-4",
    name: "PvP Champions Arena",
    ip: "pvp.champions-arena.net",
    rating: 5,
    tags: ["PVP", "Factions", "Anarchy"],
    imageUrl: "https://picsum.photos/seed/pvparena/400/250",
    createdAt: "2026-02-10T16:45:00.000Z",
  },
  {
    id: "sample-5",
    name: "Vanilla Realms SMP",
    ip: "vanillarealms.smp.gg",
    rating: 3,
    tags: ["Vanilla", "Survival"],
    imageUrl: "https://picsum.photos/seed/vanillarealms/400/250",
    createdAt: "2026-02-18T11:20:00.000Z",
  },
];

/**
 * Load all servers from localStorage.
 * Returns an empty array if no data exists.
 */
export function getServers(): Server[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Server[];
  } catch {
    return [];
  }
}

/**
 * Save all servers to localStorage.
 */
export function saveServers(servers: Server[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
}

/**
 * Seed localStorage with sample servers if no data exists yet.
 * Called on first visit to ensure the page isn't empty.
 */
export function seedSampleServersIfEmpty(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    saveServers(SAMPLE_SERVERS);
  }
}

/**
 * Add a new server to localStorage.
 */
export function addServer(server: Server): void {
  const servers = getServers();
  servers.push(server);
  saveServers(servers);
}

/**
 * Update an existing server in localStorage by id.
 */
export function updateServer(updated: Server): void {
  const servers = getServers();
  const idx = servers.findIndex((s) => s.id === updated.id);
  if (idx !== -1) {
    servers[idx] = updated;
    saveServers(servers);
  }
}

/**
 * Delete a server from localStorage by id.
 */
export function deleteServer(id: string): void {
  const servers = getServers().filter((s) => s.id !== id);
  saveServers(servers);
}
