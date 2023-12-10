import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { findTop10MySoloMonster } from "@/database/mhwi"
import { getMHWIMonstersAutocomplete, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"
import { builder } from "@/libraries/discord"
import { generateMyHuntsText } from "@/libraries/mhwiTextGenerator"

export const MHWIMyHunt = builder
  .commandBuilder()
  .name("mhwi-my-hunts")
  .description("Listez vos chasses à l'encontre d'un monstre en particulier")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    builder.optionCommandBuilder("monster", ApplicationCommandOptionType.String)
    .description("Le nom du monstre chassé")
    .required(true)
    .autocomplete(true)
  )
  .addOption(
    builder.optionCommandBuilder("strength", ApplicationCommandOptionType.String)
    .description("La force du monstre tué")
    .addChoices(
      Object
      .getOwnPropertyNames(MHWIMonsterStrength)
      .map(strength => ({
        "name": getFrenchMHWIMonsterStrength(strength as MHWIMonsterStrength),
        "value": strength
      }))
    )
  )
  .handleCommand(async ({ interaction, prisma }) => {
    // Get the options values
    const current_monster_name_string = (interaction.options.get('monster')?.value || "").toString()
    const current_monster_strength_string = interaction.options.get('strength')?.value

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    const current_monster_strength = MHWIMonsterStrength[current_monster_strength_string as unknown as keyof typeof MHWIMonsterStrength] as (keyof typeof MHWIMonsterStrength|undefined);

    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }
    
    await interaction.deferReply()

    const monster_list = await findTop10MySoloMonster({
      prisma,
      select: {
        user_id: interaction.user.id,
        monster: current_monster_name,
        strength: current_monster_strength
      }
    })
    
    await interaction.reply({
      ephemeral: true,
      content: generateMyHuntsText(monster_list, {
        monster: current_monster_name,
        strength: current_monster_strength
      })
    })
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()