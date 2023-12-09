import { miscellaneous } from "@/libraries/discord/"

const { mentionUser } = miscellaneous

export const generateTopHuntersText = (extermination_list: {
  user_id: string;
  total_kills: number;
}[]) => {
  const extermination_list_string = extermination_list.map(record => {
    return `1. ${mentionUser(record.user_id)} *avec un total de* **${record.total_kills}** *chasses*\n`
  }).join('')
  return `\n**Top des plus grand chasseurs**\n${extermination_list_string}`
}
