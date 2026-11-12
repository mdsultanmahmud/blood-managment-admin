import { z } from 'zod';
import { emailField } from '@/lib/validation';

export const loginSchema = z.object({
  email: emailField,
  // No policy check at sign-in: older passwords may predate the current rules.
  password: z.string().min(1, 'validation.password.required').max(128),
});
export type LoginValues = z.infer<typeof loginSchema>;
