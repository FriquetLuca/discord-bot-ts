import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { commandBuilder, optionCommandBuilder } from "@/libraries/discord/builders"

export const MHWIRemoveHunt = commandBuilder()
  .name("mhwi-remove-hunt")
  .description("Supprimer un temps de chasse depuis un hash")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("hash", ApplicationCommandOptionType.String)
      .description("Le hash du temps de chasse à supprimer")
      .required(true)
  )
  .handleCommand(async ({ interaction, prisma }) => {

    // Get the options values
    const current_hash_string = (interaction.options.get('hash')?.value || "").toString()

    await interaction.deferReply()

    await prisma.mHWIMonsterKill.deleteMany({
      where: {
        id: current_hash_string,
        user_id: interaction.user.id,
      }
    })
    
    await interaction.followUp({
      content: "Votre hash a été correctement supprimé."
    });
  })
  .build()
