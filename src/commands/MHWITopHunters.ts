import { type Command } from "@/Command"
import { type CommandInteraction, ApplicationCommandType } from "discord.js"
import { prisma } from "@/database/prisma"
import { findTop10Exterminations } from "@/database/findTop10Exterminations"
import { generateTopHuntersText } from "@/libraries/textGenerator/generateTopHuntersText"

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
    const extermination_list = await findTop10Exterminations({ prisma })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopHuntersText(extermination_list)
    });
  }
}