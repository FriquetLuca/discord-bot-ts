import { getFrenchMHWIMonsterStrenght } from "@/libraries/mhwi/getFrenchMHWIMonsterStrenght";
import type { MHWIMonsterSpecies, MHWIMonsterStrenght } from "@prisma/client";
import { getTimestamp } from "../time/getTimestamp";
import { mentionUser } from "../discord/mentionUser";
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi/getFrenchMHWIMonsterNames";

export const generateTopTeamHunts = (monster_list: {
  kill_time: bigint;
  strength: MHWIMonsterStrenght;
  createdAt: Date;
  members: {
      user_id: string;
  }[];
}[],
data: {
  monster: MHWIMonsterSpecies,
  strength?: MHWIMonsterStrenght,
}) => {
  const record_list_string = monster_list.map(record => {
    const subStr = (data.strength === undefined && ` - ${getFrenchMHWIMonsterStrenght(record.strength)}`) ?? ""
    return `1. **${getTimestamp(record.kill_time)}${subStr}** (Par ${record.members
      .map(item => mentionUser(item.user_id))
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
  
  return `\n**Top des chasses en équipe : ${getFrenchMHWIMonsterNames(data.monster)}${data.strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrenght(data.strength)})`}**\n${record_list_string}`
}