import { chatCommandBuilder } from "@/libraries/discord/builders"
import { findCompletedMonstersInRank, findMissingMonstersInRank } from "@/database/mhwi/findAdvancement"
import { validator } from "@/libraries/discord/validators"
import { bold } from "discord.js"
import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"

const allRanks = [ "SSS", "SS", "S", "A", "B", "C", "D", "E", "F"]

export const MHWIMyRankProgress = chatCommandBuilder()
  .setName("mhwi-my-rank-progress")
  .setDescription("Affiche votre progression pour le rang spécifié")
  .addStringOption(option =>
    option.setName("rank")
      .setDescription("Le rang pour lequel on désire connaître la progression")
      .addChoices(
        ...(allRanks.map(v => ({ "name": v, "value": v })))
      )
      .setRequired(true)
  )
  .handleCommand(async ({ interaction, prisma }) => {
    const data = validator(interaction)
      .in("rank", { SSS: "SSS", SS: "SS", S: "S", A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" }, true)
      .get()
    await interaction.deferReply()
    const missingMon = await findMissingMonstersInRank({
      prisma,
      user_id: interaction.user.id
    }, data.rank)
    const obtainedMon = await findCompletedMonstersInRank({
      prisma,
      user_id: interaction.user.id
    }, data.rank)
    
    await interaction.followUp({
      content: `${bold("Votre progression")} (${obtainedMon.length} / ${obtainedMon.length + missingMon.length})

${bold("Restant")} :
${missingMon.length === 0 ? bold("Aucun") :  missingMon.map(v => `1. ${getFrenchMHWIMonsterNames(v.monster)} (${getFrenchMHWIMonsterStrength(v.strength)})\n`).join("")}

${bold("Vaincu")} :
${obtainedMon.length === 0 ? bold("Aucun") :  obtainedMon.map(v => `1. ${getFrenchMHWIMonsterNames(v.monster)} (${getFrenchMHWIMonsterStrength(v.strength)})\n`).join("")}
`
    })
  })
  .build()
