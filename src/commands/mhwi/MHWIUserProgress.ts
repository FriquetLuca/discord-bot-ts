import { rankProgression, searchAllMonsterKills, toPercent } from "@/database/mhwi"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"
import { getHunterRank, getRank, monsterRank } from "@/libraries/mhwi"
import { bold, italic, userMention } from "discord.js"

export const MHWIUserProgress = chatCommandBuilder()
  .setName("mhwi-user-progress")
  .setDescription("Affiche la progression et le rang de chasseur d'un joueur spécifié")
  .addUserOption(option =>
    option.setName("user")
      .setDescription("Le joueur pour lequelle on désire voir la progression")
      .setRequired(true)
  )
  .handleCommand(async ({ interaction, prisma }) => {
    const data = validator(interaction)
      .string("user", true)
      .get()

    await interaction.deferReply()

    const allKills = await searchAllMonsterKills({ prisma, user_id: data.user })
    const progress_SSS = rankProgression(allKills, monsterRank.SSS)
    const progress_SS = rankProgression(allKills, monsterRank.SS)
    const progress_S = rankProgression(allKills, monsterRank.S)
    const progress_A = rankProgression(allKills, monsterRank.A)
    const progress_B = rankProgression(allKills, monsterRank.B)
    const progress_C = rankProgression(allKills, monsterRank.C)
    const progress_D = rankProgression(allKills, monsterRank.D)
    const progress_E = rankProgression(allKills, monsterRank.E)
    const progress_F = rankProgression(allKills, monsterRank.F)
    const sumCurrent = progress_SSS.currently + progress_SS.currently + progress_S.currently + progress_A.currently + progress_B.currently + progress_C.currently + progress_D.currently + progress_E.currently + progress_F.currently
    const sumTotal = progress_SSS.total + progress_SS.total + progress_S.total + progress_A.total + progress_B.total + progress_C.total + progress_D.total + progress_E.total + progress_F.total
    const sumCurrentRank = progress_SSS.currently * 256 + progress_SS.currently * 128 + progress_S.currently * 64 + progress_A.currently * 32 + progress_B.currently * 16 + progress_C.currently * 8 + progress_D.currently * 4 + progress_E.currently * 2 + progress_F.currently

    const progress = `${bold(`Progression de ${userMention(data.user)}`)}

${bold(`Rang de chasseur de ${userMention(data.user)}`)} : ${bold(getHunterRank(sumCurrentRank))}

${bold(`Rang ${getRank("F")}`)} : ${toPercent(progress_F.percent)}% (${progress_F.currently} / ${progress_F.total})
${bold(`Rang ${getRank("E")}`)} : ${toPercent(progress_E.percent)}% (${progress_E.currently} / ${progress_E.total})
${bold(`Rang ${getRank("D")}`)} : ${toPercent(progress_D.percent)}% (${progress_D.currently} / ${progress_D.total})
${bold(`Rang ${getRank("C")}`)} : ${toPercent(progress_C.percent)}% (${progress_C.currently} / ${progress_C.total})
${bold(`Rang ${getRank("B")}`)} : ${toPercent(progress_B.percent)}% (${progress_B.currently} / ${progress_B.total})
${bold(`Rang ${getRank("A")}`)} : ${toPercent(progress_A.percent)}% (${progress_A.currently} / ${progress_A.total})
${bold(`Rang ${getRank("S")}`)} : ${toPercent(progress_S.percent)}% (${progress_S.currently} / ${progress_S.total})
${bold(`Rang ${getRank("SS")}`)} : ${toPercent(progress_SS.percent)}% (${progress_SS.currently} / ${progress_SS.total})
${bold(`Rang ${getRank("SSS")}`)} : ${toPercent(progress_SSS.percent)}% (${progress_SSS.currently} / ${progress_SSS.total})

${italic("Total")} : ${toPercent(sumCurrent / sumTotal)}% (${sumCurrent} / ${sumTotal})
`
    
    await interaction.followUp({
      content: progress
    })
  })
  .build()
