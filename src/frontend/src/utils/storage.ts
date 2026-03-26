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
  {
    id: "sample-6",
    name: "LifeSteal SMP",
    ip: "play.lifesteal-smp.net",
    rating: 5,
    tags: ["Lifesteal", "PVP", "Survival"],
    imageUrl: "https://picsum.photos/seed/lifesteal/400/250",
    createdAt: "2026-02-20T09:00:00.000Z",
  },
  {
    id: "sample-7",
    name: "BedWars Central",
    ip: "bedwars.central-mc.net",
    rating: 5,
    tags: ["Bedwars", "Mini-Games"],
    imageUrl: "https://picsum.photos/seed/bedwars/400/250",
    createdAt: "2026-02-22T12:00:00.000Z",
  },
  {
    id: "sample-8",
    name: "CrackPvP Universe",
    ip: "play.crackpvp.net",
    rating: 4,
    tags: ["PVP", "Factions"],
    imageUrl: "https://picsum.photos/seed/crackpvp/400/250",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "sample-9",
    name: "SurvivalWorld MC",
    ip: "play.survivalworld.gg",
    rating: 4,
    tags: ["Survival", "Vanilla"],
    imageUrl: "https://picsum.photos/seed/survivalworld/400/250",
    createdAt: "2026-03-05T08:00:00.000Z",
  },
  {
    id: "sample-10",
    name: "HeartSteal Network",
    ip: "heartsteal.network.gg",
    rating: 4,
    tags: ["Lifesteal", "PVP"],
    imageUrl: "https://picsum.photos/seed/heartsteal/400/250",
    createdAt: "2026-03-10T11:00:00.000Z",
  },
];

export function getServers(): Server[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Server[];
  } catch {
    return [];
  }
}

export function saveServers(servers: Server[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
}

export function seedSampleServersIfEmpty(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    saveServers(SAMPLE_SERVERS);
  }
}

export function addServer(server: Server): void {
  const servers = getServers();
  servers.push(server);
  saveServers(servers);
}

export function updateServer(updated: Server): void {
  const servers = getServers();
  const idx = servers.findIndex((s) => s.id === updated.id);
  if (idx !== -1) {
    servers[idx] = updated;
    saveServers(servers);
  }
}

export function deleteServer(id: string): void {
  const servers = getServers().filter((s) => s.id !== id);
  saveServers(servers);
}
