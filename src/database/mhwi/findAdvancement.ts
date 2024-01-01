import { fromRecord, fromRecords } from "@/libraries/sqeul"
import type { MHWIMonsterSpecies, MHWIMonsterStrength, PrismaClient } from "@prisma/client"
import { bold, italic } from "discord.js"
import { getHunterRank, getRank, monsterRank } from "@/libraries/mhwi/loadCustomRank"

type MonsterRecord = { monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }

export const rankProgression = <T extends MonsterRecord>(records: { id: string, monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }[], monsterRecords: T[]) => {
  const a = fromRecord(
    fromRecords(records)
      .filter((record) => {
        for(const rec of monsterRecords) {
          if(rec.monster === record.monster && rec.strength === record.strength) {
            return true
          }
        }
        return false
      })
      .groupBy("monster")
      .monster
  ).getKeys().length
  return {
    percent: a / monsterRecords.length,
    currently: a,
    total: monsterRecords.length,
  }
}

const missingMonsters = <T extends MonsterRecord>(records: { id: string, monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }[], monsterRecords: T[]) => fromRecords(monsterRecords)
.filter((record) => {
  for(const rec of records) {
    if(rec.monster === record.monster && rec.strength === record.strength) {
      return false
    }
  }
  return true
})
.get()

const completedMonsters = <T extends MonsterRecord>(records: { id: string, monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }[], monsterRecords: T[]) => fromRecords(monsterRecords)
.filter((record) => {
  for(const rec of records) {
    if(rec.monster === record.monster && rec.strength === record.strength) {
      return true
    }
  }
  return false
})
.get()

export const findMissingMonstersInRank = async (currentData: {
  prisma: PrismaClient
  user_id: string
}, rank: keyof typeof monsterRank) => {
  const allKills = await searchAllMonsterKills(currentData)
  const monsters = monsterRank[rank as keyof typeof monsterRank]
  return missingMonsters(allKills, monsters as MonsterRecord[])
}

export const findCompletedMonstersInRank = async (currentData: {
  prisma: PrismaClient
  user_id: string
}, rank: keyof typeof monsterRank) => {
  const allKills = await searchAllMonsterKillsWithTime(currentData)
  const monsters = monsterRank[rank as keyof typeof monsterRank]
  const completed = completedMonsters(allKills, monsters as MonsterRecord[])

  return fromRecords(completed)
    .transform(monster => fromRecords(allKills)
    .filter(record => record.monster === monster.monster && record.strength === monster.strength)
    .aggregate<{
      monster: MHWIMonsterSpecies;
      strength: MHWIMonsterStrength;
      kill_time: bigint;
    }>((previous, current) => previous.kill_time === undefined ? ({
          ...previous,
          kill_time: current.kill_time
        }) : ({
          ...previous,
          kill_time: previous.kill_time > current.kill_time ? current.kill_time : previous.kill_time,
        }), ({ monster: monster.monster, strength: monster.strength, kill_time: undefined as unknown as bigint })))
    .get()
}

const searchAllMonsterKillsWithTime = async (currentData: {
  prisma: PrismaClient
  user_id: string
}) => {
  const { prisma, user_id } = currentData
  const kills = await prisma.mHWIMonsterKill.findMany({
    where: {
      user_id: user_id
    },
    select: {
      id: true,
      monster: true,
      strength: true,
      kill_time: true,
    }
  })
  const team_kills = await prisma.mHWIMonsterKillTeam.findMany({
    where: {
      members: {
        some: {
          user_id
        }
      }
    },
    select: {
      id: true,
      monster: true,
      strength: true,
      kill_time: true,
    }
  })
  return fromRecords(kills)
    .union(team_kills)
    .get()
}

export const searchAllMonsterKills = async (currentData: {
  prisma: PrismaClient
  user_id: string
}) => {
  const { prisma, user_id } = currentData
  const kills = await prisma.mHWIMonsterKill.findMany({
    where: {
      user_id: user_id
    },
    select: {
      id: true,
      monster: true,
      strength: true,
    }
  })
  const team_kills = await prisma.mHWIMonsterKillTeam.findMany({
    where: {
      members: {
        some: {
          user_id
        }
      }
    },
    select: {
      id: true,
      monster: true,
      strength: true,
    }
  })
  return fromRecords(kills)
    .union(team_kills)
    .get()
}

export const toPercent = (n: number) => Math.floor(n * 10000) / 100

export const findAdvancement = async (currentData: {
  prisma: PrismaClient
  user_id: string
  server_id: string
}) => {
  const allKills = await searchAllMonsterKills(currentData)
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
  return `${bold("Votre progression")}

${bold("Votre rang de chasseur")} : ${bold(getHunterRank(sumCurrentRank, currentData.server_id))}

${bold(`Rang ${getRank("F", currentData.server_id)}`)} : ${toPercent(progress_F.percent)}% (${progress_F.currently} / ${progress_F.total})
${bold(`Rang ${getRank("E", currentData.server_id)}`)} : ${toPercent(progress_E.percent)}% (${progress_E.currently} / ${progress_E.total})
${bold(`Rang ${getRank("D", currentData.server_id)}`)} : ${toPercent(progress_D.percent)}% (${progress_D.currently} / ${progress_D.total})
${bold(`Rang ${getRank("C", currentData.server_id)}`)} : ${toPercent(progress_C.percent)}% (${progress_C.currently} / ${progress_C.total})
${bold(`Rang ${getRank("B", currentData.server_id)}`)} : ${toPercent(progress_B.percent)}% (${progress_B.currently} / ${progress_B.total})
${bold(`Rang ${getRank("A", currentData.server_id)}`)} : ${toPercent(progress_A.percent)}% (${progress_A.currently} / ${progress_A.total})
${bold(`Rang ${getRank("S", currentData.server_id)}`)} : ${toPercent(progress_S.percent)}% (${progress_S.currently} / ${progress_S.total})
${bold(`Rang ${getRank("SS", currentData.server_id)}`)} : ${toPercent(progress_SS.percent)}% (${progress_SS.currently} / ${progress_SS.total})
${bold(`Rang ${getRank("SSS", currentData.server_id)}`)} : ${toPercent(progress_SSS.percent)}% (${progress_SSS.currently} / ${progress_SSS.total})

${italic("Total")} : ${toPercent(sumCurrent / sumTotal)}% (${sumCurrent} / ${sumTotal})
`
}
