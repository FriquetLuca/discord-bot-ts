import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete, getFrenchMHWIMonsterNames } from "@/libraries/mhwi"
import { builder } from "@/libraries/discord"

export const MHWISoloCountHunts = builder
  .commandBuilder()
  .name("mhwi-solo-count-hunts")
  .description("Comptez le nombre de fois que vous avez affronté un certain monstre en solo")
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

    // Get the options values
    const current_monster_name_string = (interaction.options.get('monster')?.value || "").toString()
    const current_monster_strenght_string = interaction.options.get('strength')?.value

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    const current_monster_strenght = MHWIMonsterStrength[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrength] as (keyof typeof MHWIMonsterStrength|undefined);

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    await interaction.deferReply()

    const monster_solo_kills = await prisma.mHWIMonsterKill.count({
      where: {
        user_id: interaction.user.id,
        monster: current_monster_name,
        strength: current_monster_strenght
      }
    })
    
    await interaction.reply({
      content: `Vous avez chassé ***${monster_solo_kills}*** **${getFrenchMHWIMonsterNames(current_monster_name)}${current_monster_strenght === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(current_monster_strenght)})`}**`
    })
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
