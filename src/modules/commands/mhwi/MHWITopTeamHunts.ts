import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { findTop10TeamHunt } from "@/database/mhwi/findTop10TeamHunt"
import { generateTopTeamHunts } from "@/libraries/mhwiTextGenerator"
import { builder, validator as v } from "@/libraries/discord"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"

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

    const MonsterNameInput = v.validString(interaction, 'monster') as unknown as keyof typeof MHWIMonsterSpecies
    const MonsterStrengthInput = v.validString(interaction, 'strength') as unknown as keyof typeof MHWIMonsterStrength

    const monsterName = MHWIMonsterSpecies[MonsterNameInput] as (keyof typeof MHWIMonsterSpecies|undefined)
    
    if(monsterName === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    const monsterStrength = MHWIMonsterStrength[MonsterStrengthInput] as (keyof typeof MHWIMonsterStrength|undefined)

    await interaction.deferReply()

    const monster_list = await findTop10TeamHunt({
      prisma,
      select: {
        monster: monsterName,
        strength: monsterStrength
      }
    })
    
    await interaction.reply({
      content: generateTopTeamHunts(monster_list, {
        monster: monsterName,
        strength: monsterStrength
      })
    })
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()