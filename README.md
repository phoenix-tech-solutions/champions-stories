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

## Production build + serve

```bash
nix develop -c bun run build
nix develop -c bun run start
```

## Deploy

Convex builds the app so `VITE_CONVEX_URL` points at the production deployment:

```bash
nix develop -c bun run deploy:convex
nix develop -c bun run deploy:cf
```

`.env.production` selects the production Convex deployment. Cloudflare Pages deploys to the `main` branch of the `champions-stories` project, which serves `champions-stories.pages.dev`.

In CI, Convex uses `CONVEX_DEPLOY_KEY` instead of the local `.env.production` file.

GitHub Actions expects these production secrets:

- `CONVEX_DEPLOY_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
