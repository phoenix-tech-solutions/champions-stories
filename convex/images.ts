import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const getFileUrl = query({
    args: { fileId: v.id("_storage") },
    handler: async (ctx, { fileId }) => {
        return await ctx.storage.getUrl(fileId);
    },
});

export const attachThumbnail = mutation({
    args: { storySlug: v.string(), fileId: v.id("_storage") },
    handler: async (ctx, { storySlug, fileId }) => {
        const story = await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", storySlug))
            .unique();
        if (!story) throw new Error(`Story not found: ${storySlug}`);
        await ctx.db.patch(story._id, { thumbnailFileId: fileId });
        return story._id;
    },
});

export const attachEmbeddedImage = mutation({
    args: { storySlug: v.string(), index: v.number(), fileId: v.id("_storage") },
    handler: async (ctx, { storySlug, index, fileId }) => {
        if (!Number.isInteger(index) || index < 1) {
            throw new Error(`Invalid embedded image index: ${index}`);
        }

        const story = await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", storySlug))
            .unique();
        if (!story) throw new Error(`Story not found: ${storySlug}`);

        const current = story.embeddedFileIds ?? [];
        const next = current.slice();

        while (next.length < index) next.push(null);
        next[index - 1] = fileId;

        await ctx.db.patch(story._id, { embeddedFileIds: next });
        return story._id;
    },
});

