import { ApplicationCommandType } from "discord.js"
import { findTop10SeasonalExterminations } from "@/database/mhwi"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"
import { commandBuilder } from "@/libraries/discord/builders"

export const MHWICurrentTopSeasonalHunters = commandBuilder()
  .name("mhwi-current-seasonal-hunters")
  .description("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {
    await interaction.deferReply()
    
    const extermination_list = await findTop10SeasonalExterminations({
      prisma,
      isCurrentSeason: true
    })
    
    await interaction.followUp({
      content: generateTopSeasonalHuntersText(extermination_list, true)
    })
  })
  .build()
