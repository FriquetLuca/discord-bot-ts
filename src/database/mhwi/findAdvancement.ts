import { fromRecord, fromRecords } from "@/libraries/sqeul"
import type { MHWIMonsterSpecies, MHWIMonsterStrength, PrismaClient } from "@prisma/client"
import { bold, italic } from "discord.js"

type MonsterRecord = { monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }

const newMonsterRecord = <T extends { monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }>(records: T[]) => records

const monsterRank = {
  SSS: newMonsterRecord([
    {
      monster: "Fatalis",
      strength: "AlphaTempered"
    },
    {
      monster: "Rajang",
      strength: "AlphaTempered"
    },
    {
      monster: "HellbladeGlavenus",
      strength: "AlphaTempered"
    }
  ]),
  SS: newMonsterRecord([
    {
      monster: "Fatalis",
      strength: "Normal"
    },
    {
      monster: "CrimsonFatalis",
      strength: "Normal"
    },
    {
      monster: "WhiteFatalis",
      strength: "Normal"
    },
    {
      monster: "Velkhana",
      strength: "AlphaTempered"
    },
    {
      monster: "Namielle",
      strength: "AlphaTempered"
    }
  ]),
  S: newMonsterRecord([
    {
      monster: "Behemoth",
      strength: "Tempered"
    },
    {
      monster: "SafiJiva",
      strength: "Normal"
    },
    {
      monster: "KulveTaroth",
      strength: "AlphaTempered"
    },
    {
      monster: "FuriousRajang",
      strength: "Tempered"
    },
    {
      monster: "Lunastra",
      strength: "Tempered"
    },
    {
      monster: "Kirin",
      strength: "Tempered"
    },
    {
      monster: "Namielle",
      strength: "Tempered"
    },
    {
      monster: "Velkhana",
      strength: "Tempered"
    },
    {
      monster: "RuinerNergigante",
      strength: "Tempered"
    },
    {
      monster: "GoldRathian",
      strength: "Tempered"
    },
    {
      monster: "SilverRathalos",
      strength: "Tempered"
    },
    {
      monster: "BlackveilVaalHazak",
      strength: "Tempered"
    },
    {
      monster: "SavageDeviljho",
      strength: "Tempered"
    },
    {
      monster: "StygianZinogre",
      strength: "Tempered"
    },
    {
      monster: "RagingBrachydios",
      strength: "Normal"
    }
  ]),
  A: newMonsterRecord([
    {
      monster: "BlackDiablos",
      strength: "Tempered"
    },
    {
      monster: "Deviljho",
      strength: "Tempered"
    },
    {
      monster: "SeethingBazelgeuse",
      strength: "Tempered"
    },
    {
      monster: "VaalHazak",
      strength: "Tempered"
    },
    {
      monster: "VaalHazak",
      strength: "AlphaTempered"
    },
    {
      monster: "GoldRathian",
      strength: "Normal"
    },
    {
      monster: "SilverRathalos",
      strength: "Normal"
    },
    {
      monster: "ScarredYianGaruga",
      strength: "Tempered"
    },
    {
      monster: "YianGaruga",
      strength: "Tempered"
    },
    {
      monster: "BruteTigrex",
      strength: "Tempered"
    },
    {
      monster: "Kirin",
      strength: "AlphaTempered"
    },
    {
      monster: "Teostra",
      strength: "Tempered"
    },
    {
      monster: "Teostra",
      strength: "AlphaTempered"
    },
    {
      monster: "KushalaDaora",
      strength: "Tempered"
    },
    {
      monster: "KushalaDaora",
      strength: "AlphaTempered"
    },
    {
      monster: "Abiogladius",
      strength: "Tempered"
    },
    {
      monster: "ZorahMagdaros",
      strength: "AlphaTempered"
    },
    {
      monster: "Nergigante",
      strength: "Tempered"
    },
    {
      monster: "Nergigante",
      strength: "AlphaTempered"
    },
    {
      monster: "XenoJiva",
      strength: "Tempered"
    },
    {
      monster: "XenoJiva",
      strength: "AlphaTempered"
    },
    {
      monster: "Lunastra",
      strength: "AlphaTempered"
    },
    {
      monster: "Behemoth",
      strength: "Normal"
    },
    {
      monster: "Rajang",
      strength: "Tempered"
    },
    {
      monster: "GreenNargacuga",
      strength: "AlphaTempered"
    },
    {
      monster: "OldLeshen",
      strength: "Normal"
    },
    {
      monster: "FrostfangBarioth",
      strength: "Tempered"
    },
    {
      monster: "Zinogre",
      strength: "Tempered"
    },
    {
      monster: "Brachydios",
      strength: "Tempered"
    },
    {
      monster: "GreatJagras",
      strength: "AlphaTempered"
    },
  ]),
  B: newMonsterRecord([
    {
      monster: "Barioth",
      strength: "Tempered"
    },
    {
      monster: "Diablos",
      strength: "Tempered"
    },
    {
      monster: "BlackDiablos",
      strength: "Normal"
    },
    {
      monster: "YianGaruga",
      strength: "Normal"
    },
    {
      monster: "Abiogladius",
      strength: "Normal"
    },
    {
      monster: "GreenNargacuga",
      strength: "Tempered"
    },
    {
      monster: "BruteTigrex",
      strength: "Normal"
    },
    {
      monster: "Zinogre",
      strength: "Normal"
    },
    {
      monster: "FulgurAnjanath",
      strength: "Tempered"
    },
    {
      monster: "EbonyOdogaron",
      strength: "Tempered"
    },
    {
      monster: "AcidicGlavenus",
      strength: "Tempered"
    },
    {
      monster: "AzurRathalos",
      strength: "Tempered"
    },
    {
      monster: "Tigrex",
      strength: "Tempered"
    },
    {
      monster: "Odogaron",
      strength: "Tempered"
    },
    {
      monster: "PinkRathian",
      strength: "Tempered"
    },
  ]),
  C: newMonsterRecord([
    {
      monster: "Bazelgeuse",
      strength: "Tempered"
    },
    {
      monster: "ShriekingLegiana",
      strength: "Tempered"
    },
    {
      monster: "Glavenus",
      strength: "Tempered"
    },
    {
      monster: "TobiKadashiViper",
      strength: "Tempered"
    },
    {
      monster: "Banbaro",
      strength: "Tempered"
    },
    {
      monster: "Nargacuga",
      strength: "Tempered"
    },
    {
      monster: "Uragaan",
      strength: "Tempered"
    },
    {
      monster: "PaolumuBelladone",
      strength: "Tempered"
    },
    {
      monster: "FulgurAnjanath",
      strength: "Normal"
    },
    {
      monster: "EbonyOdogaron",
      strength: "Normal"
    },
    {
      monster: "Brachydios",
      strength: "Normal"
    },
    {
      monster: "Tigrex",
      strength: "Normal"
    },
    {
      monster: "PinkRathian",
      strength: "Normal"
    },
  ]),
  D: newMonsterRecord([
    {
      monster: "TobiKadashi",
      strength: "Tempered"
    },
    {
      monster: "Barroth",
      strength: "Tempered"
    },
    {
      monster: "Rathian",
      strength: "Tempered"
    },
    {
      monster: "CoralPukeiPukei",
      strength: "Tempered"
    },
    {
      monster: "Radobaan",
      strength: "Tempered"
    },
    {
      monster: "Rathalos",
      strength: "Tempered"
    },
    {
      monster: "Barioth",
      strength: "Normal"
    },
    {
      monster: "Diablos",
      strength: "Normal"
    },
    {
      monster: "GreenNargacuga",
      strength: "Normal"
    },
    {
      monster: "AcidicGlavenus",
      strength: "Normal"
    },
    {
      monster: "AzurRathalos",
      strength: "Normal"
    },
    {
      monster: "Glavenus",
      strength: "Normal"
    },
    {
      monster: "Odogaron",
      strength: "Normal"
    },
    {
      monster: "Uragaan",
      strength: "Normal"
    },
  ]),
  E: newMonsterRecord([
    {
      monster: "GreatJagras",
      strength: "Tempered"
    },
    {
      monster: "Legiana",
      strength: "Tempered"
    },
    {
      monster: "Paolumu",
      strength: "Tempered"
    },
    {
      monster: "PukeiPukei",
      strength: "Tempered"
    },
    {
      monster: "Jyuratidus",
      strength: "Tempered"
    },
    {
      monster: "TzitziYaKu",
      strength: "Tempered"
    },
    {
      monster: "Anjanath",
      strength: "Tempered"
    },
    {
      monster: "CoralPukeiPukei",
      strength: "Normal"
    },
    {
      monster: "TobiKadashiViper",
      strength: "Normal"
    },
    {
      monster: "Banbaro",
      strength: "Normal"
    },
    {
      monster: "Barroth",
      strength: "Normal"
    },
    {
      monster: "Rathian",
      strength: "Normal"
    },
    {
      monster: "Rathalos",
      strength: "Normal"
    },
    {
      monster: "Nargacuga",
      strength: "Normal"
    },
    {
      monster: "Radobaan",
      strength: "Normal"
    },
    {
      monster: "PaolumuBelladone",
      strength: "Normal"
    },
  ]),
  F: newMonsterRecord([
    {
      monster: "Legiana",
      strength: "Normal"
    },
    {
      monster: "Paolumu",
      strength: "Normal"
    },
    {
      monster: "PukeiPukei",
      strength: "Normal"
    },
    {
      monster: "KuluYaKu",
      strength: "Tempered"
    },
    {
      monster: "Dodogama",
      strength: "Tempered"
    },
    {
      monster: "Beotodus",
      strength: "Tempered"
    },
    {
      monster: "GreatGirros",
      strength: "Tempered"
    },
    {
      monster: "Anjanath",
      strength: "Normal"
    },
    {
      monster: "TobiKadashi",
      strength: "Normal"
    },
  ])
}

