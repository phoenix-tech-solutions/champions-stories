import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    champions: defineTable({
        legacyId: v.optional(v.number()),
        name: v.string(),
        sport: v.optional(v.string()),
        description: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_legacyId", ["legacyId"]),

    stories: defineTable({
        legacyId: v.optional(v.number()),
        title: v.string(),
        subtitle: v.optional(v.string()),
        body: v.string(),
        slug: v.string(),
        author: v.string(),
        createdAt: v.number(),

        championLegacyId: v.optional(v.number()),

        thumbnailFileId: v.optional(v.id("_storage")),
        embeddedFileIds: v.optional(v.array(v.union(v.null(), v.id("_storage")))),
    })
        .index("by_slug", ["slug"])
        .index("by_createdAt", ["createdAt"]),
});

