import { z } from "zod";

export const australianStates = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
] as const;

export const verifierFormSchema = z.object({
  postcode: z
    .string()
    .min(4, "Postcode must be 4 digits")
    .max(4, "Postcode must be 4 digits")
    .regex(/^\d{4}$/, "Postcode must contain only numbers"),
  suburb: z
    .string()
    .min(1, "Suburb is required")
    .max(100, "Suburb name is too long"),
  state: z.enum(australianStates, {
    errorMap: () => ({ message: "Please select a valid Australian state" }),
  }),
});

export const sourceSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
  category: z.string().optional(),
});

export const locationSchema = z.object({
  id: z.number(),
  location: z.string(),
  postcode: z.number(),
  state: z.string(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  category: z.string().optional(),
});

export const validationResultSchema = z.object({
  isValid: z.boolean(),
  message: z.string(),
  location: locationSchema.optional().nullable(),
});

export const tabStateSchema = z.object({
  activeTab: z.enum(["verifier", "source"]),
  verifierData: z
    .object({
      postcode: z.string(),
      suburb: z.string(),
      state: z.enum(australianStates).optional(),
      lastResult: validationResultSchema.optional(),
    })
    .optional(),
  sourceData: z
    .object({
      query: z.string(),
      category: z.string().optional(),
      results: z.array(locationSchema).optional(),
      selectedLocation: locationSchema.optional(),
    })
    .optional(),
});

export type VerifierForm = z.infer<typeof verifierFormSchema>;
export type SourceSearch = z.infer<typeof sourceSearchSchema>;
export type Location = z.infer<typeof locationSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type TabState = z.infer<typeof tabStateSchema>;
export type AustralianState = (typeof australianStates)[number];
