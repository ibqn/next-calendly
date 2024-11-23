import { PublicEventCard } from "@/components/public-event-card"
import { db } from "@/drizzle/db"
import { clerkClient } from "@clerk/nextjs/server"
import { CalendarRange } from "lucide-react"
import { notFound } from "next/navigation"

type Params = Promise<{
  clerkUserId: string
}>

type Props = Readonly<{
  params: Params
}>

export default async function BookingPage({ params }: Props) {
  const { clerkUserId: userId } = await params

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId, isActive }, { eq, and }) => and(eq(clerkUserId, userId), eq(isActive, true)),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  })

  if (events.length === 0) {
    notFound()
  }

  const clerk = await clerkClient()
  const { fullName } = await clerk.users.getUser(userId)

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
      <div className="mb-4 text-4xl font-semibold md:text-5xl">{fullName}</div>

      <div className="mb-6 max-w-sm text-center text-muted-foreground">
        Welcome to my scheduling page. Please follow the instructions below to book an event with me.
      </div>

      {events.length > 0 ? (
        <div className="inline-flex flex-1 flex-wrap gap-4">
          {events.map((event) => (
            <PublicEventCard key={event.id} clerkUserId={userId} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="mx-auto size-10" />
          Author has not created any bookable events yet. Please check back later.
        </div>
      )}
    </div>
  )
}
