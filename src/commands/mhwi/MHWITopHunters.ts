import { findTop10Exterminations } from "@/database/mhwi/findTop10Exterminations"
import { generateTopHuntersText } from "@/libraries/mhwiTextGenerator"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWITopSeasonalHunters = chatCommandBuilder()
  .setName("mhwi-top-hunters")
  .setDescription("Voyez qui sont les chasseurs les plus actifs de tous et leur total de kills")
  .handleCommand(async ({ interaction, prisma }) => {

    await interaction.deferReply()

    const extermination_list = await findTop10Exterminations({ prisma })
    
    await interaction.followUp({
      content: generateTopHuntersText(extermination_list)
    });
  })
  .build()
