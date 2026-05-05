import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const statusValidator = v.union(v.literal("draft"), v.literal("published"));
const embeddedFileIdsValidator = v.array(v.union(v.null(), v.id("_storage")));

const storyInputValidator = v.object({
    title: v.string(),
    subtitle: v.optional(v.string()),
    body: v.string(),
    bodyEditorJson: v.optional(v.string()),
    slug: v.string(),
    author: v.string(),
    status: statusValidator,
    thumbnailFileId: v.optional(v.id("_storage")),
    embeddedFileIds: v.optional(embeddedFileIdsValidator),
});

type StoryInput = {
    title: string;
    subtitle?: string;
    body: string;
    bodyEditorJson?: string;
    slug: string;
    author: string;
    status: "draft" | "published";
    thumbnailFileId?: Id<"_storage">;
    embeddedFileIds?: Array<Id<"_storage"> | null>;
};

function requireAdmin(password: string) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
        throw new Error("ADMIN_PASSWORD is not configured in Convex.");
    }
    if (password !== expected) {
        throw new Error("Incorrect admin password.");
    }
}

function normalizeOptionalString(value: string | undefined) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function normalizeSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

function normalizeInput(input: StoryInput): StoryInput {
    const slug = normalizeSlug(input.slug || input.title);
    if (!slug) {
        throw new Error("Add a title before saving this story.");
    }
    if (!input.title.trim()) {
        throw new Error("Add a story title before saving.");
    }
    if (!input.author.trim()) {
        throw new Error("Add the student's name before saving.");
    }
    return {
        ...input,
        title: input.title.trim(),
        subtitle: normalizeOptionalString(input.subtitle),
        body: input.body.trim(),
        bodyEditorJson: normalizeOptionalString(input.bodyEditorJson),
        slug,
        author: input.author.trim(),
    };
}

function storyPatchFromInput(input: StoryInput) {
    return {
        title: input.title,
        ...(input.subtitle ? { subtitle: input.subtitle } : { subtitle: undefined }),
        body: input.body,
        ...(input.bodyEditorJson
            ? { bodyEditorJson: input.bodyEditorJson }
            : { bodyEditorJson: undefined }),
        slug: input.slug,
        author: input.author,
        status: input.status,
        ...(input.thumbnailFileId
            ? { thumbnailFileId: input.thumbnailFileId }
            : { thumbnailFileId: undefined }),
        ...(input.embeddedFileIds
            ? { embeddedFileIds: input.embeddedFileIds }
            : { embeddedFileIds: undefined }),
    };
}

function storyInsertFromInput(input: StoryInput, now: number) {
    return {
        title: input.title,
        ...(input.subtitle ? { subtitle: input.subtitle } : {}),
        body: input.body,
        ...(input.bodyEditorJson ? { bodyEditorJson: input.bodyEditorJson } : {}),
        slug: input.slug,
        author: input.author,
        status: input.status,
        ...(input.thumbnailFileId ? { thumbnailFileId: input.thumbnailFileId } : {}),
        ...(input.embeddedFileIds ? { embeddedFileIds: input.embeddedFileIds } : {}),
        createdAt: now,
        updatedAt: now,
        ...(input.status === "published" ? { publishedAt: now } : {}),
    };
}

