export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  fullName: z.string().min(2),
  avatar: z.string().url(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  fullName: z.string().min(2),
  avatar: z.string().url(),
  active: z.boolean()
});

export type CreateUser = z.infer<typeof CreateUserSchema>;