export const CommentsSchema = z.object({
  postId: z.string().uuid(),
  authorEmail: z.string().email(),
  authorName: z.string().min(2),
  content: z.string().min(1).max(1000),
  approved: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Comments = z.infer<typeof CommentsSchema>;

export const CreateCommentsSchema = z.object({
  postId: z.string().uuid(),
  authorEmail: z.string().email(),
  authorName: z.string().min(2),
  content: z.string().min(1).max(1000),
  approved: z.boolean()
});

export type CreateComments = z.infer<typeof CreateCommentsSchema>;