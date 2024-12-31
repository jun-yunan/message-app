import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (context, args) => {
        await context.db.insert("users", args);
    },
});

export const get = internalQuery({
    args: {
        clerkId: v.string(),
    },
    handler: async (context, args) => {
        return await context.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});