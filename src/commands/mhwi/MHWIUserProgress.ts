import { findAdvancement } from "@/database/mhwi"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"
import { userMention } from "discord.js"

export const MHWIUserProgress = chatCommandBuilder()
  .setName("mhwi-user-progress")
  .setDescription("Affiche la progression et le rang de chasseur d'un joueur spécifié")
  .addUserOption(option =>
    option.setName("user")
      .setDescription("Le joueur pour lequelle on désire voir la progression")
      .setRequired(true)
  )
  .handleCommand(async ({ interaction, prisma }) => {
    const data = validator(interaction)
      .string("user", true)
      .get()

    await interaction.deferReply()

    const progress = await findAdvancement({
      prisma,
      user_id: data.user,
      server_id: interaction.guildId ?? "",
      title: `Progression de ${userMention(data.user)}`,
    })
    
    await interaction.followUp({
      content: progress
    })
  })
  .build()
