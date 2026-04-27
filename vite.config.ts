import { loadEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import tailwindcss from "@tailwindcss/vite";

export default ({ mode }: UserConfig) => {
    process.env = { ...process.env, ...loadEnv(mode!, process.cwd(), "") };

    return {
        root: "./app",
        server: {
            port: 3000,
        },
        plugins: [
            react(),
            tailwindcss(),
        ],
        optimizeDeps: {
            include: ["react/jsx-runtime", "react/jsx-dev-runtime"],
        },
        resolve: {
            alias: {
                "@": new URL("./src/", import.meta.url).pathname,
            },
            dedupe: ["react", "react-dom"],
        },
    };
};
