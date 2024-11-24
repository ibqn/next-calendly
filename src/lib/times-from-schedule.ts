import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { db } from "@/drizzle/db"
import { Event, ScheduleAvailability } from "@/drizzle/schema"
import { getGoogleCalendarEventTimes } from "@/server/google-calendar"
import { addMinutes, areIntervalsOverlapping, getDay, isWithinInterval, setHours, setMinutes } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

function getAvailabilities(
  groupedAvailabilities: Partial<Record<(typeof DAYS_OF_WEEK_IN_ORDER)[number], ScheduleAvailability[]>>,
  date: Date,
  timezone: string
) {
  const dayOfWeek = (getDay(date) + 6) % 7
  const availabilities = groupedAvailabilities[DAYS_OF_WEEK_IN_ORDER[dayOfWeek]]

  if (availabilities == null) {
    return []
  }

  return availabilities.map(({ startTime, endTime }) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    return {
      start: fromZonedTime(setMinutes(setHours(date, startHours), startMinutes), timezone),
      end: fromZonedTime(setMinutes(setHours(date, endHours), endMinutes), timezone),
    }
  })
}

export async function getValidTimesFromSchedule(timesInOrder: Date[], event: Event) {
  const { clerkUserId: userId, durationInMinutes } = event

  const startTime = timesInOrder.at(0)
  const endTime = timesInOrder.at(-1)

  if (startTime == null || endTime == null) {
    return []
  }

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: { availabilities: true },
  })

  if (schedule == null) {
    return []
  }

  const groupedAvailabilities = Object.groupBy(schedule.availabilities, (availability) => availability.dayOfWeek)

  const eventTimes = await getGoogleCalendarEventTimes(event.clerkUserId, { start: startTime, end: endTime })

  return timesInOrder.filter((intervalTime) => {
    const availabilities = getAvailabilities(groupedAvailabilities, intervalTime, schedule.timezone)

    const eventInterval = {
      start: intervalTime,
      end: addMinutes(intervalTime, durationInMinutes),
    }

    return (
      eventTimes.every((eventTime) => {
        return !areIntervalsOverlapping(eventTime, eventInterval)
      }) &&
      availabilities.some((availability) => {
        return isWithinInterval(eventInterval.start, availability) && isWithinInterval(eventInterval.end, availability)
      })
    )
  })
}
