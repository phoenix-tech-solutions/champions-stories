import { loadEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import deno from "@deno/vite-plugin";
import { readFileSync } from "node:fs";
import process from "node:process";

export default ({ mode }: UserConfig) => {
  process.env = { ...process.env, ...loadEnv(mode!, process.cwd(), "") };

  return {
    root: "./app",
    server: {
      port: 3000,
      
      // `/api` is a resource endpoint, not a directory
      // corresponds to the `server` directory
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      deno(),
    ],
    optimizeDeps: {
      include: ["react/jsx-runtime"],
    },
  };
};

