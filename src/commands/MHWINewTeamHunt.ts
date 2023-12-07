import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete } from "@/libraries/mhwi"
import { parseTime } from "@/libraries/time/parseTime"
import { validString } from "@/libraries/discord/validators/validString"
import { builder } from "@/libraries/discord/builder"

export const MHWINewTeamHunt = builder
  .commandBuilder()
  .name("mhwi-new-team-hunt")
  .description("Poster un nouveau temps de chasse")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    builder
      .optionCommandBuilder("monster", ApplicationCommandOptionType.String)
      .description("Le nom du monstre abattu")
      .required(true)
      .autocomplete(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("time", ApplicationCommandOptionType.String)
      .description("La durée du combat")
      .required(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("player2", ApplicationCommandOptionType.User)
      .description("Le joueur n°2")
      .required(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("player3", ApplicationCommandOptionType.User)
      .description("Le joueur n°3")
  )
  .addOption(
    builder
      .optionCommandBuilder("player4", ApplicationCommandOptionType.User)
      .description("Le joueur n°4")
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

    // Get the options values
    const current_monster_name_string = validString(interaction, 'monster')
    const current_monster_strenght_string = (interaction.options.get('strength')?.value || "Normal").toString()
    const current_time_string = (interaction.options.get('time')?.value || "").toString()

    // Handle the time checking
    const time_in_seconds = parseTime(current_time_string)

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    
    // Handle the strenght checking
    const current_monster_strength = MHWIMonsterStrength[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrength] as (keyof typeof MHWIMonsterStrength|undefined);

    const players = [...new Set([
      interaction.user.id,
      validString(interaction, 'player2'),
      validString(interaction, 'player3'),
      validString(interaction, 'player4')
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
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
