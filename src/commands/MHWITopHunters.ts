import { ApplicationCommandType } from "discord.js"
import { findTop10Exterminations } from "@/database/findTop10Exterminations"
import { generateTopHuntersText } from "@/libraries/textGenerator"
import { builder } from "@/libraries/discord/builder"

export const MHWITopSeasonalHunters = builder
  .commandBuilder()
  .name("mhwi-top-hunters")
  .description("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {
    const extermination_list = await findTop10Exterminations({ prisma })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopHuntersText(extermination_list)
    });
  })
  .build()
