import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType } from "discord.js"
import { prisma } from "@/database/prisma"

export const MHWIRemoveHunt: Command = {
  name: "mhwi-remove-hunt",
  description: "Supprimer un temps de chasse depuis un hash",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      "name": "hash",
      "description": "Le hash du temps de chasse à supprimer",
      "type": ApplicationCommandOptionType.String,
      "required": true
    },
  ],
  run: async (_, interaction: CommandInteraction) => {

    // No db, nothing we can do about it
    if(!prisma) {
      await interaction.followUp({
        ephemeral: true,
        content: "Erreur : Erreur interne du bot."
      })
      return
    }

    // Get the options values
    const current_hash_string = (interaction.options.get('hash')?.value || "").toString()

    await prisma.mHWIMonsterKill.deleteMany({
      where: {
        id: current_hash_string,
        user_id: interaction.user.id,
      }
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: "Votre hash a été correctement supprimé."
    });
  }
}