import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertChampion = mutation({
    args: {
        legacyId: v.number(),
        name: v.string(),
        sport: v.optional(v.string()),
        description: v.optional(v.string()),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("champions")
            .withIndex("by_legacyId", (q) => q.eq("legacyId", args.legacyId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                sport: args.sport,
                description: args.description,
                createdAt: args.createdAt,
            });
            return existing._id;
        }

        return await ctx.db.insert("champions", {
            legacyId: args.legacyId,
            name: args.name,
            sport: args.sport,
            description: args.description,
            createdAt: args.createdAt,
        });
    },
});

export const upsertStory = mutation({
    args: {
        legacyId: v.number(),
        title: v.string(),
        subtitle: v.optional(v.string()),
        body: v.string(),
        slug: v.string(),
        author: v.string(),
        createdAt: v.number(),
        championLegacyId: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                legacyId: args.legacyId,
                title: args.title,
                subtitle: args.subtitle,
                body: args.body,
                author: args.author,
                createdAt: args.createdAt,
                championLegacyId: args.championLegacyId,
            });
            return existing._id;
        }

        return await ctx.db.insert("stories", {
            legacyId: args.legacyId,
            title: args.title,
            subtitle: args.subtitle,
            body: args.body,
            slug: args.slug,
            author: args.author,
            createdAt: args.createdAt,
            championLegacyId: args.championLegacyId,
        });
    },
});

