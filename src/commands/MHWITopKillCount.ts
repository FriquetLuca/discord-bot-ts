import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"
import { builder } from "@/libraries/discord/builder"
import { findTop10KillCount } from "@/database/findTop10KillCount"
import { generateTopKillCountText } from "@/libraries/textGenerator"
import { validElement } from "@/libraries/discord/validators/validElement"

export const MHWITopKillCount = builder
  .commandBuilder()
  .name("mhwi-top-kill-count")
  .description("Listez les plus grand exterminateurs d'un monstre spécifique")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    builder
      .optionCommandBuilder("monster", ApplicationCommandOptionType.String)
      .description("Le nom du monstre chassé")
      .required(true)
      .autocomplete(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("strength", ApplicationCommandOptionType.String)
      .description("La force du monstre tué")
      .addChoices(
        Object
        .getOwnPropertyNames(MHWIMonsterStrength)
        .map(strenght => ({
          "name": getFrenchMHWIMonsterStrength(strenght as MHWIMonsterStrength),
          "value": strenght
        }))
      )
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const current_monster_name = validElement(interaction, "monster", MHWIMonsterSpecies)
    const current_monster_strength = validElement(interaction, "strength", MHWIMonsterStrength)

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }
    
    const all_records = await findTop10KillCount({
      prisma,
      select: {
        monster: current_monster_name,
        strength: current_monster_strength
      }
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopKillCountText(all_records, {
          monster: current_monster_name,
          strength: current_monster_strength
        })
    });
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
