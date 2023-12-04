import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/libraries/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/libraries/mhwi/getMHWIMonstersAutocomplete"
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi/getFrenchMHWIMonsterNames"
import { findTop10KillCount } from "@/database/findTop10KillCount"
import { generateTopKillCountText } from "@/libraries/textGenerator/generateTopKillCountText"
import { validElement } from "@/libraries/discord/validators/validElement"

export const MHWITopKillCount: Command = {
  name: "mhwi-top-kill-count",
  description: "Listez les plus grand exterminateurs d'un monstre spécifique",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      "name": "monster",
      "description": "Le nom du monstre chassé",
      "type": ApplicationCommandOptionType.String,
      "required": true,
      "autocomplete": true,
    },
    {
      "name": "strenght",
      "description": "La force du monstre tué",
      "type": ApplicationCommandOptionType.String,
      "required": false,
      "choices": Object
        .getOwnPropertyNames(MHWIMonsterStrenght)
        .map(strenght => ({
          "name": getFrenchMHWIMonsterStrenght(strenght as MHWIMonsterStrenght),
          "value": strenght
        }))
    }
  ],
  run: async (_, interaction: CommandInteraction) => {

    // No db, nothing we can do about it
    if(!prisma) {
      await interaction.followUp({
        ephemeral: true,
        content: "Erreur : Erreur interne du bot."
      })
      return
    }
    
    const current_monster_name = validElement(interaction, "monster", MHWIMonsterSpecies)
    const current_monster_strenght = validElement(interaction, "strenght", MHWIMonsterStrenght)

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
        strength: current_monster_strenght
      }
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: generateTopKillCountText(all_records, {
          monster: current_monster_name,
          strength: current_monster_strenght
        })
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}