import { z } from "zod";

// --- Step 1: Account ---
export const AccountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type AccountFormData = z.infer<typeof AccountSchema>;

// --- Step 2: Profile ---
const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const ProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be at most 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(usernameRegex, "Only letters, numbers, and underscores allowed"),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
  avatarUrl: z
    .union([z.string().url(), z.literal("")])
    .optional(),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;

// --- Step 3: Preferences ---
export const roleEnum = z.enum(["developer", "designer", "manager", "other"]);
export const experienceEnum = z.enum(["junior", "mid", "senior"]);

export const PreferencesSchema = z.object({
  role: roleEnum,
  experience: experienceEnum,
  newsletter: z.boolean(),
  terms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms to continue",
    }),
});

export type PreferencesFormData = z.infer<typeof PreferencesSchema>;

// --- Combined (for type of full form data) ---
export type CombinedFormData = AccountFormData &
  ProfileFormData &
  PreferencesFormData;
