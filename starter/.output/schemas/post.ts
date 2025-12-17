export const PostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(500),
  userId: z.string().uuid(),
  published: z.boolean(),
  publishedAt: z.string().datetime(),
  tags: z.record(z.any()),
  viewCount: z.number().int(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(500),
  userId: z.string().uuid(),
  published: z.boolean(),
  publishedAt: z.string().datetime(),
  tags: z.record(z.any()),
  viewCount: z.number().int(),
  status: z.enum(['draft', 'published', 'archived'])
});

export type CreatePost = z.infer<typeof CreatePostSchema>;