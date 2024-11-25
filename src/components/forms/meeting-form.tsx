"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { meetingFormSchema, MeetingFormSchema } from "@/schema/meeting"
import { format, getUnixTime, isSameDay } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTimezoneOffset } from "@/lib/format-timezone-offset"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { toZonedTime } from "date-fns-tz"
import { Textarea } from "@/components/ui/textarea"
import { createMeeting } from "@/server/actions/meeting"
import { ActionResponseType } from "@/server/actions/types"
import { redirect } from "next/navigation"

type Props = {
  eventId: string
  userId: string
  validTimes: Date[]
}

export const MeetingForm = ({ eventId, userId, validTimes }: Props) => {
  const form = useForm<MeetingFormSchema>({
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestEmail: "",
      guestName: "",
      guestNotes: "",
    },
    resolver: zodResolver(meetingFormSchema),
  })

  const timezone = form.watch("timezone")
  const date = form.watch("date")

  const validTimesInTimezone = validTimes.map((time) => toZonedTime(time, timezone))

  const onSubmit = form.handleSubmit(async (data) => {
    console.log("form", data)

    const response = await createMeeting({ ...data, eventId, clerkUserId: userId })

    if (response?.type === ActionResponseType.error) {
      form.setError("root.actionEvent", { message: response.message })
    }

    if (response?.type === ActionResponseType.success) {
      redirect(`/book/${userId}/${eventId}/success?startTime=${getUnixTime(data.startTime)}`)
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
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone} ({formatTimezoneOffset(timezone)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormDescription>The timezone that the meeting will be scheduled in.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => !validTimesInTimezone.some((time) => isSameDay(date, time))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Choose a date of your booking.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-col">
                <FormLabel>Time</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={(value) => field.onChange(new Date(Date.parse(value)))}
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        className="w-full"
                        placeholder={
                          date == null || timezone == null ? "Select a date/timezone first" : "Select a meeting time"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter((time) => isSameDay(time, date))
                      .map((time) => (
                        <SelectItem key={time.toISOString()} value={time.toISOString()}>
                          {format(time, "HH:mm")}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose a time of your booking.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name..." />
              </FormControl>
              <FormDescription>Your name will be shared with the host of the meeting.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guestEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your mail..." />
              </FormControl>
              <FormDescription>
                Your email will be shared with the host of the meeting for communication purposes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guestNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Your notes..." className="h-32 resize-none" />
              </FormControl>
              <FormDescription>Any additional notes you'd like to share with the host of the meeting.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-2">
          <Button asChild variant="outline" type="button" className="ml-auto">
            <Link href={`/book/${userId}`}>Cancel</Link>
          </Button>

          <Button type="submit">Schedule</Button>
        </div>
      </form>
    </Form>
  )
}
