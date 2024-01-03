import { missingMonsters, searchAllMonsterKills } from "@/database/mhwi"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength, getRank, monsterRank } from "@/libraries/mhwi"
import { fromRecords } from "@/libraries/sqeul"
import { bold } from "discord.js"
import { type PrismaClient } from "@prisma/client"
import { validator } from "@/libraries/discord/validators"

const allRanks = [ "SSS", "SS", "S", "A", "B", "C", "D", "E", "F" ]

const allMonsters = fromRecords(monsterRank.A)
  .union(monsterRank.B)
  .union(monsterRank.C)
  .union(monsterRank.D)
  .union(monsterRank.E)
  .union(monsterRank.F)
  .union(monsterRank.S)
  .union(monsterRank.SS)
  .union(monsterRank.SSS)
  .get()

const findMissingMonsters = async (currentData: {
  prisma: PrismaClient
  user_id: string
}) => {
  const allKills = await searchAllMonsterKills(currentData)
  return missingMonsters(allKills, allMonsters)
}

export const MHWIRandomizedRankMonster = chatCommandBuilder()
  .setName("mhwi-randomized-rank-monster")
  .setDescription("Obtenez votre objectif de chasse aléatoirement")
  .addStringOption(option =>
    option.setName("rank")
      .setDescription("Le rang pour lequel on désire obtenir un monstre aléatoirement")
      .addChoices(
        ...(allRanks.map(v => ({ "name": getRank(v as any, ""), "value": v })))
      )
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option.setName("onlymissing")
      .setDescription("Ne reprenez que des monstres de votre liste de progrès manquant")
  )
  .handleCommand(async ({ interaction, prisma }) => {

    const data = validator(interaction)
      .bool("onlymissing")
      .in("rank", { SSS: "SSS", SS: "SS", S: "S", A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" }, true)
      .get()
    
    const getMissingChoice = async () => {
      if(data.onlymissing !== true) {
        return allMonsters
      }
      const allKills = await searchAllMonsterKills({
        prisma,
        user_id: interaction.user.id
      })
      return missingMonsters(allKills, monsterRank[data.rank] as typeof allMonsters)
    }

    const missing = await getMissingChoice()
    if(missing.length === 0) {
      await interaction.reply({
        content: "Vous n'avez plus de monstre restant dans votre liste de monstre..."
      })
      return
    }
    const rnd_monster = missing[Math.floor(Math.random() * allMonsters.length)]

    await interaction.reply({
      content: `Affrontez un ${bold(getFrenchMHWIMonsterNames(rnd_monster.monster))} en ${bold(getFrenchMHWIMonsterStrength(rnd_monster.strength))}.`
    })
    
  })
  .build()