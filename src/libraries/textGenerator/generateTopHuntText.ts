import type { MHWIMonsterSpecies, MHWIMonsterStrenght } from "@prisma/client";
import { getTimestamp } from "../time/getTimestamp";
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi/getFrenchMHWIMonsterNames";
import { getFrenchMHWIMonsterStrength } from "@/libraries/mhwi/getFrenchMHWIMonsterStrength";

export const generateTopHuntText = (top_hunt_list: {
  user_id: string;
  strength: MHWIMonsterStrenght;
  kill_time: bigint;
  createdAt: Date;
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrenght,
}) => {
  const top_hunt_list_string = top_hunt_list.map(record => {
    const subStr = (data.strength === undefined && ` - ${getFrenchMHWIMonsterStrength(record.strength)}`) ?? ""
    return `1. **${getTimestamp(record.kill_time)}${subStr}** (Par <@${record.user_id}> le ${record.createdAt.toLocaleDateString()} à ${record.createdAt.toLocaleTimeString()})\n`
  })
  .join('')
  return `\n**Top des chasses en solo : ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(data.strength)})`}**\n${top_hunt_list_string}`
}
