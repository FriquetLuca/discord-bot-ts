import { Client, TextChannel } from "discord.js"

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
    hours: 22
  })
  const timer = nextSunday.getTime() - now.getTime();
  setTimeout(() => {
    let channel = client.channels.cache.filter(channel => {
      if(channel.isTextBased()) {
        return (channel as TextChannel).name.toLowerCase() === "mh-kills"
      }
      return false
    })
    channel.forEach(channel => {
      (channel as TextChannel).send("test schedule")
    })
    sundaySchedule(client)
  }, timer + 500)
}
