"use server"

import "server-only"
import { ActionResponse } from "./types"
import { meetingActionSchema, MeetingActionSchema } from "@/schema/meeting"
import { db } from "@/drizzle/db"
import { getValidTimesFromSchedule } from "@/lib/times-from-schedule"
import { createCalenderEvent } from "@/server/google-calendar"
import { fromZonedTime } from "date-fns-tz"

export async function createMeeting(unsafeData: MeetingActionSchema): Promise<ActionResponse> {
  const { success, data } = meetingActionSchema.safeParse(unsafeData)

  if (!success) {
    return { type: "error", message: "Invalid data" }
  }

  const event = await db.query.EventTable.findFirst({
    where: ({ id, isActive, clerkUserId }, { eq, and }) =>
      and(eq(id, data.eventId), eq(isActive, true), eq(clerkUserId, data.clerkUserId)),
  })

  if (!event) {
    return { type: "error", message: "Event not found" }
  }

  const startTimeInTimezone = fromZonedTime(data.startTime, data.timezone)

  const validTimes = await getValidTimesFromSchedule([startTimeInTimezone], event)

  if (validTimes.length === 0) {
    return { type: "error", message: "Invalid start time" }
  }

  await createCalenderEvent({
    ...data,
    startTime: startTimeInTimezone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  })

  return { type: "success" }
}
