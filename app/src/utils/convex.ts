import { ConvexClient } from "convex/browser";
import { api } from "../../../convex/_generated/api.js";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
    // eslint-disable-next-line no-console
    console.warn(
        "VITE_CONVEX_URL is not set. Did you run `bunx convex dev`?",
    );
}

const client = new ConvexClient(convexUrl ?? "http://127.0.0.1:3210");

export async function getStory(storySlug: string) {
    return await client.query(api.stories.getBySlug, { slug: storySlug });
}

export async function getRecentStories(n: number) {
    return await client.query(api.stories.listRecent, {
        limit: n,
        withSubtitleOnly: true,
    });
}

export async function getChampionByLegacyId(legacyId: number) {
    return await client.query(api.champions.getByLegacyId, { legacyId });
}

