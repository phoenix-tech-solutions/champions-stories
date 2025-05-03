import { loadEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import deno from "@deno/vite-plugin";
import process from "node:process";
import tailwindcss from "@tailwindcss/vite";

export default ({ mode }: UserConfig) => {
    process.env = { ...process.env, ...loadEnv(mode!, process.cwd(), "") };

    return {
        root: "./app",
        plugins: [
            react(),
            deno(),
            tailwindcss(),
        ],
        optimizeDeps: {
            include: ["react/jsx-runtime"],
        },
        resolve: {
            alias: {
                "@": new URL("./src/", import.meta.url).pathname,
            },
        },
    };
};
