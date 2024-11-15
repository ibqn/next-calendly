import { z } from "zod"

export const eventFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  durationInMinutes: z.coerce
    .number()
    .int()
    .positive("Duration must be a positive number")
    .max(60 * 24, "Duration must be less than 24 hours"),
})

export type EventFormSchema = z.infer<typeof eventFormSchema>
