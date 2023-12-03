import { Command } from "@/Command"
import { CommandInteraction, ApplicationCommandType } from "discord.js"
import { prisma } from "@/database/prisma"
import { findTop10Exterminations } from "@/database/findTop10Exterminations"

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
    const monster_list = await findTop10Exterminations({ prisma })
    
    const record_list_string = monster_list.map(record => {
      return `1. <@${record.user_id}> *avec un total de* **${record.total_kills}** *chasses*\n`
    }).join('')
    
    await interaction.followUp({
      ephemeral: true,
      content: `\n**Top des plus grand chasseurs**\n${record_list_string}`
    });
  }
}