import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/libraries/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/libraries/mhwi/getMHWIMonstersAutocomplete"
import { getTimestamp } from "@/libraries/time/getTimestamp"
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi/getFrenchMHWIMonsterNames"
import { validString } from "@/libraries/discord/validators/validString"
import { mentionUser } from "@/libraries/discord/mentionUser"

export const MHWIMyTeamHunt: Command = {
  name: "mhwi-my-team-hunts",
  description: "Listez vos chasses à l'encontre d'un monstre en particulier en équipe",
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
    },
    {
      "name": "player2",
      "description": "Le joueur n°2",
      "type": ApplicationCommandOptionType.User,
      "required": false
    },
    {
      "name": "player3",
      "description": "Le joueur n°3",
      "type": ApplicationCommandOptionType.User,
      "required": false
    },
    {
      "name": "player4",
      "description": "Le joueur n°4",
      "type": ApplicationCommandOptionType.User,
      "required": false
    },
    {
      "name": "exclusive",
      "description": "Si activé, uniquement les chasses avec précisément le nombre de joueur donné sera recherché",
      "type": ApplicationCommandOptionType.Boolean,
      "required": false
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
    const current_monster_strenght_string = interaction.options.get('strenght')?.value
    const current_exclusive_string = interaction.options.get('exclusive')?.value as (boolean | undefined)


    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    const current_monster_strenght = MHWIMonsterStrenght[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrenght] as (keyof typeof MHWIMonsterStrenght|undefined);
    const current_exclusive = current_exclusive_string === undefined ? false : current_exclusive_string

    const players = [...new Set([
      interaction.user.id,
      validString(interaction, 'player2'),
      validString(interaction, 'player3'),
      validString(interaction, 'player4')
    ].filter(item => item !== undefined) as string[])]

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.followUp({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    // Not a valid team
    if(players.length < 2) {
      await interaction.followUp({
        ephemeral: true,
        content: "Vous ne pouvez pas être en équipe avec vous-même."
      })
      return
    }

    const monster_list = await prisma.mHWIMonsterKillTeam.findMany({
      where: {
        monster: current_monster_name,
        strength: current_monster_strenght,
        members: {
          some: {
            user_id: {
              in: players
            }
          }
        }
      },
      orderBy: {
        kill_time: "asc"
      },
      select: {
        id: true,
        kill_time: true,
        createdAt: true,
        members: {
          select: {
            user_id: true,
          }
        },
      },
    })

    const record_list_string = monster_list
    .filter(monster => {
      const remappedMembers = monster.members.map(member => member.user_id)
      if(current_exclusive && players.length !== remappedMembers.length) {
        return false;
      }
      for(const player of players) {
        if(!remappedMembers.includes(player)) {
          return false;
        }
      }
      return true;
    })
    .slice(0, 10)
    .map(record => {
      return `1. **${getTimestamp(record.kill_time)}** (Par ${record.members
        .map(item => mentionUser(item.user_id))
        .map((item, i) => {
          if(i === record.members.length - 1) {
            return ` et ${item}`
          } else if(i === 0) {
            return item
          }
          return `, ${item}`
        })
        .join('')} le ${record.createdAt.toLocaleDateString()} à ${record.createdAt.toLocaleTimeString()})\n`
    }).join('')
    
    await interaction.followUp({
      ephemeral: true,
      content: `\n**Temps de chasse en équipe (${current_exclusive ? "Exclusif" : "Inclusif"}) : ${getFrenchMHWIMonsterNames(current_monster_name)}${current_monster_strenght === undefined ? "" : ` (${getFrenchMHWIMonsterStrenght(current_monster_strenght)})`}**\n${record_list_string}`
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}