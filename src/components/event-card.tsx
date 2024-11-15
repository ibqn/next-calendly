import { Event } from "@/drizzle/schema"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration } from "@/lib/format-duration"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CopyEventButton } from "./copy-event-button"
import { cn } from "@/lib/utils"

type Props = {
  event: Event
}

export const EventCard = ({ event }: Props) => {
  return (
    <Card className={cn("flex flex-col", event.isActive || "border-secondary/50")}>
      <CardHeader className={cn(event.isActive || "opacity-50")}>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription>{formatDuration(event.durationInMinutes)}</CardDescription>
      </CardHeader>

      {event.description && (
        <CardContent className={cn(event.isActive || "opacity-50")}>{event.description}</CardContent>
      )}

      <CardFooter className="mt-auto flex justify-end gap-2">
        {event.isActive && <CopyEventButton variant="ghost" eventId={event.id} clerkUserId={event.clerkUserId} />}
        <Button asChild variant="outline">
          <Link href={`/events/${event.id}/edit`}> Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
