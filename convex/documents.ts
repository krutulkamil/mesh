import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

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

    const recursiveArchive = async (documentId: Id<'documents'>) => {
      const children = await ctx.db
        .query('documents')
        .withIndex('by_user_parent', (query) =>
          query.eq('userId', userId).eq('parentDocument', documentId)
        )
        .collect();

      await ctx.db.patch(documentId, {
        isArchived: true,
      });

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    await recursiveArchive(args.id);

    return document;
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

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not Authenticated');
    }

    const userId = identity.subject;

    return await ctx.db
      .query('documents')
      .withIndex('by_user', (query) => query.eq('userId', userId))
      .filter((query) => query.eq(query.field('isArchived'), true))
      .order('desc')
      .collect();
  },
});

export const restore = mutation({
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

    const recursiveRestore = async (documentId: Id<'documents'>) => {
      const children = await ctx.db
        .query('documents')
        .withIndex('by_user_parent', (query) =>
          query.eq('userId', userId).eq('parentDocument', documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<'documents'>> = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);

      if (!parent) {
        throw new Error('Not Found');
      }

      if (parent.userId !== userId) {
        throw new Error('Unauthorized');
      }

      if (parent.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    await recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
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

    return await ctx.db.delete(args.id);
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not Authenticated');
    }

    const userId = identity.subject;

    return await ctx.db
      .query('documents')
      .withIndex('by_user', (query) => query.eq('userId', userId))
      .filter((query) => query.eq(query.field('isArchived'), false))
      .order('desc')
      .collect();
  },
});
