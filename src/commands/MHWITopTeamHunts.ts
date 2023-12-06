import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { findTop10TeamHunt } from "@/database/findTop10TeamHunt"
import { generateTopTeamHunts } from "@/libraries/textGenerator/generateTopTeamHunts"
import { builder } from "@/libraries/discord/builder"
import * as v from "@/libraries/discord/validators"
import { getFrenchMHWIMonsterStrenght, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"

export const MHWITopTeamHunts = builder
  .commandBuilder()
  .name("mhwi-top-team-hunts")
  .description("Listez les meilleurs temps de chasse d'un monstre en équipe")
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
      .optionCommandBuilder("strenght", ApplicationCommandOptionType.String)
      .description("La force du monstre tué")
      .addChoices(
        Object
        .getOwnPropertyNames(MHWIMonsterStrenght)
        .map(strenght => ({
          "name": getFrenchMHWIMonsterStrenght(strenght as MHWIMonsterStrenght),
          "value": strenght
        }))
      )
  )
  .handleCommand(async ({ interaction, prisma }) => {

    const MonsterNameInput = v.validString(interaction, 'monster') as unknown as keyof typeof MHWIMonsterSpecies
    const MonsterStrengthInput = v.validString(interaction, 'strenght') as unknown as keyof typeof MHWIMonsterStrenght

    const monsterName = MHWIMonsterSpecies[MonsterNameInput] as (keyof typeof MHWIMonsterSpecies|undefined)
    
    if(monsterName === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    const monsterStrength = MHWIMonsterStrenght[MonsterStrengthInput] as (keyof typeof MHWIMonsterStrenght|undefined)

    const monster_list = await findTop10TeamHunt({
      prisma,
      select: {
        monster: monsterName,
        strength: monsterStrength
      }
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopTeamHunts(monster_list, {
        monster: monsterName,
        strength: monsterStrength
      })
    })
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()