# Cover Image Automation (Option C) - Future Work

This document describes the planned automation for cover image processing using GitHub Actions.

## Current State (Option A)

Currently, cover images require manual processing:

1. User enters a cover image URL in the GameEditorModal
2. Game data is saved to Cloudflare KV and committed to GitHub
3. **Manually**, the cover image must be:
   - Downloaded to `static/covers_raw/`
   - Processed with `bun run optimize-covers [game-id]`
   - Committed to the repository

## Future State (Option C)

Automate cover image processing via GitHub Actions.

### Proposed Workflow

1. **User adds/edits a game** with a `coverImageUrl` field (external URL)
2. **On save**, the game data includes:
   ```json
   {
     "id": "game-123",
     "coverImageUrl": "https://example.com/cover.png",
     "coverImageProcessed": false
   }
   ```
3. **GitHub Action triggers** on `games.json` changes
4. **Action workflow**:
   - Parse `games.json` for games where `coverImageProcessed === false`
   - Download each cover image from `coverImageUrl`
   - Run sharp optimization (same as `scripts/optimize-covers-full.ts`)
   - Save to `static/covers/`
   - Update `games.json` to set `coverImageProcessed: true` and `coverImage: "covers/{id}.webp"`
   - Commit and push

### Implementation Steps

1. **Add new fields to Game type**:
   ```typescript
   coverImageUrl?: string | null;  // External URL for raw cover
   coverImageProcessed?: boolean;  // Whether covers have been generated
   ```

2. **Update GameEditorModal** to accept URL input

3. **Create GitHub Action** (`.github/workflows/process-covers.yml`):
   ```yaml
   name: Process Cover Images
   on:
     push:
       paths:
         - 'static/games.json'
   jobs:
     process-covers:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: oven-sh/setup-bun@v1
         - run: bun install
         - run: bun run scripts/process-pending-covers.ts
         - uses: stefanzweifel/git-auto-commit-action@v5
           with:
             commit_message: "chore(covers): process pending cover images"
   ```

4. **Create new script** `scripts/process-pending-covers.ts`:
   - Read `games.json`
   - Filter games where `coverImageProcessed === false` and `coverImageUrl` exists
   - Download images to temp directory
   - Process with sharp (resize to 200w, 300w, 400w WebP)
   - Save to `static/covers/`
   - Update `games.json`

### Considerations

- **Rate limiting**: GitHub Actions have usage limits; batch processing is preferred
- **Image validation**: Verify downloaded images are valid before processing
- **Error handling**: Games with invalid URLs should be flagged, not crash the workflow
- **Caching**: Consider caching node_modules for faster builds

### Estimated Effort

- Game type changes: 1 hour
- GitHub Action workflow: 2 hours
- New processing script: 3 hours
- Testing and refinement: 2 hours

**Total: ~8 hours**
