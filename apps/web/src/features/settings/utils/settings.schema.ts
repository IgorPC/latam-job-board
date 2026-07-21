import { z } from 'zod';

export const settingsSchema = z.object({
  primaryStack: z
    .array(z.string().trim().min(1).max(40))
    .min(1, 'Add at least 1 primary skill')
    .max(2, 'Primary skills are capped at 2'),
  secondaryStack: z.array(z.string().trim().min(1).max(40)).max(2, 'Secondary skills are capped at 2'),
  jobType: z.enum(['remote', 'relocation', 'both'], { required_error: 'Pick a job type' }),
  latamCountry: z
    .string()
    .trim()
    .min(1, 'Enter a country')
    .max(60)
    .regex(/^[a-zA-Z\s-]+$/, 'Spell the country in English (letters, spaces, hyphens only)'),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
