import { missingMonsters, searchAllMonsterKills } from "@/database/mhwi"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength, monsterRank } from "@/libraries/mhwi"
import { fromRecords } from "@/libraries/sqeul"
import { bold } from "discord.js"
import { type PrismaClient } from "@prisma/client"
import { validator } from "@/libraries/discord/validators"

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

export const MHWIRandomizedMonster = chatCommandBuilder()
  .setName("mhwi-randomized-monster")
  .setDescription("Obtenez votre objectif de chasse aléatoirement")
  .addBooleanOption(option =>
    option.setName("onlymissing")
      .setDescription("Ne reprenez que des monstres de votre liste de progrès restant")
  )
  .handleCommand(async ({ interaction, prisma }) => {

    const data = validator(interaction)
      .bool("onlymissing")
      .get()

    const getMissingChoice = async () => data.onlymissing !== true ? allMonsters : await findMissingMonsters({
      prisma,
      user_id: interaction.user.id
    })
    const missing = await getMissingChoice()
    if(missing.length === 0) {
      await interaction.reply({
        content: "Vous n'avez plus de monstre restant dans votre liste de monstre..."
      })
    }
    const rnd_monster = missing[Math.floor(Math.random() * allMonsters.length)]

    await interaction.reply({
      content: `Affrontez un ${bold(getFrenchMHWIMonsterNames(rnd_monster.monster))} en ${bold(getFrenchMHWIMonsterStrength(rnd_monster.strength))}.`
    })
    
  })
  .build()