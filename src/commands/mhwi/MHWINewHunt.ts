import { MHWIMonsterStrength, MHWIMonsterSpecies } from "@prisma/client"
import { getMHWIMonstersAutocomplete, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"
import { parseTime } from "@/libraries/time"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const MHWINewHunt = chatCommandBuilder()
  .setName("mhwi-new-hunt")
  .setDescription("Poster un nouveau temps de chasse")
  .addStringOption(option =>
    option.setName("monster")
      .setDescription("Le nom du monstre abattu")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName("time")
      .setDescription("La durée du combat")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName("strength")
      .setDescription("La force du monstre tué")
      .addChoices(
        ...Object
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
    const current_monster_strenght_string = (interaction.options.get('strength')?.value || "Normal").toString()
    const current_time_string = (interaction.options.get('time')?.value || "").toString()


    // Handle the time checking
    const time_in_seconds = parseTime(current_time_string)

    // Handle the monster checking
    const current_monster_name = MHWIMonsterSpecies[current_monster_name_string as unknown as keyof typeof MHWIMonsterSpecies] as (keyof typeof MHWIMonsterSpecies|undefined);
    
    // Handle the strenght checking
    const current_monster_strength = MHWIMonsterStrength[current_monster_strenght_string as unknown as keyof typeof MHWIMonsterStrength] as (keyof typeof MHWIMonsterStrength|undefined);

    // Not a valid time
    if(time_in_seconds === null || Number.isNaN(time_in_seconds)) {
      await interaction.reply({
        ephemeral: true,
        content: "Votre temps n'est pas un temps valide."
      })
      return
    }
    
    // Not a valid monster
    if(current_monster_name === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "Le monstre spécifié n'existe pas."
      })
      return
    }

    // Not a valid strenght
    if(current_monster_strength === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: "La force du monstre spécifié n'existe pas."
      })
      return
    }

    await interaction.deferReply()

    await prisma.mHWIMonsterKill.create({
      data: {
        user_id: interaction.user.id,
        kill_time: BigInt(time_in_seconds),
        monster: current_monster_name,
        strength: current_monster_strength
      }
    })
    
    await interaction.followUp({
      content: "Votre temps a été sauvegardé."
    });
  })
  .autocomplete(async ({ interaction }) => await getMHWIMonstersAutocomplete("monster", interaction))
  .build()
