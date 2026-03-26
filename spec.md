# Cracked Server MC

## Current State
All data (servers, announcements, site settings, reviews) is stored in the admin's browser `localStorage`. This means admin changes are isolated to the admin's device and never reach other users — the core bug causing the reported issue.

The backend is an empty Motoko actor (`actor {}`). The frontend uses `src/frontend/src/utils/storage.ts` which reads/writes only to `localStorage`.

## Requested Changes (Diff)

### Add
- Motoko backend with persistent storage for: servers list, site announcement, site settings (heroSubtitle), and player reviews
- Backend API: getServers, addServer, updateServer, deleteServer, getAnnouncement, setAnnouncement, getSiteSettings, saveSiteSettings, getReviews, addReview, deleteReview
- A `lastUpdated` timestamp in backend so the frontend can poll for changes efficiently
- "Publish Changes" button in admin panel that calls backend and shows success/error toast
- Auto-polling on the public homepage (every 30 seconds) so visitors see updates without manual reload
- Confirmation toast after successful publish
- Error handling toast if publish fails

### Modify
- `storage.ts` → replace all localStorage reads/writes with backend actor calls (async)
- `AdminPage.tsx` → all save/update/delete actions call backend; add "Publish Changes" button with confirmation/error states; keep localStorage as fallback for reviews tracking
- `HomePage.tsx` → load servers, announcement, settings from backend on mount; poll for updates every 30s using a `lastUpdated` timestamp check; reviews still stored in localStorage (per-browser intent)
- Sample server seeding: seed only if backend returns empty list (call once from admin or auto-seed on first backend call)

### Remove
- All direct `localStorage.getItem/setItem` calls for server data, announcements, and site settings (reviews remain localStorage for per-user tracking)

## Implementation Plan
1. Generate Motoko backend with full CRUD for servers, announcement, settings, reviews
2. Update `storage.ts` to export async functions wrapping backend actor calls
3. Update `HomePage.tsx` to fetch from backend + poll every 30s
4. Update `AdminPage.tsx` to call backend functions + show publish confirmation/error
5. Validate and deploy
