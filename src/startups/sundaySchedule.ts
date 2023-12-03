import { findTop10Exterminations } from "@/database/findTop10Exterminations"
import { Client, TextChannel } from "discord.js"
import { generateTopHuntersText } from "@/libraries/textGenerator/generateTopHuntersText"
import { scheduler } from "@/libraries/discord/scheduler"

export function sundaySchedule(client: Client) {
  scheduler(
    client,
    {
      frequency: "weekly",
      day: "monday",
      at: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    },
    async ({ prisma }) => {
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
    }
  )
}
