import { EventForm } from "@/components/forms/event-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

type Props = {
  params: {
    eventId: string
  }
}

export default async function EditEventPage({ params }: Props) {
  const { userId, redirectToSignIn } = await auth()

  if (userId === null) {
    return redirectToSignIn()
  }

  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { eq, and }) => and(eq(id, params.eventId), eq(clerkUserId, userId)),
  })

  if (!event) {
    notFound()
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
        <CardDescription>{params.eventId}</CardDescription>
      </CardHeader>

      <CardContent>
        <EventForm event={event} />
      </CardContent>
    </Card>
  )
}
