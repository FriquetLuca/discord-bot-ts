import { findTop10Exterminations } from "@/database/findTop10Exterminations";
import { Client, TextChannel } from "discord.js"
import { prisma } from "@/database/prisma"
import { generateTopHuntersText } from "@/libraries/textGenerator/generateTopHuntersText";

interface RawTime {
  hours: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number,
}

function getNextSunday(time: RawTime) {
  const now = new Date();
  const currentDay = now.getDay();
  // Calculate the number of days until the next Sunday
  const daysUntilSunday = (7 - currentDay) % 7;

  // Set the time to 22:00 (10:00 PM)
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(time.hours);
  nextSunday.setMinutes(time.minutes ?? 0);
  nextSunday.setSeconds(time.seconds ?? 0);
  nextSunday.setMilliseconds(time.milliseconds ?? 0);
  // If the current time is already past 22:00, move to the next Sunday
  if (currentDay === 0 && now.getTime() - nextSunday.getTime() >= 0) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }
  return nextSunday;
}

export function sundaySchedule(client: Client) {
  const now = new Date();
  const nextSunday = getNextSunday({
    hours: 23,
    minutes: 59,
    seconds: 59,
  })
  const timer = nextSunday.getTime() - now.getTime();
  setTimeout(async () => {
    if(!prisma) {
      setTimeout(() => {
        sundaySchedule(client)
      }, 10000)
      return
    }
    const extermination_list = await findTop10Exterminations({ prisma })
    let channel = client.channels.cache.filter(channel => {
      if(channel.isTextBased()) {
        return (channel as TextChannel).name.toLowerCase() === "mh-kills"
      }
      return false
    })
    channel.forEach(channel => {
      (channel as TextChannel).send(generateTopHuntersText(extermination_list))
    })
    sundaySchedule(client)
  }, timer + 500)
}
