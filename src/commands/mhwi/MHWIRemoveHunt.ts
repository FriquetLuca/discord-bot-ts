import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWIRemoveHunt = chatCommandBuilder()
  .setName("mhwi-remove-hunt")
  .setDescription("Supprimer un temps de chasse depuis un hash")
  .addStringOption(option =>
    option.setName("hash")
      .setDescription("Le hash du temps de chasse à supprimer")
      .setRequired(true)
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
