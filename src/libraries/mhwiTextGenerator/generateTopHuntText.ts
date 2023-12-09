import type { MHWIMonsterSpecies, MHWIMonsterStrength } from "@prisma/client"
import { getTimestamp } from "@/libraries/time"
import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi"
import { miscellaneous } from "@/libraries/discord"

const { mentionUser } = miscellaneous

export const generateTopHuntText = (top_hunt_list: {
  user_id: string;
  strength: MHWIMonsterStrength;
  kill_time: bigint;
  createdAt: Date;
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrength,
}) => {
  const top_hunt_list_string = top_hunt_list.map(record => {
    const subStr = data.strength === undefined ? ` - ${getFrenchMHWIMonsterStrength(record.strength)}` : ""
    return `1. **${getTimestamp(record.kill_time)}${subStr}** (Par ${mentionUser(record.user_id)} le ${record.createdAt.toLocaleDateString()} à ${record.createdAt.toLocaleTimeString()})\n`
  })
  .join('')
  return `\n**Top des chasses en solo : ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(data.strength)})`}**\n${top_hunt_list_string}`
}
