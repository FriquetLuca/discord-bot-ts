import { findTop10SeasonalExterminations } from "@/database/mhwi"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWICurrentTopSeasonalHunters = chatCommandBuilder()
  .setName("mhwi-current-seasonal-hunters")
  .setDescription("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
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
