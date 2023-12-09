import { ApplicationCommandType } from "discord.js"
import { builder } from "@/libraries/discord"
import { findTop10SeasonalExterminations } from "@/database/mhwi"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"

export const MHWITopSeasonalHunters = builder
  .commandBuilder()
  .name("mhwi-top-seasonal-hunters")
  .description("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {
    const extermination_list = await findTop10SeasonalExterminations({
      prisma,
      isCurrentSeason: false
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopSeasonalHuntersText(extermination_list)
    });
  })
  .build()
