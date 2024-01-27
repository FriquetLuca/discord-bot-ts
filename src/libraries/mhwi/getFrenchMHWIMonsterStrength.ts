import { type MHWIMonsterStrength } from "@prisma/client"

const strength_french_record = {
  Normal: "Normal",
  Tempered: "Alpha",
  AlphaTempered: "Alpha Suprême",
}
export function getFrenchMHWIMonsterStrength(monster_strength: MHWIMonsterStrength) {
  return strength_french_record[monster_strength]
}

const strength_english_record = {
  Normal: "Normal",
  Tempered: "Alpha",
  AlphaTempered: "Alpha Tempered",
}
export function getEnglishMHWIMonsterStrength(monster_strength: MHWIMonsterStrength) {
  return strength_english_record[monster_strength]
}
