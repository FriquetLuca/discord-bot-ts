import { findTop10Exterminations } from "@/database/findTop10Exterminations"
import type { Client } from "discord.js"
import { generateTopHuntersText } from "@/libraries/textGenerator/generateTopHuntersText"
import { scheduler } from "@/libraries/time/scheduler"
import { sendOnNamedChannels } from "@/libraries/discord/client/sendOnNamedChannels"

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
      sendOnNamedChannels(client, {
        channelName: "mh-kills",
        message: generateTopHuntersText(extermination_list)
      })
    }
  )
}
