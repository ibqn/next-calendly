"use server"

import { db } from "@/drizzle/db"
import { EventTable } from "@/drizzle/schema"
import { eventFormSchema, EventFormSchema } from "@/schema/event"
import { auth } from "@clerk/nextjs/server"
import "server-only"
import { EventResponseType } from "./types"
import { and, eq } from "drizzle-orm"

type EventResponse =
  | {
      type: typeof EventResponseType.error
      message: string
    }
  | { type: typeof EventResponseType.success }

export const createEvent = async (unsafeData: EventFormSchema): Promise<EventResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: EventResponseType.error,
      message: "You must be signed in to create an event",
    }
  }

  const { success, data } = eventFormSchema.safeParse(unsafeData)

  if (!success) {
    return { type: EventResponseType.error, message: "Invalid event data" }
  }

  await db.insert(EventTable).values({ ...data, clerkUserId: userId })

  return { type: EventResponseType.success }
}

export const updateEvent = async (unsafeData: EventFormSchema): Promise<EventResponse> => {
  const { userId } = await auth()

  if (userId === null) {
    return {
      type: EventResponseType.error,
      message: "You must be signed in to update an event",
    }
  }

  const { success, data } = eventFormSchema.safeParse(unsafeData)

  if (!success) {
    return { type: EventResponseType.error, message: "Invalid event data" }
  }

  if (!data.id) {
    return { type: EventResponseType.error, message: "Event Id is required" }
  }

  const result = await db
    .update(EventTable)
    .set(data)
    .where(and(eq(EventTable.id, data.id), eq(EventTable.clerkUserId, userId)))

  if (result.count === 0) {
    return { type: EventResponseType.error, message: "Event not found" }
  }

  return { type: EventResponseType.success }
}
