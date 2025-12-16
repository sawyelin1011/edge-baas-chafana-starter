export const CommentSchema = z.object({
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  approved: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  approved: z.boolean()
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;