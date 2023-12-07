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

      const n1 = extermination_list[0] as { user_id: string; total_kills: number; } | undefined
      const n2 = extermination_list[1] as { user_id: string; total_kills: number; } | undefined
      const n3 = extermination_list[2] as { user_id: string; total_kills: number; } | undefined

      const all_guilds = await prisma.mHWITopRoles.findMany()
      const guildManager = client.guilds.cache

      all_guilds.forEach(guild => {
        const currentGuild = guildManager.find(g => g.id === guild.guild_id)
        if(currentGuild) {
          currentGuild.members.cache.forEach(member => {
            if(n1?.user_id === member.user.id) {
              if(!member.roles.cache.find(role => role.id === guild.first_id)) {
                member.roles.add(guild.first_id)
              }
            } else if(n2?.user_id === member.user.id) {
              if(!member.roles.cache.find(role => role.id === guild.second_id)) {
                member.roles.add(guild.second_id)
              }
            } else if(n3?.user_id === member.user.id) {
              if(!member.roles.cache.find(role => role.id === guild.third_id)) {
                member.roles.add(guild.third_id)
              }
            } else {
              member.roles.remove(guild.first_id);
              member.roles.remove(guild.second_id);
              member.roles.remove(guild.third_id);
            }
            
          })
        }
      })

      sendOnNamedChannels(client, {
        channelName: "mh-kills",
        message: generateTopSeasonalHuntersText(extermination_list)
      })
    }
  )
}
