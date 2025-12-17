type Env = { DB: D1Database };

export type User = z.infer<typeof UserSchema>;
export const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  fullName: z.string().min(2),
  avatar: z.string().url(),
  active: z.boolean()
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

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

export type Comment = z.infer<typeof CommentSchema>;
export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  approved: z.boolean()
});
export type CreateComment = z.infer<typeof CreateCommentSchema>;

// Combined type for all resources
export type Resources = {
  user: User;
  post: Post;
  comment: Comment;
};