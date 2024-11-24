import { MeetingForm } from "@/components/forms/meeting-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { getValidTimesFromSchedule } from "@/lib/times-from-schedule"
import { clerkClient } from "@clerk/nextjs/server"
import { addMonths, eachMinuteOfInterval, endOfDay, roundToNearestMinutes } from "date-fns"
import { notFound } from "next/navigation"

type Params = Promise<{
  clerkUserId: string
  eventId: string
}>

type Props = Readonly<{
  params: Params
}>

export default async function BookEventPage({ params }: Props) {
  const { clerkUserId: userId, eventId } = await params

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, id, isActive }, { eq, and }) =>
      and(eq(id, eventId), eq(isActive, true), eq(clerkUserId, userId)),
  })

  if (!event) {
    return notFound()
  }

  const clerk = await clerkClient()

  const calenderUser = await clerk.users.getUser(userId)

  const startDate = roundToNearestMinutes(new Date(), { nearestTo: 15, roundingMethod: "ceil" })
  const endDate = endOfDay(addMonths(startDate, 2))

  const timesInOrder = eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 })

  const validTimes = await getValidTimesFromSchedule(timesInOrder, event)

  // console.log("valid times", validTimes)

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>
          {event.name} with {calenderUser.fullName}
        </CardTitle>
        {event.description && <CardDescription>{event.description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <MeetingForm eventId={event.id} userId={userId} validTimes={validTimes} />
      </CardContent>
    </Card>
  )
}
