"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventFormSchema, EventFormSchema } from "@/schema/event"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createEvent, updateEvent } from "@/server/actions/event"
import { redirect } from "next/navigation"
import { EventResponseType } from "@/server/actions/types"
import { Event } from "@/drizzle/schema"

type Props = {
  event?: Event
}

export const EventForm = ({ event }: Props) => {
  const form = useForm<EventFormSchema>({
    defaultValues: {
      id: event?.id ?? undefined,
      name: event?.name ?? "",
      description: event?.description ?? "",
      isActive: event?.isActive ?? true,
      durationInMinutes: event?.durationInMinutes ?? 0,
    },
    resolver: zodResolver(eventFormSchema),
  })

  const onSubmit = form.handleSubmit(async (data) => {
    console.log("form", data)
    const action = event ? updateEvent : createEvent
    const response = await action(data)

    if (response?.type === EventResponseType.error) {
      form.setError("root.actionEvent", { message: response.message })
    }

    if (response?.type === EventResponseType.success) {
      redirect("/events")
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {form.formState.errors.root?.actionEvent && (
          <FormMessage>{form.formState.errors.root.actionEvent.message}</FormMessage>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="event name..." />
              </FormControl>
              <FormDescription>The name users will see when booking</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationInMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input {...field} placeholder="event name..." />
              </FormControl>
              <FormDescription>Event duration in minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="event description..." className="h-32 resize-none" />
              </FormControl>
              <FormDescription>Optional description of the event</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Active</FormLabel>
              </div>

              <FormDescription>Inactive events will not be visible to users to book</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/events">Cancel</Link>
          </Button>

          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  )
}
