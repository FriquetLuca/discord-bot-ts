import { ApplicationCommandOptionType, ApplicationCommandType, userMention } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete, getFrenchMHWIMonsterNames } from "@/libraries/mhwi"
import { getTimestamp } from "@/libraries/time"
import * as validator from "@/libraries/discord/validators"
import { commandBuilder, optionCommandBuilder } from "@/libraries/discord/builders"

export const MHWIMyTeamHunt = commandBuilder()
  .name("mhwi-my-team-hunts")
  .description("Listez vos chasses à l'encontre d'un monstre en particulier en équipe")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("monster", ApplicationCommandOptionType.String)
      .description("Le nom du monstre abattu")
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
  .addOption(
    optionCommandBuilder("player2", ApplicationCommandOptionType.User)
      .description("Le joueur n°2")
      .required(true)
  )
  .addOption(
    optionCommandBuilder("player3", ApplicationCommandOptionType.User)
      .description("Le joueur n°3")
  )
  .addOption(
    optionCommandBuilder("player4", ApplicationCommandOptionType.User)
      .description("Le joueur n°4")
  )
  .addOption(
    optionCommandBuilder("exclusive", ApplicationCommandOptionType.Boolean)
      .description("Si activé, uniquement les chasses avec précisément le nombre de joueur donné sera recherché")
  )
  .handleCommand(async ({ interaction, prisma }) => {

    // Get the options values
    const current_monster_name_string = validator.validString(interaction, 'monster')
    const current_monster_strenght_string = validator.validString(interaction, 'strength')
    const current_exclusive_string = interaction.options.get('exclusive')?.value as (boolean | undefined)

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    const current_monster_strenght = MHWIMonsterStrength[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrength] as (keyof typeof MHWIMonsterStrength|undefined);
    const current_exclusive = current_exclusive_string === undefined ? false : current_exclusive_string

    const players = [...new Set([
      interaction.user.id,
      validator.validString(interaction, 'player2'),
      validator.validString(interaction, 'player3'),
      validator.validString(interaction, 'player4')
    ].filter(item => item !== undefined) as string[])]

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    // Not a valid team
    if(players.length < 2) {
      await interaction.reply({
        ephemeral: true,
        content: "Vous ne pouvez pas être en équipe avec vous-même."
      })
      return
    }

    await interaction.deferReply()

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
        .map(item => userMention(item.user_id))
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
      content: `\n**Temps de chasse en équipe (${current_exclusive ? "Exclusif" : "Inclusif"}) : ${getFrenchMHWIMonsterNames(current_monster_name)}${current_monster_strenght === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(current_monster_strenght)})`}**\n${record_list_string}`
    });
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
