import { Command } from "@/Command"
import { CommandInteraction, ApplicationCommandType } from "discord.js"
import { prisma } from "@/database/prisma"

export const MHWIMyHunt: Command = {
  name: "mhwi-top-hunters",
  description: "Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills",
  type: ApplicationCommandType.ChatInput,
  run: async (_, interaction: CommandInteraction) => {

    // No db, nothing we can do about it
    if(!prisma) {
      await interaction.followUp({
        ephemeral: true,
        content: "Erreur : Erreur interne du bot."
      })
      return
    }
    const monster_list = await prisma.$queryRaw`
      WITH combined_kills AS (
        SELECT
          user_id,
          COUNT(*) as solo_kills
        FROM MHWIMonsterKill
        GROUP BY
          user_id

        UNION ALL

        SELECT
            tm.user_id,
            COUNT(*) as solo_kills
          FROM  MHWITeamMembers tm
          JOIN MHWIMonsterKillTeam kt
          ON tm.monsterKillTeamId = kt.id
          GROUP BY tm.user_id
      )

      SELECT user_id, SUM(solo_kills) as total_kills
      FROM combined_kills
      GROUP BY user_id
      ORDER BY total_kills DESC
      LIMIT 10
    ` as {
      user_id: string,
      total_kills: number
    }[]
    
    const record_list_string = monster_list.map(record => {
      return `1. <@${record.user_id}> *avec un total de* **${record.total_kills}** *chasses*\n`
    }).join('')
    
    await interaction.followUp({
      ephemeral: true,
      content: `\n**Top des plus grand chasseurs**\n${record_list_string}`
    });
  }
}