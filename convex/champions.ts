import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByLegacyId = query({
    args: { legacyId: v.number() },
    handler: async (ctx, { legacyId }) => {
        const champion = await ctx.db
            .query("champions")
            .withIndex("by_legacyId", (q) => q.eq("legacyId", legacyId))
            .unique();
        return champion ?? null;
    },
});