async function assertSlugAvailable(
    ctx: QueryCtx | MutationCtx,
    slug: string,
    currentStoryId?: Id<"stories">,
) {
    const existing = await ctx.db
        .query("stories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

    if (existing && existing._id !== currentStoryId) {
        throw new Error(
            "Another story already uses that web address. Try a more specific ending.",
        );
    }
}

function versionSnapshot(
    story: Doc<"stories">,
    action: Doc<"storyVersions">["action"],
    createdAt: number,
    adminName?: string,
    note?: string,
) {
    return {
        storyId: story._id,
        action,
        title: story.title,
        ...(story.subtitle ? { subtitle: story.subtitle } : {}),
        body: story.body,
        ...(story.bodyEditorJson ? { bodyEditorJson: story.bodyEditorJson } : {}),
        slug: story.slug,
        author: story.author,
        ...(story.status ? { status: story.status } : {}),
        ...(story.thumbnailFileId ? { thumbnailFileId: story.thumbnailFileId } : {}),
        ...(story.embeddedFileIds ? { embeddedFileIds: story.embeddedFileIds } : {}),
        createdAt,
        ...(normalizeOptionalString(adminName)
            ? { adminName: normalizeOptionalString(adminName) }
            : {}),
        ...(normalizeOptionalString(note) ? { note: normalizeOptionalString(note) } : {}),
    };
}

async function withStoryUrls(ctx: QueryCtx, story: Doc<"stories">) {
    const thumbnailUrl = story.thumbnailFileId
        ? await ctx.storage.getUrl(story.thumbnailFileId)
        : null;

    const embeddedUrlsByIndex: Record<number, string> = {};
    const embedded = story.embeddedFileIds ?? [];
    await Promise.all(
        embedded.map(async (fileId, idx) => {
            if (!fileId) return;
            const url = await ctx.storage.getUrl(fileId);
            if (!url) return;
            embeddedUrlsByIndex[idx + 1] = url;
        }),
    );

    return { ...story, thumbnailUrl, embeddedUrlsByIndex };
}

export const authenticate = query({
    args: { password: v.string() },
    handler: async (_ctx, { password }) => {
        requireAdmin(password);
        return { ok: true };
    },
});

export const list = query({
    args: { password: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, { password, limit }) => {
        requireAdmin(password);
        const boundedLimit = Math.max(1, Math.min(limit ?? 200, 200));
        const stories = await ctx.db
            .query("stories")
            .withIndex("by_createdAt")
            .order("desc")
            .take(boundedLimit);

        return await Promise.all(stories.map((story) => withStoryUrls(ctx, story)));
    },
});

export const get = query({
    args: { password: v.string(), storyId: v.id("stories") },
    handler: async (ctx, { password, storyId }) => {
        requireAdmin(password);
        const story = await ctx.db.get(storyId);
        if (!story) return null;
        return await withStoryUrls(ctx, story);
    },
});

export const versions = query({
    args: {
        password: v.string(),
        storyId: v.id("stories"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { password, storyId, limit }) => {
        requireAdmin(password);
        const boundedLimit = Math.max(1, Math.min(limit ?? 20, 50));
        return await ctx.db
            .query("storyVersions")
            .withIndex("by_storyId_and_createdAt", (q) => q.eq("storyId", storyId))
            .order("desc")
            .take(boundedLimit);
    },
});

export const getUploadUrl = mutation({
    args: { password: v.string() },
    handler: async (ctx, { password }) => {
        requireAdmin(password);
        return await ctx.storage.generateUploadUrl();
    },
});

export const save = mutation({
    args: {
        password: v.string(),
        storyId: v.optional(v.id("stories")),
        input: storyInputValidator,
        adminName: v.optional(v.string()),
        note: v.optional(v.string()),
    },
    handler: async (ctx, { password, storyId, input, adminName, note }) => {
        requireAdmin(password);
        const now = Date.now();
        const normalized = normalizeInput(input);
        await assertSlugAvailable(ctx, normalized.slug, storyId);

        if (!storyId) {
            const newStoryId = await ctx.db.insert("stories", {
                ...storyInsertFromInput(normalized, now),
            });
            const story = await ctx.db.get(newStoryId);
            if (!story) throw new Error("Unable to load the story after saving.");
            await ctx.db.insert(
                "storyVersions",
                versionSnapshot(story, "created", now, adminName, note),
            );
            return newStoryId;
        }

        const existing = await ctx.db.get(storyId);
        if (!existing) throw new Error("Story not found.");

        const nextPublishedAt = normalized.status === "published"
            ? existing.publishedAt ?? now
            : undefined;

        await ctx.db.patch(storyId, {
            ...storyPatchFromInput(normalized),
            updatedAt: now,
            publishedAt: nextPublishedAt,
        });

        const updated = await ctx.db.get(storyId);
        if (!updated) throw new Error("Unable to load the story after saving.");

        const action = existing.status !== "published" &&
                normalized.status === "published"
            ? "published"
            : existing.status === "published" && normalized.status === "draft"
            ? "unpublished"
            : "updated";

        await ctx.db.insert(
            "storyVersions",
            versionSnapshot(updated, action, now, adminName, note),
        );

        return storyId;
    },
});

export const softDelete = mutation({
    args: {
        password: v.string(),
        storyId: v.id("stories"),
        adminName: v.optional(v.string()),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { password, storyId, adminName, reason }) => {
        requireAdmin(password);
        const story = await ctx.db.get(storyId);
        if (!story) throw new Error("Story not found.");

        const now = Date.now();
        await ctx.db.insert(
            "storyVersions",
            versionSnapshot(story, "deleted", now, adminName, reason),
        );
        await ctx.db.patch(storyId, {
            deletedAt: now,
            deletedBy: normalizeOptionalString(adminName),
            deleteReason: normalizeOptionalString(reason),
            updatedAt: now,
        });
        return storyId;
    },
});

export const restore = mutation({
    args: {
        password: v.string(),
        storyId: v.id("stories"),
        adminName: v.optional(v.string()),
    },
    handler: async (ctx, { password, storyId, adminName }) => {
        requireAdmin(password);
        const story = await ctx.db.get(storyId);
        if (!story) throw new Error("Story not found.");

        const now = Date.now();
        await ctx.db.patch(storyId, {
            deletedAt: undefined,
            deletedBy: undefined,
            deleteReason: undefined,
            updatedAt: now,
        });

        const restored = await ctx.db.get(storyId);
        if (!restored) throw new Error("Unable to load the story after restoring.");
        await ctx.db.insert(
            "storyVersions",
            versionSnapshot(restored, "restored", now, adminName),
        );
        return storyId;
    },
});
