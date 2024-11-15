"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventFormSchema, EventFormSchema } from "@/schema/event"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Link from "next/link"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"

type Props = {}

export const EventForm = (props: Props) => {
  const form = useForm<EventFormSchema>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      durationInMinutes: 30,
    },
    resolver: zodResolver(eventFormSchema),
  })

  const onSubmit = form.handleSubmit((data) => {
    console.log("form", data)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
