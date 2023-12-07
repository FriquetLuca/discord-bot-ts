import { type MHWIMonsterStrength } from "@prisma/client";

export function getFrenchMHWIMonsterStrength(monster_strength: MHWIMonsterStrength) {
  const strength_record = {
    Normal: "Normal",
    Tempered: "Alpha",
    AlphaTempered: "Alpha Suprême",
  }
  return strength_record[monster_strength]
}