import { fromRecord, fromRecords } from "@/libraries/sqeul"
import type { MHWIMonsterSpecies, MHWIMonsterStrength, PrismaClient } from "@prisma/client"
import { bold, italic } from "discord.js"
import { getNextRank, getNextRankExp, getRank, getRankExp, getRawHunterRank, monsterRank } from "@/libraries/mhwi/loadCustomRank"
import { getTimestamp } from "@/libraries/time"

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

export const missingMonsters = <T extends MonsterRecord>(records: { id: string, monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }[], monsterRecords: T[]) => fromRecords(monsterRecords)
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

const monsterToCompletedList = <T extends Record<string|number|symbol, any>, U extends ({ id: string; monster: MHWIMonsterSpecies; strength: MHWIMonsterStrength; kill_time: bigint; })>(
  elements: T[],
  allRecords: U[]
) => fromRecords(elements)
    .transform(monster => fromRecords(allRecords)
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

export const toPercent = (n: number, decimals: number = 2) => Math.floor(n * 100 * Math.pow(10, decimals)) / 100

export const generateHunterRankFullText = (
  server_id: string,
  advancement: {
    percent: number;
    currently: number;
    total: number;
  },
  time: bigint,
  rank: keyof typeof monsterRank
) => `${bold(`Rang ${getRank(rank, server_id)}`)} :
${generateHunterRankText(advancement, time)}`

export const generateHunterRankText = (
  advancement: {
    percent: number;
    currently: number;
    total: number;
  },
  time: bigint
) => {
  const result: string[] = []
  if(advancement.currently !== advancement.total) {
    result.push(`- Progression : ${advancement.currently} / ${advancement.total} (${toPercent(advancement.percent)}%)`)
  }
  if(advancement.currently !== advancement.total) {
    result.push(`- Monstres restant : ${advancement.total - advancement.currently}`)
  }
  if(advancement.currently > 0) {
    result.push(`- Temps total pour tous les monstres tués : ${bold(getTimestamp(time))} (${bold(getTimestamp(advancement.currently === 0 ? BigInt(0) : time / BigInt(advancement.currently)))} / monstre)`)
  }
  return result.join("\n")
}

export const findAdvancement = async (currentData: {
  prisma: PrismaClient
  user_id: string
  server_id: string
  title: string
}) => {
  const kills = await currentData.prisma.mHWIMonsterKill.findMany({
    where: {
      user_id: currentData.user_id
    },
    select: {
      id: true,
      monster: true,
      strength: true,
      kill_time: true,
    }
  })
  const team_kills = await currentData.prisma.mHWIMonsterKillTeam.findMany({
    where: {
      members: {
        some: {
          user_id: currentData.user_id
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
  const allKills = fromRecords(kills)
    .union(team_kills)
    .get()

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
  
  const time_f = monsterToCompletedList(completedMonsters(allKills, monsterRank["F"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_e = monsterToCompletedList(completedMonsters(allKills, monsterRank["E"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_d = monsterToCompletedList(completedMonsters(allKills, monsterRank["D"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_c = monsterToCompletedList(completedMonsters(allKills, monsterRank["C"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_b = monsterToCompletedList(completedMonsters(allKills, monsterRank["B"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_a = monsterToCompletedList(completedMonsters(allKills, monsterRank["A"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_s = monsterToCompletedList(completedMonsters(allKills, monsterRank["S"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_ss = monsterToCompletedList(completedMonsters(allKills, monsterRank["SS"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))
  const time_sss = monsterToCompletedList(completedMonsters(allKills, monsterRank["SSS"] as MonsterRecord[]), allKills).reduce((p, c) => c.kill_time + p, BigInt(0))

  const totalKillTime = time_sss + time_ss + time_s + time_a + time_b + time_c + time_d + time_e + time_f
  
  const currentHunterRank = getRawHunterRank(sumCurrentRank)
  const nextRank = getNextRank(currentHunterRank)
  const currentRankExp = getRankExp(currentHunterRank)
  return `${bold(currentData.title)}

${bold("Rang de chasseur")} : ${bold(getRank(currentHunterRank, currentData.server_id))}${nextRank === currentHunterRank ? "" : `\n${bold("Prochain rang")} : ${bold(getRank(getNextRank(currentHunterRank), currentData.server_id))} (${bold((getNextRankExp(currentHunterRank) - sumCurrentRank).toString())} points restant)`}
${bold("Expérience")} : ${bold((sumCurrentRank - currentRankExp).toString())} / ${bold((getNextRankExp(currentHunterRank) - currentRankExp).toString())}
${bold("Expérience totale")} : ${bold(sumCurrentRank.toString())} / ${bold(getNextRankExp("G").toString())}
${bold("Monstres tués")} : ${bold(allKills.length.toString())} (${bold(team_kills.length.toString())} en équipe)
${bold("Monstres tués (Solo)")} : ${bold(kills.length.toString())}
${bold("Monstres tués (Équipe)")} : ${bold(team_kills.length.toString())}

${generateHunterRankFullText(currentData.server_id, progress_F, time_f, "F")}
${generateHunterRankFullText(currentData.server_id, progress_E, time_e, "E")}
${generateHunterRankFullText(currentData.server_id, progress_D, time_d, "D")}
${generateHunterRankFullText(currentData.server_id, progress_C, time_c, "C")}
${generateHunterRankFullText(currentData.server_id, progress_B, time_b, "B")}
${generateHunterRankFullText(currentData.server_id, progress_A, time_a, "A")}
${generateHunterRankFullText(currentData.server_id, progress_S, time_s, "S")}
${generateHunterRankFullText(currentData.server_id, progress_SS, time_ss, "SS")}
${generateHunterRankFullText(currentData.server_id, progress_SSS, time_sss, "SSS")}

${bold("Total")} :
${generateHunterRankText({
  percent: sumCurrent / sumTotal,
  currently: sumCurrent,
  total: sumTotal,
}, totalKillTime)}`
}
