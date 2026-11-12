import { z } from 'zod';

/**
 * Field rules shared by forms, mirroring the backend schemas. Messages are i18n keys; the form
 * fields translate them (ADR 0022).
 */
export const emailField = z
  .string()
  .trim()
  .min(1, 'validation.email.required')
  .max(254, 'validation.email.tooLong')
  .pipe(z.email('validation.email.invalid'));

export const nameField = z
  .string()
  .trim()
  .min(1, 'validation.name.required')
  .min(2, 'validation.name.tooShort')
  .max(120, 'validation.name.tooLong');

/** A password an administrator sets; mirrors the backend passwordSchema (12 to 128 characters). */
export const newPasswordField = z
  .string()
  .min(1, 'validation.newPassword.required')
  .min(12, 'validation.newPassword.tooShort')
  .max(128, 'validation.newPassword.tooLong');

export const roleIdsField = z.array(z.string()).min(1, 'validation.roles.required');

// Mirrors backend apps/social-club-management/donors/phone.ts.
const BD_MOBILE = /^(?:\+?880|0)(1[3-9]\d{8})$/;

/** `017-1234-5678` -> `+8801712345678`; null if it is not a Bangladeshi mobile number. */
export function normalizeBdPhone(value: string): string | null {
  const m = BD_MOBILE.exec(value.replace(/[\s-]/g, ''));
  return m ? `+880${m[1] ?? ''}` : null;
}

/** Bangladeshi mobile number in any common form, sent as +8801XXXXXXXXX. */
export const bdPhoneField = z
  .string()
  .trim()
  .min(1, 'validation.phone.required')
  .transform((v, ctx) => {
    const phone = normalizeBdPhone(v);
    if (!phone) {
      ctx.addIssue({ code: 'custom', message: 'validation.phone.invalid' });
      return z.NEVER;
    }
    return phone;
  });
