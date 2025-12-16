type Env = { DB: D1Database };

export type Authors = z.infer<typeof AuthorsSchema>;
export const CreateAuthorsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  bio: z.string(),
  avatar: z.string().url(),
  active: z.boolean()
});
export type CreateAuthors = z.infer<typeof CreateAuthorsSchema>;

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

export type Comments = z.infer<typeof CommentsSchema>;
export const CreateCommentsSchema = z.object({
  postId: z.string().uuid(),
  authorEmail: z.string().email(),
  authorName: z.string().min(2),
  content: z.string().min(1).max(1000),
  approved: z.boolean()
});
export type CreateComments = z.infer<typeof CreateCommentsSchema>;

// Combined type for all resources
export type Resources = {
  authors: Authors;
  posts: Posts;
  comments: Comments;
};