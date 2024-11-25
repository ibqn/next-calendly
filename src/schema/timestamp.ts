import { z } from "zod"
import { getUnixTime } from "date-fns"

export const searchParamsSchema = z.object({
  startTime: z.coerce
    .number()
    .int()
    .positive()
    .refine((value) => value > getUnixTime(new Date())),
})

export type SearchParams = z.infer<typeof searchParamsSchema>
