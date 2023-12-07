import { ApplicationCommandType } from "discord.js"
import { builder } from "@/libraries/discord/builder"
import { findTop10SeasonalExterminations } from "@/database/findTop10SeasonalExterminations"
import { generateTopSeasonalHuntersText } from "@/libraries/textGenerator"

export const MHWICurrentTopSeasonalHunters = builder
  .commandBuilder()
  .name("mhwi-current-seasonal-hunters")
  .description("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {
    const extermination_list = await findTop10SeasonalExterminations({
      prisma,
      isCurrentSeason: true
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopSeasonalHuntersText(extermination_list, true)
    })
  })
  .build()
