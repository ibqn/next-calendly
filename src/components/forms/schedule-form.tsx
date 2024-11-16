"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScheduleWithAvailabilities } from "@/drizzle/schema"
import { Fragment, useTransition } from "react"
import { scheduleFormSchema, ScheduleFormSchema } from "@/schema/schedule"
import { timeToInt } from "@/lib/time-to-int"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTimezoneOffset } from "@/lib/format-timezone-offset"
import { DayOfWeek, DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { PlusIcon, X } from "lucide-react"
import { createSchedule } from "@/server/actions/schedule"

type Props = {
  schedule?: ScheduleWithAvailabilities
}

export const ScheduleForm = ({ schedule }: Props) => {
  const [isDeletePending, startDeleteTransaction] = useTransition()
  const form = useForm<ScheduleFormSchema>({
    defaultValues: {
      timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        schedule?.availabilities.toSorted((a, b) => timeToInt(a.startTime) - timeToInt(b.startTime)) ?? [],
    },
    resolver: zodResolver(scheduleFormSchema),
  })

  const onSubmit = form.handleSubmit(async (data) => {
    console.log("form", data)

    const response = await createSchedule(data)

    if (response?.type === "error") {
      form.setError("root.actionEvent", { message: response.message })
    }

    if (response?.type === "success") {
      console.log("success")
    }
  })

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    control: form.control,
    name: "availabilities",
  })

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (field) => field.dayOfWeek
  )

  const handleAddAvailability = (dayOfWeek: DayOfWeek) => () => {
    console.log("dayOfWeek", dayOfWeek)
    addAvailability({ startTime: "09:00", endTime: "17:00", dayOfWeek })
  }

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

              <FormDescription>The name users will see when booking</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-6">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => {
            return (
              <Fragment key={dayOfWeek}>
                <div className="col-start-1 text-sm font-semibold capitalize" key={dayOfWeek}>
                  {dayOfWeek.substring(0, 3)}
                </div>
                <div className="col-start-2 flex flex-col gap-2">
                  <Button
                    className="size-6 p-1"
                    variant="outline"
                    type="button"
                    onClick={handleAddAvailability(dayOfWeek)}
                  >
                    <PlusIcon className="size-full" />
                  </Button>
                  {groupedAvailabilityFields[dayOfWeek]?.map((field, labelIndex) => {
                    return (
                      <div key={field.id} className="flex flex-col gap-1">
                        <div className="flex flex-row items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`availabilities.${field.index}.startTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="w-24"
                                    {...field}
                                    aria-label={`${dayOfWeek} StartTime ${labelIndex + 1}`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`availabilities.${field.index}.endTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="w-24"
                                    {...field}
                                    aria-label={`${dayOfWeek} EndTime ${labelIndex + 1}`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <Button
                            className="size-6 p-1"
                            variant="destructiveGhost"
                            type="button"
                            disabled={form.formState.isSubmitting || isDeletePending}
                            onClick={() => {
                              startDeleteTransaction(() => removeAvailability(field.index))
                            }}
                          >
                            <X className="size-full" />
                          </Button>
                        </div>

                        <FormMessage>{form.formState.errors.availabilities?.[field.index]?.root?.message}</FormMessage>

                        <FormMessage>
                          {form.formState.errors.availabilities?.[field.index]?.startTime?.message}
                        </FormMessage>

                        <FormMessage>
                          {form.formState.errors.availabilities?.[field.index]?.endTime?.message}
                        </FormMessage>
                      </div>
                    )
                  })}
                </div>
              </Fragment>
            )
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
