import { type Client } from "discord.js"
import { scheduler } from "@/libraries/time/scheduler"
import { sendOnNamedChannels } from "@/libraries/discord/client/sendOnNamedChannels"
import { findTop10SeasonalExterminations } from "@/database/findTop10SeasonalExterminations"
import { generateTopSeasonalHuntersText } from "@/libraries/textGenerator/generateTopSeasonalHuntersText"

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
      const currentSeason = await prisma.$queryRaw`SELECT startedAt FROM MHWISeasons ORDER BY id DESC LIMIT 1` as { startedAt: Date }[]
      const nextSeason = currentSeason[0].startedAt
      
      await prisma.mHWISeasons.create({
        data: {
          startedAt: new Date(nextSeason.setDate(nextSeason.getDate() + 7))
        }
      })
      
      const extermination_list = await findTop10SeasonalExterminations({
        prisma,
        isCurrentSeason: false,
      })

      sendOnNamedChannels(client, {
        channelName: "mh-kills",
        message: generateTopSeasonalHuntersText(extermination_list)
      })
    }
  )
}
