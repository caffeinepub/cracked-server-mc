# Cracked Server MC

## Current State
Server type: id, name, ip, rating, tags, imageUrl, description (opt), ytVideoUrl (opt), createdAt.
Admin Servers tab: name, ip, rating, tags, ytVideoUrl, description.
Server cards: name, ip copy, tags, description, yt embed, reviews.

## Requested Changes (Diff)

### Add
- New optional server fields: website (URL), discordUrl, version (e.g. 1.8-1.20), maxPlayers, location, gameMode, status (Online/Offline/Unknown)
- Admin form new section with inputs for all new fields
- Server cards display new fields as badges/links
- Backend V3 type with migration from V2

### Modify
- src/frontend/src/types/server.ts
- src/backend/main.mo
- src/frontend/src/pages/AdminPage.tsx
- src/frontend/src/pages/HomePage.tsx

### Remove
- Nothing

## Implementation Plan
1. Update types/server.ts with new optional fields
2. Update backend main.mo: V3 type, migration, updated endpoints
3. Update AdminPage.tsx: form inputs for new fields
4. Update HomePage.tsx: display new fields on cards
