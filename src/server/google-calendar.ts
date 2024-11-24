"use server"

import "server-only"
import { google } from "googleapis"
import { clerkClient } from "@clerk/nextjs/server"
import { endOfDay, Interval, startOfDay } from "date-fns"

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
