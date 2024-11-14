import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"
import { CalendarPlus, CalendarRange } from "lucide-react"
import Link from "next/link"

export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth()

  if (userId === null) {
    return redirectToSignIn()
  }

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  })

  return (
    <>
      <div className="flex items-end gap-4">
        <h1 className="text-3xl font-semibold lg:text-4xl xl:text-5xl">Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="mr-4 size-6" /> New Event
          </Link>
        </Button>
      </div>

      {events.length > 0 ? (
        <h1>Events</h1>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="mx-auto size-10" />
          You do not have any events yet. Create your first event to get started!
        </div>
      )}
    </>
  )
}
