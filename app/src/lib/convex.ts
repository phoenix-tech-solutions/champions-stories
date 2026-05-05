import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is required to connect to Convex.");
}

export const convex = new ConvexReactClient(convexUrl);
