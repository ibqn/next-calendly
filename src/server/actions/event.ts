"use server"

import { db } from "@/drizzle/db"
import { EventTable } from "@/drizzle/schema"
import { eventFormSchema, EventFormSchema } from "@/schema/event"
import { auth } from "@clerk/nextjs/server"
import "server-only"
import { EventResponseType } from "./types"

type CreateEventResponse =
  | {
      type: typeof EventResponseType.error
      message: string
    }
  | { type: typeof EventResponseType.success }

export const createEvent = async (unsafeData: EventFormSchema): Promise<CreateEventResponse> => {
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
