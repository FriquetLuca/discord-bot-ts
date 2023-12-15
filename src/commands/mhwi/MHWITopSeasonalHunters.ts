import { findTop10SeasonalExterminations } from "@/database/mhwi"
import { generateTopSeasonalHuntersText } from "@/libraries/mhwiTextGenerator"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWITopSeasonalHunters = chatCommandBuilder()
  .setName("mhwi-top-seasonal-hunters")
  .setDescription("Voyez qui sont les chasseurs les plus actifs de tous et leurs total de kills")
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
