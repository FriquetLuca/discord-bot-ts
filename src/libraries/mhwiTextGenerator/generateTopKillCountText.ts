import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"
import type { MHWIMonsterSpecies, MHWIMonsterStrength } from "@prisma/client"
import { userMention } from "discord.js"

export const generateTopKillCountText = (top_kills: {
  user_id: string;
  total_kills: number;
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrength,
}) => {
  const record_list_string = top_kills.map(record => {
    return `1. ${userMention(record.user_id)} *avec un total de* **${record.total_kills}** *chasses*\n`
  }).join('')
  
  return `\n**Top des exterminateurs de ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(data.strength)})`}**\n${record_list_string}`
}