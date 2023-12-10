import { ApplicationCommandType } from "discord.js"
import { findTop10SeasonalExterminations } from "@/database/mhwi"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"
import { commandBuilder } from "@/libraries/discord/builders"

export const MHWITopSeasonalHunters = commandBuilder()
  .name("mhwi-top-seasonal-hunters")
  .description("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {

    await interaction.deferReply()

    const extermination_list = await findTop10SeasonalExterminations({
      prisma,
      isCurrentSeason: false
    })
    
    await interaction.followUp({
      content: generateTopSeasonalHuntersText(extermination_list)
    });
  })
  .build()
