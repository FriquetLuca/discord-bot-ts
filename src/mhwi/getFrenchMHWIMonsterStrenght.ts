import { type MHWIMonsterStrenght } from "@prisma/client";

export function getFrenchMHWIMonsterStrenght(monster_strenght: MHWIMonsterStrenght) {
  const strenght_record = {
    Normal: "Normal",
    Tempered: "Alpha",
    AlphaTempered: "Alpha Suprême",
  }
  return strenght_record[monster_strenght]
}