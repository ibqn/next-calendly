import { EventForm } from "@/components/forms/event-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewEventPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>New Event</CardTitle>
      </CardHeader>

      <CardContent>
        <EventForm />
      </CardContent>
    </Card>
  )
}
