import { ScheduleForm } from "@/components/forms/schedule-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth()

  if (userId === null) {
    return redirectToSignIn()
  }

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: {
      availabilities: {
        orderBy: ({ startTime }, { desc }) => desc(startTime),
      },
    },
  })

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>Define your schedule availability</CardDescription>
      </CardHeader>

      <CardContent>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  )
}
