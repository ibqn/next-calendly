import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { relations } from "drizzle-orm"
import { boolean, index, integer, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core"

const createdAtUpdatedAt = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const schema = pgSchema("drizzle")

export const EventTable = schema.table(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    durationInMinutes: integer("duration_in_minutes").notNull(),
    clerkUserId: text("clerk_user_id").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...createdAtUpdatedAt,
  },
  (table) => [index("clerkUserIdIndex").on(table.clerkUserId)]
)

export type Event = typeof EventTable.$inferSelect

export const ScheduleTable = schema.table("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  timezone: text("timezone").notNull(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  ...createdAtUpdatedAt,
})

export const scheduleRelations = relations(ScheduleTable, ({ many }) => ({
  availabilities: many(ScheduleAvailabilityTable),
}))

export const scheduleDayOfWeekEnum = schema.enum("day_of_week", DAYS_OF_WEEK_IN_ORDER)

export const ScheduleAvailabilityTable = schema.table(
  "schedule_availabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: "cascade" }),
    startTime: text("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    dayOfWeek: scheduleDayOfWeekEnum("day_of_week").notNull(),
    ...createdAtUpdatedAt,
  },
  (table) => [index("scheduleIdIndex").on(table.scheduleId)]
)

export const ScheduleAvailabilityRelations = relations(ScheduleAvailabilityTable, ({ one }) => ({
  schedule: one(ScheduleTable, {
    fields: [ScheduleAvailabilityTable.scheduleId],
    references: [ScheduleTable.id],
  }),
}))
