import { type MHWIMonsterStrength } from "@prisma/client";
const strength_record = {
  Normal: "Normal",
  Tempered: "Alpha",
  AlphaTempered: "Alpha Suprême",
}
export function getFrenchMHWIMonsterStrength(monster_strength: MHWIMonsterStrength) {
  return strength_record[monster_strength]
}
