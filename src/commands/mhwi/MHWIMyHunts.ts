import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { findTop10MySoloMonster } from "@/database/mhwi"
import { getMHWIMonstersAutocomplete, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"
import { generateMyHuntsText } from "@/libraries/mhwiTextGenerator"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWIMyHunt = chatCommandBuilder()
  .setName("mhwi-my-hunts")
  .setDescription("Listez vos chasses à l'encontre d'un monstre en particulier")
  .addStringOption(option =>
    option.setName("monster")
    .setDescription("Le nom du monstre chassé")
    .setRequired(true)
    .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName("strength")
    .setDescription("La force du monstre tué")
    .addChoices(
      ...Object
      .getOwnPropertyNames(MHWIMonsterStrength)
      .map(strength => ({
        name: getFrenchMHWIMonsterStrength(strength as MHWIMonsterStrength),
        value: strength
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
    
    await interaction.followUp({
      ephemeral: true,
      content: generateMyHuntsText(monster_list, {
        monster: current_monster_name,
        strength: current_monster_strength
      })
    })
  })
  .autocomplete(async ({ interaction }) => {
    const focusedValue = interaction.options.getFocused(true)
    if(focusedValue.name === "monster") {
      await getMHWIMonstersAutocomplete(interaction)
    }
  })
  .build()