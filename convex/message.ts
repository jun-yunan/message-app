import { mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUserByClerkId } from './_utils';

export const create = mutation({
  args: {
    conversationId: v.id('conversations'),
    type: v.string(),
    content: v.array(v.string()),
    storageId: v.optional(v.id('_storage')),
    formatFile: v.optional(v.string()),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError('Unauthorized');
    }

    const currentUser = await getUserByClerkId({
      context,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError('User not found');
    }

    const membership = await context.db
      .query('conversationMembers')
      .withIndex('by_memberId_conversationId', (q) =>
        q
          .eq('memberId', currentUser._id)
          .eq('conversationId', args.conversationId),
      )
      .unique();

    if (!membership) {
      throw new ConvexError('You are not a member of this conversation');
    }

    const message = await context.db.insert('messages', {
      senderId: currentUser._id,
      storageId: args.storageId,
      formatFile: args.formatFile,
      ...args,
    });

    await context.db.patch(args.conversationId, {
      lastMessageId: message,
    });

    return message;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError('Unauthorized');
    }

    const currentUser = await getUserByClerkId({
      context,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError('User not found');
    }

    const message = await context.db.get(args.messageId);

    if (!message) {
      throw new ConvexError('Message not found');
    }

    if (message.senderId !== currentUser._id) {
      throw new ConvexError('You are not the sender of this message');
    }

    await context.db.delete(args.messageId);
  },
});
