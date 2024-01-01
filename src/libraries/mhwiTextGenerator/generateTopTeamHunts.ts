import { getFrenchMHWIMonsterStrength, getFrenchMHWIMonsterNames } from "@/libraries/mhwi"
import type { MHWIMonsterSpecies, MHWIMonsterStrength } from "@prisma/client"
import { getTimestamp } from "@/libraries/time"
import { userMention } from "discord.js"

export const generateTopTeamHunts = (monster_list: {
  kill_time: bigint;
  strength: MHWIMonsterStrength;
  createdAt: Date;
  members: {
      user_id: string;
  }[];
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrength,
}) => {
  const record_list_string = monster_list.map(record => {
    const subStr = data.strength === undefined ? ` - ${getFrenchMHWIMonsterStrength(record.strength)}` : ""
    return `1. **${getTimestamp(record.kill_time)}${subStr}** (Par ${record.members
      .map(item => userMention(item.user_id))
      .map((item, i) => {
        if(i === record.members.length - 1) {
          return ` et ${item}`
        } else if(i === 0) {
          return item
        }
        return `, ${item}`
      })
      .join('')} le ${record.createdAt.toLocaleDateString()} à ${record.createdAt.toLocaleTimeString()})\n`
  }).join('')
  
  return `\n**Top des chasses en équipe : ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(data.strength)})`}**\n${record_list_string}`
}