# ZodiacMC

## Current State
HomePage.tsx has a server listing section with:
- Tag-based filters (PVP, Survival, etc.) as pill buttons
- Search bar (name/IP)
- Featured servers sort to top with ★ icon
- Server cards showing: name, IP, tags, description, detail chips, links, YouTube embed, reviews
- No image/logo shown on cards
- No dedicated filters for version, gamemode, server type, or featured toggle

## Requested Changes (Diff)

### Add
- Image/Logo display on server cards (use `server.imageUrl`; show a placeholder if empty)
- Dedicated filter dropdowns/buttons for: Version, Gamemode, Server Type (Premium/Cracked), Featured (toggle)
- Filter state variables for version, gamemode, serverType, featured
- Apply all filters together (AND logic) on top of existing search

### Modify
- ServerCard component: add image/logo section at the top (left side of header or above it)
- Filter section: replace or supplement the ALL_TAGS pill row with the four new filters (version, gamemode, server type, featured)
- `filtered` array computation: incorporate the new filter criteria

### Remove
- Nothing removed; tag filters can stay as secondary filters

## Implementation Plan
1. Add filter state: `filterVersion`, `filterGamemode`, `filterServerType`, `filterFeatured` to HomePage
2. Derive unique version/gamemode values from loaded servers for dropdown options
3. Render filter bar with: search input, Version select, Gamemode select, Server Type select (All/Premium/Cracked), Featured toggle button
4. Update `filtered` logic to apply all four new filters
5. Update ServerCard to show `imageUrl` as a small logo/thumbnail (left side of card header); if no imageUrl, show a Minecraft pickaxe/sword icon placeholder
