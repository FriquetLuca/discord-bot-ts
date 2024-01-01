import { chatCommandBuilder } from "@/libraries/discord/builders"
import { findAdvancement } from "@/database/mhwi/findAdvancement"

export const MHWIMyProgress = chatCommandBuilder()
  .setName("mhwi-my-progress")
  .setDescription("Affiche votre progression et votre rang de chasseur")
  .handleCommand(async ({ interaction, prisma }) => {
    await interaction.deferReply()

    const progress = await findAdvancement({
      prisma,
      user_id: interaction.user.id,
      server_id: interaction.guildId ?? ""
    })
    
    await interaction.followUp({
      content: progress
    })
  })
  .build()
