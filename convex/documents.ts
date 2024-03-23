import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const archive = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not Authenticated');
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error('Not Found');
    }

    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.id, {
      isArchived: true,
    });
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not Authenticated');
    }

    const userId = identity.subject;

    return await ctx.db
      .query('documents')
      .withIndex('by_user_parent', (query) =>
        query.eq('userId', userId).eq('parentDocument', args.parentDocument)
      )
      .filter((query) => query.eq(query.field('isArchived'), false))
      .order('desc')
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not Authenticated');
    }

    const userId = identity.subject;

    return await ctx.db.insert('documents', {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });
  },
});
