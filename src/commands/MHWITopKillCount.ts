import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/mhwi/getMHWIMonstersAutocomplete"
import { getFrenchMHWIMonsterNames } from "@/mhwi/getFrenchMHWIMonsterNames"

export const MHWITopKillCount: Command = {
  name: "mhwi-top-kill-count",
  description: "Listez les plus grand exterminateurs d'un monstre",
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
    const result = await prisma.mHWIMonsterKill.groupBy({
      by: [ "user_id" ],
      where: {
        monster: current_monster_name,
        strength: current_monster_strenght
      },
    })
    const all_records = await prisma.mHWIMonsterKill.findMany({
      where: {
        monster: current_monster_name,
        strength: current_monster_strenght,
      },
      select: {
        user_id: true,
      }
    })

    const remapRecords = (all_records: { user_id: string; }[]) => {
      const record_map = new Map<string, number>();
      
      all_records.map(record => {
        const current_record = record_map.get(record.user_id)
        if(current_record) {
          record_map.set(record.user_id, current_record + 1)
        } else {
          record_map.set(record.user_id, 1)
        }
      })
      const result: {
        user_id: string
        count: number
      }[] = [];
      for(const current_record of record_map) {
        const [user_id, count] = current_record
        result.push({
          user_id,
          count
        })
      }

      return result
    }

    const top_user_kills_result = remapRecords(all_records)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const record_list_string = top_user_kills_result.map(record => {
      return `1. **${record.count}** (Par <@${record.user_id}>)\n`
    }).join('')
    
    await interaction.followUp({
      ephemeral: true,
      content: `\n**Top des exterminateurs de ${getFrenchMHWIMonsterNames(current_monster_name)}${current_monster_strenght === undefined ? "" : ` (${getFrenchMHWIMonsterStrenght(current_monster_strenght)})`}**\n${record_list_string}`
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}