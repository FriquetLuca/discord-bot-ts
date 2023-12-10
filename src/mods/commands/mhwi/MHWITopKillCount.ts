import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"
import { findTop10KillCount } from "@/database/mhwi"
import { generateTopKillCountText } from "@/libraries/mhwiTextGenerator"
import { commandBuilder, optionCommandBuilder } from "@/libraries/discord/builders"
import * as validator from "@/libraries/discord/validators"

export const MHWITopKillCount = commandBuilder()
  .name("mhwi-top-kill-count")
  .description("Listez les plus grand exterminateurs d'un monstre spécifique")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("monster", ApplicationCommandOptionType.String)
      .description("Le nom du monstre chassé")
      .required(true)
      .autocomplete(true)
  )
  .addOption(
    optionCommandBuilder("strength", ApplicationCommandOptionType.String)
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