// Bun static server for the built SPA (app/dist).
// - Serves files from app/dist
// - Falls back to index.html for client-side routes

import { join } from "node:path";

const distRoot = join(process.cwd(), "app", "dist");
const indexPath = join(distRoot, "index.html");
const port = Number(process.env["PORT"]) || 8000;

function withContentType(pathname: string, res: Response): Response {
    // Minimal content type fixups for common web assets.
    // Bun infers many types, but we ensure text-based assets are correct.
    const lower = pathname.toLowerCase();
    const headers = new Headers(res.headers);

    if (!headers.has("content-type")) {
        if (lower.endsWith(".css")) headers.set("content-type", "text/css; charset=utf-8");
        else if (lower.endsWith(".js")) headers.set("content-type", "text/javascript; charset=utf-8");
        else if (lower.endsWith(".mjs")) headers.set("content-type", "text/javascript; charset=utf-8");
        else if (lower.endsWith(".html")) headers.set("content-type", "text/html; charset=utf-8");
        else if (lower.endsWith(".svg")) headers.set("content-type", "image/svg+xml");
        else if (lower.endsWith(".json")) headers.set("content-type", "application/json; charset=utf-8");
    }

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

Bun.serve({
    port,
    async fetch(req) {
        const url = new URL(req.url);
        const pathname = url.pathname;
        const filePath = join(distRoot, pathname.replace(/^\//, ""));

        // Try the requested static asset first.
        const asset = Bun.file(filePath);
        if (await asset.exists()) {
            const res = new Response(asset);
            return withContentType(pathname, res);
        }

        // SPA fallback.
        const indexFile = Bun.file(indexPath);
        if (await indexFile.exists()) {
            return withContentType("/index.html", new Response(indexFile));
        }

        return new Response("Build output not found. Run `bun run build` first.", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8" },
        });
    },
});

// eslint-disable-next-line no-console
console.log(`Serving app/dist on http://localhost:${port}`);
