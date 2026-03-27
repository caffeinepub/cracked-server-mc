import type { Review } from "../types/server";

// ─── Per-user review tracking (localStorage only) ────────────────────────────
// These are intentionally per-browser: one review per server per visitor.

export function getLocalReviews(serverId: string): Review[] {
  try {
    const raw = localStorage.getItem(`reviews_${serverId}`);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalReview(review: Review): void {
  const existing = getLocalReviews(review.serverId);
  existing.push(review);
  localStorage.setItem(`reviews_${review.serverId}`, JSON.stringify(existing));
}

export function hasReviewed(serverId: string): boolean {
  try {
    const raw = localStorage.getItem("reviewed_servers");
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(serverId);
  } catch {
    return false;
  }
}

export function markReviewed(serverId: string): void {
  try {
    const raw = localStorage.getItem("reviewed_servers");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(serverId)) list.push(serverId);
    localStorage.setItem("reviewed_servers", JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
