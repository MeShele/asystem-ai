import { z } from "zod";

export const serviceTypes = ["website", "bot", "app", "automation", "custom"] as const;
export const timelines = ["asap", "weeks", "month", "noRush"] as const;
export const budgets = ["range1", "range2", "range3", "range4", "undefined"] as const;
export const contactMethods = ["phoneCall", "whatsapp", "telegramContact", "emailContact"] as const;

export const requestSchema = z.object({
  // Step 1
  serviceType: z.enum(serviceTypes),
  // Step 2 — dynamic details
  details: z.record(z.string(), z.string()).optional(),
  // Step 3
  timeline: z.enum(timelines),
  // Step 4
  budget: z.enum(budgets),
  // Step 5
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  preferredContact: z.enum(contactMethods),
});

export type RequestFormData = z.infer<typeof requestSchema>;
