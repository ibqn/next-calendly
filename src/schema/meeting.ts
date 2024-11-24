import { startOfDay } from "date-fns"
import { z } from "zod"

export const meetingFormSchema = z.object({
  startTime: z.date().min(new Date(), "Date must be in the future"),
  guestEmail: z.string().email("Invalid email").min(1, "Email is required"),
  guestName: z.string().min(1, "Name is required"),
  guestNotes: z.string().optional(),
  timezone: z.string().min(-12, "Timezone is not in range").max(14, "Timezone is not in range"),
  date: z.date({ required_error: "Date is required" }).min(startOfDay(new Date()), "Date must be in the future"),
})

export type MeetingFormSchema = z.infer<typeof meetingFormSchema>
