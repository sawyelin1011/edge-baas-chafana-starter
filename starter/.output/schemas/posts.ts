export const PostsSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(500),
  authorId: z.string().uuid(),
  published: z.boolean(),
  publishedAt: z.string().datetime(),
  tags: z.record(z.any()),
  views: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Posts = z.infer<typeof PostsSchema>;

export const CreatePostsSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(500),
  authorId: z.string().uuid(),
  published: z.boolean(),
  publishedAt: z.string().datetime(),
  tags: z.record(z.any()),
  views: z.number().int()
});

export type CreatePosts = z.infer<typeof CreatePostsSchema>;