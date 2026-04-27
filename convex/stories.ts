import { query } from "./_generated/server";
import { v } from "convex/values";

function isNotNullish<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const story = await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .unique();

        if (!story) return null;

        const thumbnailUrl = story.thumbnailFileId
            ? await ctx.storage.getUrl(story.thumbnailFileId)
            : null;

        const embeddedUrlsByIndex: Record<number, string> = {};
        const embedded = story.embeddedFileIds ?? [];
        await Promise.all(
            embedded
                .map(async (fileId, idx) => {
                    if (!fileId) return;
                    const url = await ctx.storage.getUrl(fileId);
                    if (!url) return;
                    embeddedUrlsByIndex[idx + 1] = url;
                })
                .filter(isNotNullish),
        );

        return { ...story, thumbnailUrl, embeddedUrlsByIndex };
    },
});

export const listRecent = query({
    args: {
        limit: v.number(),
        withSubtitleOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, { limit, withSubtitleOnly }) => {
        const rows = await ctx.db
            .query("stories")
            .withIndex("by_createdAt")
            .order("desc")
            .take(limit);

        const filtered = withSubtitleOnly ? rows.filter((s) => s.subtitle) : rows;

        const withUrls = await Promise.all(
            filtered.map(async (story) => {
                const thumbnailUrl = story.thumbnailFileId
                    ? await ctx.storage.getUrl(story.thumbnailFileId)
                    : null;
                return { ...story, thumbnailUrl };
            }),
        );

        return withUrls;
    },
});

