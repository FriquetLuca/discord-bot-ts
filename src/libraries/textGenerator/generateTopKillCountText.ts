import { getFrenchMHWIMonsterNames } from "@/mhwi/getFrenchMHWIMonsterNames"
import { getFrenchMHWIMonsterStrenght } from "@/mhwi/getFrenchMHWIMonsterStrenght"
import type { MHWIMonsterSpecies, MHWIMonsterStrenght } from "@prisma/client";

export const generateTopKillCountText = (top_kills: {
  user_id: string;
  total_kills: number;
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrenght,
}) => {
  const record_list_string = top_kills.map(record => {
    return `1. <@${record.user_id}> *avec un total de* **${record.total_kills}** *chasses*\n`
  }).join('')
  
  return `\n**Top des exterminateurs de ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrenght(data.strength)})`}**\n${record_list_string}`
}