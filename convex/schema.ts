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
        bodyEditorJson: v.optional(v.string()),
        slug: v.string(),
        author: v.string(),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        publishedAt: v.optional(v.number()),
        status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.string()),
        deleteReason: v.optional(v.string()),

        championLegacyId: v.optional(v.number()),

        thumbnailFileId: v.optional(v.id("_storage")),
        embeddedFileIds: v.optional(v.array(v.union(v.null(), v.id("_storage")))),
    })
        .index("by_slug", ["slug"])
        .index("by_createdAt", ["createdAt"])
        .index("by_status_and_createdAt", ["status", "createdAt"])
        .index("by_deletedAt", ["deletedAt"]),

    storyVersions: defineTable({
        storyId: v.id("stories"),
        action: v.union(
            v.literal("created"),
            v.literal("updated"),
            v.literal("published"),
            v.literal("unpublished"),
            v.literal("deleted"),
            v.literal("restored"),
        ),
        title: v.string(),
        subtitle: v.optional(v.string()),
        body: v.string(),
        bodyEditorJson: v.optional(v.string()),
        slug: v.string(),
        author: v.string(),
        status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
        thumbnailFileId: v.optional(v.id("_storage")),
        embeddedFileIds: v.optional(v.array(v.union(v.null(), v.id("_storage")))),
        createdAt: v.number(),
        adminName: v.optional(v.string()),
        note: v.optional(v.string()),
    })
        .index("by_storyId_and_createdAt", ["storyId", "createdAt"]),
});
