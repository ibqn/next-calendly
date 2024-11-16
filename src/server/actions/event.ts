"use server"

import { db } from "@/drizzle/db"
import { EventTable } from "@/drizzle/schema"
import { eventFormSchema, EventFormSchema } from "@/schema/event"
import { auth } from "@clerk/nextjs/server"
import "server-only"
import { ActionResponseType, ActionResponse } from "./types"
import { and, eq } from "drizzle-orm"

export const createEvent = async (unsafeData: EventFormSchema): Promise<ActionResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: ActionResponseType.error,
      message: "You must be signed in to create an event",
    }
  }

  const { success, data } = eventFormSchema.safeParse(unsafeData)

  if (!success) {
    return { type: ActionResponseType.error, message: "Invalid event data" }
  }

  await db.insert(EventTable).values({ ...data, clerkUserId: userId })

  return { type: ActionResponseType.success }
}

export const updateEvent = async (unsafeData: EventFormSchema): Promise<ActionResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: ActionResponseType.error,
      message: "You must be signed in to update an event",
    }
  }

  const { success, data } = eventFormSchema.safeParse(unsafeData)

  if (!success) {
    return { type: ActionResponseType.error, message: "Invalid event data" }
  }

  if (!data.id) {
    return { type: ActionResponseType.error, message: "Event Id is required" }
  }

  const result = await db
    .update(EventTable)
    .set(data)
    .where(and(eq(EventTable.id, data.id), eq(EventTable.clerkUserId, userId)))

  if (result.count === 0) {
    return { type: ActionResponseType.error, message: "Event not found" }
  }

  return { type: ActionResponseType.success }
}

export const deleteEvent = async (eventId?: string): Promise<ActionResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: ActionResponseType.error,
      message: "You must be signed in to update an event",
    }
  }

  if (!eventId) {
    return { type: ActionResponseType.error, message: "Event Id is required" }
  }

  const result = await db.delete(EventTable).where(and(eq(EventTable.id, eventId), eq(EventTable.clerkUserId, userId)))

  if (result.count === 0) {
    return { type: ActionResponseType.error, message: "Event not found" }
  }

  return { type: ActionResponseType.success }
}
