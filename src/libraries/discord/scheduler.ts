import { Client } from "discord.js"
import { prisma } from "@/database/prisma"
import { type PrismaClient } from "@prisma/client";

interface RawTime {
  hours: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number,
}

const scheduleFrequency = {
  "daily": "daily" as "daily",
  "weekly": "weekly" as "weekly",
  "monthly": "monthly" as "monthly",
  "yearly": "yearly" as "yearly",
}
type ScheduleFrequency = keyof typeof scheduleFrequency

const dayName = {
  "sunday": 0,
  "monday": 1,
  "tuesday": 2,
  "wednesday": 3,
  "thursday": 4,
  "friday": 5,
  "saturday": 6
}
type DayName = keyof typeof dayName

const monthName = {
  "january": 0,
  "february": 1,
  "march": 2,
  "april": 3,
  "may": 4,
  "june": 5,
  "july": 6,
  "august": 7,
  "september": 8,
  "october": 9,
  "november": 10,
  "december": 11,
}
type MonthName = keyof typeof monthName


interface FrequencyScheduling {
  frequency: ScheduleFrequency,
  at: RawTime
}

type SomeSchedule<
  T extends FrequencyScheduling
> = T["frequency"] extends "yearly"
? T & { month: MonthName, day: number }
: T["frequency"] extends "weekly"
  ? T & { day: DayName }
  : T["frequency"] extends "monthly"
    ? T & { day: number }
    : T

function getNextSchedule<T extends FrequencyScheduling>(schedule: SomeSchedule<T>) {
  const now = new Date()
  const currentDay = now.getDay()
  switch(schedule.frequency) {
    case "daily":
      const isToday = new Date(now)
      isToday.setHours(schedule.at.hours)
      isToday.setMinutes(schedule.at.minutes ?? 0)
      isToday.setSeconds(schedule.at.seconds ?? 0)
      isToday.setMilliseconds(schedule.at.milliseconds ?? 0)
      if(now.getTime() - isToday.getTime() >= 0) {
        isToday.setDate(isToday.getDate() + 1);
      }
      return isToday
    case "weekly":
      const chosenDay = dayName[(schedule as { day: DayName }).day]
      const daysUntilDay = (7 - currentDay + chosenDay) % 7
      const nextChosenDay = new Date(now)
      nextChosenDay.setDate(now.getDate() + daysUntilDay)
      nextChosenDay.setHours(schedule.at.hours)
      nextChosenDay.setMinutes(schedule.at.minutes ?? 0)
      nextChosenDay.setSeconds(schedule.at.seconds ?? 0)
      nextChosenDay.setMilliseconds(schedule.at.milliseconds ?? 0)
      if (currentDay === chosenDay && now.getTime() - nextChosenDay.getTime() >= 0) {
        nextChosenDay.setDate(nextChosenDay.getDate() + 7)
      }
      return nextChosenDay
    case "monthly":
      throw new Error("Not implemented yet")
    case "yearly":
      throw new Error("Not implemented yet")
  }
}

export function scheduler<T extends FrequencyScheduling>(
  client: Client,
  schedule: SomeSchedule<T>,
  fn: (data: {
    prisma: PrismaClient,
  }) => void,
  retryDBConnect: number = 50
) {
  if(retryDBConnect > 10000000000) return

  const now = new Date();
  const nextSchedule = getNextSchedule(schedule)
  const timer = nextSchedule.getTime() - now.getTime();
  setTimeout(async () => {
    if(!prisma) {
      setTimeout(() => {
        scheduler(client, schedule, fn, retryDBConnect * 2)
      }, retryDBConnect)
      return
    }
    fn({ prisma })
    scheduler(client, schedule, fn)
  }, timer + 500)
}