const rankProgression = <T extends MonsterRecord>(records: { id: string, monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }[], monsterRecords: T[]) => {
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
  const allKills = await searchAllMonsterKills(currentData)
  const monsters = monsterRank[rank as keyof typeof monsterRank]
  return completedMonsters(allKills, monsters as MonsterRecord[])
}

const searchAllMonsterKills = async (currentData: {
  prisma: PrismaClient
  user_id: string
}) => {
  const { prisma, user_id } = currentData
  const sss_kills = await prisma.mHWIMonsterKill.findMany({
    where: {
      user_id: user_id
    },
    select: {
      id: true,
      monster: true,
      strength: true,
    }
  })
  const sss_team_kills = await prisma.mHWIMonsterKillTeam.findMany({
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
  return fromRecords(sss_kills)
    .union(sss_team_kills)
    .get()
}

const toPercent = (n: number) => Math.floor(n * 10000) / 100


const gRank = monsterRank.SSS.length * 256 + monsterRank.SS.length * 128 + monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const sssRank = monsterRank.SS.length * 128 + monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const ssRank = monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const sRank = monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const aRank = monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const bRank = monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const cRank = monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const dRank = monsterRank.E.length * 2 + monsterRank.F.length
const eRank = monsterRank.F.length

export const findAdvancement = async (currentData: {
  prisma: PrismaClient
  user_id: string
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

${bold("Votre rang de chasseur")} : ${bold(getHunterRank(sumCurrentRank))}

${bold("Rang F")} : ${toPercent(progress_F.percent)}% (${progress_F.currently} / ${progress_F.total})
${bold("Rang E")} : ${toPercent(progress_E.percent)}% (${progress_E.currently} / ${progress_E.total})
${bold("Rang D")} : ${toPercent(progress_D.percent)}% (${progress_D.currently} / ${progress_D.total})
${bold("Rang C")} : ${toPercent(progress_C.percent)}% (${progress_C.currently} / ${progress_C.total})
${bold("Rang B")} : ${toPercent(progress_B.percent)}% (${progress_B.currently} / ${progress_B.total})
${bold("Rang A")} : ${toPercent(progress_A.percent)}% (${progress_A.currently} / ${progress_A.total})
${bold("Rang S")} : ${toPercent(progress_S.percent)}% (${progress_S.currently} / ${progress_S.total})
${bold("Rang SS")} : ${toPercent(progress_SS.percent)}% (${progress_SS.currently} / ${progress_SS.total})
${bold("Rang SSS")} : ${toPercent(progress_SSS.percent)}% (${progress_SSS.currently} / ${progress_SSS.total})

${italic("Total")} : ${toPercent(sumCurrent / sumTotal)}% (${sumCurrent} / ${sumTotal})
`
}

const getHunterRank = (x: number) => {
  if(x === gRank) {
    return "G"
  } else if (x > sssRank) {
    return "SSS"
  } else if (x > ssRank) {
    return "SS"
  } else if (x > sRank) {
    return "S"
  } else if (x > aRank) {
    return "A"
  } else if (x > bRank) {
    return "B"
  } else if (x > cRank) {
    return "C"
  } else if (x > dRank) {
    return "D"
  } else if (x > eRank) {
    return "E"
  }
  return "F"
}