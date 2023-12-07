export const generateTopSeasonalHuntersText = (extermination_list: {
  user_id: string;
  total_kills: number;
}[], currentSeason: boolean = false) => {
  const extermination_list_string = extermination_list.map(record => {
    return `1. <@${record.user_id}> *avec un total de* **${record.total_kills}** *chasses*\n`
  }).join('')
  return `\n**Top des plus grand chasseurs de la saison${currentSeason ? " en cours" : ""}**\n${extermination_list_string}`
}