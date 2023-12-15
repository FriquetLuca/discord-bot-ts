import { type Client } from "discord.js"
import { findTop10SeasonalExterminations } from "@/database/mhwi"
import * as dClient from "@/libraries/discord/client"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"

export function sundaySchedule(client: Client) {
  dClient.scheduler(
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
      const currentSeason = await prisma.mHWISeasons.findFirst({
        select: {
          startedAt: true,
        },
        orderBy: {
          id: 'desc',
        },
        take: 1,
      })

      const nextSeason = currentSeason === null ? new Date() : currentSeason.startedAt

      if(currentSeason === null) {
        await prisma.mHWISeasons.create({
          data: {
            startedAt: nextSeason
          }
        })
      }
      
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

      dClient.sendOnNamedChannels(client, {
        channelName: "mh-kills",
        message: generateTopSeasonalHuntersText(extermination_list)
      })
    }
  )
}
