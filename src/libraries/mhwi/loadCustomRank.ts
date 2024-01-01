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

const customRank = loadedCustomRank.length === 0 ? {
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
} : loadedCustomRank[0]

export const getRank = (rank: keyof typeof customRank) => customRank[rank]

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

const gRank = monsterRank.SSS.length * 256 + monsterRank.SS.length * 128 + monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const sssRank = monsterRank.SS.length * 128 + monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const ssRank = monsterRank.S.length * 64 + monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const sRank = monsterRank.A.length * 32 + monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const aRank = monsterRank.B.length * 16 + monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const bRank = monsterRank.C.length * 8 + monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const cRank = monsterRank.D.length * 4 + monsterRank.E.length * 2 + monsterRank.F.length
const dRank = monsterRank.E.length * 2 + monsterRank.F.length
const eRank = monsterRank.F.length

export const getHunterRank = (x: number) => {
  if(x === gRank) {
    return customRank.G // G
  } else if (x > sssRank) {
    return customRank.SSS // SSS
  } else if (x > ssRank) {
    return customRank.SS // SS
  } else if (x > sRank) {
    return customRank.S // S
  } else if (x > aRank) {
    return customRank.A // A
  } else if (x > bRank) {
    return customRank.B // B
  } else if (x > cRank) {
    return customRank.C // C
  } else if (x > dRank) {
    return customRank.D // D
  } else if (x > eRank) {
    return customRank.E // E
  }
  return customRank.F // F
}