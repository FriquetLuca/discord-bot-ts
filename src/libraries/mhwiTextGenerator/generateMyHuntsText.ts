import { type MHWIMonsterSpecies, type MHWIMonsterStrength } from "@prisma/client";
import { getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi";
import { getTimestamp } from "@/libraries/time";

export function generateMyHuntsText(monster_list: {
  id: string;
  kill_time: bigint;
  strength: MHWIMonsterStrength;
}[], data: {
  strength: MHWIMonsterStrength | undefined,
  monster: MHWIMonsterSpecies
}) {
  const { strength, monster } = data
  const record_list_string = monster_list.map(record => {
    const subStr = strength === undefined ? ` - ${getFrenchMHWIMonsterStrength(record.strength)}` : ""
    return `1. **${getTimestamp(record.kill_time)}${subStr}** (Hash: *${record.id}*)\n`
  }).join('')

  return `\n**Temps de chasse : ${getFrenchMHWIMonsterNames(monster)}${strength === undefined ? "" : ` (${getFrenchMHWIMonsterStrength(strength)})`}**\n${record_list_string}`
}
