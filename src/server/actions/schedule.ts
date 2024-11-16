"use server"

import { scheduleFormSchema, ScheduleFormSchema } from "@/schema/schedule"
import { ActionResponse, ActionResponseType } from "./types"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import "server-only"

export const createSchedule = async (unsafeData: ScheduleFormSchema): Promise<ActionResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: ActionResponseType.error,
      message: "You must be signed in to create an event",
    }
  }

  const { success, data } = scheduleFormSchema.safeParse(unsafeData)

  if (!success) {
    return { type: ActionResponseType.error, message: "Invalid event data" }
  }

  const { availabilities, ...scheduleData } = data

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ ...scheduleData, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId,
      set: scheduleData,
    })
    .returning({ id: ScheduleTable.id })

  await db.transaction(async (db) => {
    await db.delete(ScheduleAvailabilityTable).where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId))

    if (availabilities.length > 0) {
      await db
        .insert(ScheduleAvailabilityTable)
        .values(availabilities.map((availability) => ({ ...availability, scheduleId })))
    }
  })

  return { type: ActionResponseType.success }
}
