import { Command } from "@/Command"
import { ApplicationCommandOptionType, CommandInteraction, ApplicationCommandType, AutocompleteInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import { MHWIMonsterStrenght, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrenght } from "@/libraries/mhwi/getFrenchMHWIMonsterStrenght"
import { getMHWIMonstersAutocomplete } from "@/libraries/mhwi/getMHWIMonstersAutocomplete"
import { parseTime } from "@/libraries/time/parseTime"
import { validateUser } from "@/libraries/validators/validateUser"

export const MHWINewTeamHunt: Command = {
  name: "mhwi-new-team-hunt",
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
      "name": "player2",
      "description": "Le joueur n°2",
      "type": ApplicationCommandOptionType.User,
      "required": true
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

    const players = [...new Set([
      interaction.user.id,
      validateUser(interaction, 'player2'),
      validateUser(interaction, 'player3'),
      validateUser(interaction, 'player4')
    ].filter(item => item !== undefined) as string[])]

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

    // Not a valid team
    if(players.length < 2) {
      await interaction.followUp({
        ephemeral: true,
        content: "Vous ne pouvez pas être en équipe avec vous-même."
      })
      return
    }

    const new_hunt = await prisma.mHWIMonsterKillTeam.create({
      data: {
        kill_time: BigInt(time_in_seconds),
        monster: current_monster_name,
        strength: current_monster_strength
      }
    })

    players.forEach(async (player) => {
      if(!prisma) return
      await prisma.mHWITeamMembers.create({
        data: {
          user_id: player,
          monsterKillTeamId: new_hunt.id
        }
      })
    })
    
    await interaction.followUp({
      ephemeral: true,
      content: "Votre temps a été sauvegardé."
    });
  },
  autocomplete: async (_, interaction: AutocompleteInteraction) => await getMHWIMonstersAutocomplete("monster", interaction)
}