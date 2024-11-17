import { Event } from "@/drizzle/schema"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration } from "@/lib/format-duration"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  event: Event
  clerkUserId: string
}

export const PublicEventCard = ({ event, clerkUserId }: Props) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription>{formatDuration(event.durationInMinutes)}</CardDescription>
      </CardHeader>

      {event.description && <CardContent>{event.description}</CardContent>}

      <CardFooter className="mt-auto flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/book/${clerkUserId}/${event.id}`}> Book</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
