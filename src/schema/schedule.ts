import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { timeToInt } from "@/lib/time-to-int"
import { z } from "zod"

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/
const timeMessage = "Time must be in HH:MM format"

export const scheduleFormSchema = z.object({
  timezone: z.string().min(-12, "Timezone is not in range").max(14, "Timezone is not in range"),
  availabilities: z
    .array(
      z.object({
        startTime: z.string().regex(timeRegex, timeMessage),
        endTime: z.string().regex(timeRegex, timeMessage),
        dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
      })
    )
    .superRefine((availabilities, context) => {
      availabilities.forEach((availability, index) => {
        const overlaps = availabilities.some((otherAvailability, otherIndex) => {
          if (index === otherIndex) {
            return false
          }
          return (
            availability.dayOfWeek === otherAvailability.dayOfWeek &&
            timeToInt(otherAvailability.startTime) < timeToInt(availability.endTime) &&
            timeToInt(otherAvailability.endTime) > timeToInt(availability.startTime)
          )
        })

        if (overlaps) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index],
            message: "Time slots cannot overlap",
          })
        }

        if (timeToInt(availability.startTime) >= timeToInt(availability.endTime)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be after start time",
            path: [index],
          })
        }
      })
    }),
})

export type ScheduleFormSchema = z.infer<typeof scheduleFormSchema>
