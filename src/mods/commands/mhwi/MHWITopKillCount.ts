import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"
import { findTop10KillCount } from "@/database/mhwi"
import { generateTopKillCountText } from "@/libraries/mhwiTextGenerator"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import * as validator from "@/libraries/discord/validators"

export const MHWITopKillCount = chatCommandBuilder()
  .setName("mhwi-top-kill-count")
  .setDescription("Listez les plus grand exterminateurs d'un monstre spécifique")
  .addStringOption(option =>
    option.setName("monster")
      .setDescription("Le nom du monstre chassé")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName("strength")
      .setDescription("La force du monstre tué")
      .addChoices(
        ...Object
        .getOwnPropertyNames(MHWIMonsterStrength)
        .map(strenght => ({
          "name": getFrenchMHWIMonsterStrength(strenght as MHWIMonsterStrength),
          "value": strenght
        }))
      )
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const current_monster_name = validator.validElement(interaction, "monster", MHWIMonsterSpecies)
    const current_monster_strength = validator.validElement(interaction, "strength", MHWIMonsterStrength)

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    await interaction.deferReply()
    
    const all_records = await findTop10KillCount({
      prisma,
      select: {
        monster: current_monster_name,
        strength: current_monster_strength
      }
    })
    
    await interaction.followUp({
      content: generateTopKillCountText(all_records, {
          monster: current_monster_name,
          strength: current_monster_strength
        })
    });
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
