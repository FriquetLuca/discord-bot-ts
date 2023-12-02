import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/mhwi/getMHWIMonstersAutocomplete"
import { parseTime } from "@/libraries/time/parseTime"

export const MHWINewHunt: Command = {
  name: "mhwi-new-hunt",
  description: "Poster un nouveau temps de chasse",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      "name": "monster",
      "description": "Le nom du monstre abattu",
      "type": ApplicationCommandOptionType.String,
      "required": true,
      "autocomplete": true,
    },
    {
      "name": "time",
      "description": "La durée du combat",
      "type": ApplicationCommandOptionType.String,
      "required": true
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
    },
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

    // Get the options values
    const current_monster_name_string = (interaction.options.get('monster')?.value || "").toString()
    const current_monster_strenght_string = (interaction.options.get('strenght')?.value || "Normal").toString()
    const current_time_string = (interaction.options.get('time')?.value || "").toString()


    // Handle the time checking
    const time_in_seconds = parseTime(current_time_string)

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    
    // Handle the strenght checking
    const current_monster_strength = MHWIMonsterStrenght[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrenght] as (keyof typeof MHWIMonsterStrenght|undefined);

    // Not a valid time
    if(time_in_seconds === null || Number.isNaN(time_in_seconds)) {
      await interaction.followUp({
        ephemeral: true,
        content: "Votre temps n'est pas un temps valide."
      })
      return
    }
    
    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    // Not a valid strenght
    if(current_monster_strength === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "La force du monstre spécifié n'existe pas."
      })
      return
    }

    await prisma.mHWIMonsterKill.create({
      data: {
        user_id: interaction.user.id,
        kill_time: BigInt(time_in_seconds),
        monster: current_monster_name,
        strenght: current_monster_strength
      }
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: "Votre temps a été sauvegardé."
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}