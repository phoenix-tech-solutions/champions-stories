// Web server entry point

import {
    serveDir,
    serveFile,
} from "https://deno.land/std@0.224.0/http/file_server.ts";

const PORT = Number(Deno.env.get("PORT")) || 8000;

async function handler(req: Request): Promise<Response> {
    // 1. Try to serve static assets from ./dist
    const res = await serveDir(req, {
        fsRoot: "./app/dist",
        urlRoot: "",
        showDirListing: false,
        quiet: true,
    });

    // 2. If no file found, serve index.html for SPA routing
    if (res.status === 404) {
        return await serveFile(req, "./dist/index.html");
    }

    return res;
}

// 3. Start the HTTP server
Deno.serve({ port: PORT }, handler);
