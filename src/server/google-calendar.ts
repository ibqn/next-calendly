"use server"

import "server-only"
import { google } from "googleapis"
import { clerkClient } from "@clerk/nextjs/server"
import { addMinutes, endOfDay, Interval, startOfDay } from "date-fns"

type EventTime = Interval<Date, Date>

export async function getGoogleCalendarEventTimes(clearUserId: string, options: EventTime): Promise<EventTime[]> {
  const oAuthClient = await getOAuthClient(clearUserId)

  if (!oAuthClient) {
    return []
  }

  const events = await google.calendar("v3").events.list({
    auth: oAuthClient,
    calendarId: "primary",
    singleEvents: true,
    eventTypes: ["default"],
    timeMin: options.start.toISOString(),
    timeMax: options.end.toISOString(),
    maxResults: 2500,
  })

  return (
    events.data.items
      ?.map((event) => {
        if (event.start?.date != null && event.end?.date != null) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          }
        }

        if (event.start?.dateTime != null && event.end?.dateTime != null) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          }
        }

        return null
      })
      .filter((event) => event !== null) ?? []
  )
}

type CalendarEventData = {
  clerkUserId: string
  startTime: Date
  durationInMinutes: number
  eventName: string
  guestName: string
  guestEmail: string
  guestNotes?: string
}

export async function createCalenderEvent({
  clerkUserId,
  startTime,
  durationInMinutes,
  eventName,
  guestEmail,
  guestName,
  guestNotes,
}: CalendarEventData) {
  const oAuthClient = await getOAuthClient(clerkUserId)

  if (!oAuthClient) {
    throw new Error("Failed to obtain Google Calendar OAuth token")
  }

  const clerk = await clerkClient()
  const calendarUser = await clerk.users.getUser(clerkUserId)

  if (calendarUser.primaryEmailAddress == null) {
    throw new Error("User does not have a primary email address")
  }

  const calendarEvent = await google.calendar("v3").events.insert({
    auth: oAuthClient,
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      attendees: [
        {
          email: calendarUser.primaryEmailAddress.emailAddress,
          displayName: calendarUser.fullName,
          responseStatus: "accepted",
        },
        { email: guestEmail, displayName: guestName },
      ],
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: addMinutes(startTime, durationInMinutes).toISOString() },
      summary: `${guestName} + ${calendarUser.fullName}: ${eventName}`,
      description: guestNotes ? `Additional Details: ${guestNotes}` : undefined,
    },
  })

  return calendarEvent.data
}

async function getOAuthClient(clerkUserId: string) {
  const clerk = await clerkClient()

  const response = await clerk.users.getUserOauthAccessToken(clerkUserId, "oauth_google")

  const token = response.data.find((accessToken) => accessToken.provider === "oauth_google")?.token

  if (!token) {
    return null
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oAuth2Client.setCredentials({ access_token: token })
  return oAuth2Client
}
