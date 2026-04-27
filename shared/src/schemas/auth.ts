import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

export const userCreateSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
  role: z.enum(["admin", "editor"]).default("admin"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
