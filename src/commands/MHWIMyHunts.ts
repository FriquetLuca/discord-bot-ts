import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/libraries/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/libraries/mhwi/getMHWIMonstersAutocomplete"
import { getTimestamp } from "@/libraries/time/getTimestamp"
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi/getFrenchMHWIMonsterNames"
import { findTop10MySoloMonster } from "@/database/findTop10MySoloMonster"

export const MHWIMyHunt: Command = {
  name: "mhwi-my-hunts",
  description: "Listez vos chasses à l'encontre d'un monstre en particulier",
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

    // Get the options values
    const current_monster_name_string = (interaction.options.get('monster')?.value || "").toString()
    const current_monster_strenght_string = interaction.options.get('strenght')?.value

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    const current_monster_strenght = MHWIMonsterStrenght[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrenght] as (keyof typeof MHWIMonsterStrenght|undefined);

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    const monster_list = await findTop10MySoloMonster({
      prisma,
      select: {
        user_id: interaction.user.id,
        monster: current_monster_name,
        strength: current_monster_strenght
      }
    })

    const record_list_string = monster_list.map(record => {
      const subStr = (current_monster_strenght === undefined && ` - ${getFrenchMHWIMonsterStrenght(record.strength)}`) ?? ""
      return `1. **${getTimestamp(record.kill_time)}${subStr}** (Hash: *${record.id}*)\n`
    }).join('')
    
    await interaction.followUp({
      ephemeral: true,
      content: `\n**Temps de chasse : ${getFrenchMHWIMonsterNames(current_monster_name)}${current_monster_strenght === undefined ? "" : ` (${getFrenchMHWIMonsterStrenght(current_monster_strenght)})`}**\n${record_list_string}`
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}