import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { searchParamsSchema } from "@/schema/timestamp"
import { clerkClient } from "@clerk/nextjs/server"
import { format, fromUnixTime } from "date-fns"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{
    clerkUserId: string
    eventId: string
  }>
  searchParams: Promise<{
    startTime: string
  }>
}

export default async function SuccessBookingPage({ params, searchParams }: Props) {
  const { clerkUserId: userId, eventId } = await params
  const { startTime } = await searchParams

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, id, isActive }, { eq, and }) =>
      and(eq(id, eventId), eq(isActive, true), eq(clerkUserId, userId)),
  })

  if (!event) {
    notFound()
  }

  const { success, data } = searchParamsSchema.safeParse({ startTime })

  if (!success) {
    notFound()
  }

  const startTimeDate = fromUnixTime(data.startTime)

  const clerk = await clerkClient()
  const calenderUser = await clerk.users.getUser(userId)

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>
          Successfully booked {event.name} with {calenderUser.fullName}
        </CardTitle>
        <CardDescription>{startTimeDate ? format(startTimeDate, "MMMM do, yyyy 'at' HH:mm") : null}</CardDescription>
      </CardHeader>

      <CardContent>You should receive an email confirmation shortly. You can close this page now.</CardContent>
    </Card>
  )
}
