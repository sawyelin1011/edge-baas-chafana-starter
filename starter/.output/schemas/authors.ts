export const AuthorsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  bio: z.string(),
  avatar: z.string().url(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Authors = z.infer<typeof AuthorsSchema>;

export const CreateAuthorsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  bio: z.string(),
  avatar: z.string().url(),
  active: z.boolean()
});

export type CreateAuthors = z.infer<typeof CreateAuthorsSchema>;