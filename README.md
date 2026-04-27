# champions-stories

This repo is a Vite+React frontend backed by a Convex database (public read) and Convex file storage for story thumbnails + embedded images.

## Dev environment (Nix + direnv)

- `direnv allow`
- `nix develop`

## Run locally

- **Start Convex (local deployment)**:

```bash
nix develop -c bunx convex dev
```

- **Frontend dev server**:

```bash
nix develop -c bun run dev
```

## Seed data

Seeds stories from `stories_rows.csv` into Convex:

```bash
nix develop -c bun run seed /Users/sreysus/Downloads/stories_rows.csv
```

## Migrate images (Supabase Storage → Convex)

Downloads existing public Supabase Storage objects (thumbnails + embedded images) and uploads them into Convex file storage:

```bash
nix develop -c bun run migrate:images
```

## Production build + serve

```bash
nix develop -c bun run build
nix develop -c bun run start
```
