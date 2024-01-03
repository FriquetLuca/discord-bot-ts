import { GuildIds } from "@/Bot";
import { loadModules } from "@/libraries/io"
import type { MHWIMonsterSpecies, MHWIMonsterStrength } from "@prisma/client"

const newMonsterRecord = <T extends { monster: MHWIMonsterSpecies, strength: MHWIMonsterStrength }>(records: T[]) => records

const loadedCustomRank = loadModules<{
  G: string;
  SSS: string;
  SS: string;
  S: string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
}>("custom/rankSettings")

const baseRank = {
  G: "G",
  SSS: "SSS",
  SS: "SS",
  S: "S",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
};
const customRank = loadedCustomRank.length === 0 ? [ baseRank ] : [ baseRank, loadedCustomRank[0] ]

export const getRank = (rank: keyof typeof baseRank, serverId: string) => GuildIds.includes(serverId) ? customRank[1][rank] ?? customRank[0][rank] : customRank[0][rank]

export const monsterRank = {
  G: [],
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
    },
    {
      monster: "Alatreon",
      strength: "Normal"
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
    {
      monster: "Velkhana",
      strength: "Normal"
    }
  ]),
  B: newMonsterRecord([
    {
      monster: "FrostfangBarioth",
      strength: "Normal"
    },
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

const eRank = monsterRank.F.length
const dRank = monsterRank.E.length * 2 + eRank
const cRank = monsterRank.D.length * 4 + dRank
const bRank = monsterRank.C.length * 8 + cRank
const aRank = monsterRank.B.length * 16 + bRank
const sRank = monsterRank.A.length * 32 + aRank
const ssRank = monsterRank.S.length * 64 + sRank
const sssRank = monsterRank.SS.length * 128 + ssRank
const gRank = monsterRank.SSS.length * 256 + sssRank

export const rankExp = {
  G: gRank,
  SSS: sssRank,
  SS: ssRank,
  S: sRank,
  A: aRank,
  B: bRank,
  C: cRank,
  D: dRank,
  E: eRank,
  F: 0,
}

export const getNextRank = (rank: keyof typeof baseRank) => ({
  G: "G",
  SSS: "G",
  SS: "SSS",
  S: "SS",
  A: "S",
  B: "A",
  C: "B",
  D: "C",
  E: "D",
  F: "E",
})[rank] as keyof typeof baseRank

export const getNextRankExp = (rank: keyof typeof baseRank) => rankExp[getNextRank(rank)]
export const getRankExp = (rank: keyof typeof baseRank) => rankExp[rank]

export const getRawHunterRank = (x: number) => {
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

export const getHunterRank = (x: number, serverId: string) => {
  if(x === gRank) {
    return getRank("G", serverId) // G
  } else if (x > sssRank) {
    return getRank("SSS", serverId) // SSS
  } else if (x > ssRank) {
    return getRank("SS", serverId) // SS
  } else if (x > sRank) {
    return getRank("S", serverId) // S
  } else if (x > aRank) {
    return getRank("A", serverId) // A
  } else if (x > bRank) {
    return getRank("B", serverId) // B
  } else if (x > cRank) {
    return getRank("C", serverId) // C
  } else if (x > dRank) {
    return getRank("D", serverId) // D
  } else if (x > eRank) {
    return getRank("E", serverId) // E
  }
  return getRank("F", serverId) // F
}
