import type { MHWIMonsterSpecies, MHWIMonsterStrenght, PrismaClient } from "@prisma/client"

export const findTop10KillCount = async (currentData: {
  prisma: PrismaClient,
  select: {
    monster: MHWIMonsterSpecies,
    strength?: MHWIMonsterStrenght,
  }
}) => await currentData.prisma.$queryRawUnsafe(`
WITH combined_kills AS (
  SELECT
    user_id,
    COUNT(*) as kill_quantity
  FROM MHWIMonsterKill
  WHERE monster="${currentData.select.monster}"${currentData.select.strength ? ` AND strength="${currentData.select.strength}"` : ""}
  GROUP BY user_id

  UNION ALL

  SELECT
      tm.user_id,
      COUNT(*) as kill_quantity
    FROM  MHWITeamMembers tm
      JOIN MHWIMonsterKillTeam kt
        ON tm.monsterKillTeamId = kt.id AND kt.monster="${currentData.select.monster}"${currentData.select.strength ? ` AND kt.strength="${currentData.select.strength}"` : ""}
    GROUP BY tm.user_id
)

SELECT user_id, SUM(kill_quantity) as total_kills
FROM combined_kills
GROUP BY user_id
ORDER BY total_kills DESC
LIMIT 10
`) as {
user_id: string,
total_kills: number
}[]