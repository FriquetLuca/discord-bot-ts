import type { PrismaClient } from "@prisma/client"

export const findTop10Exterminations = async (currentData: {
  prisma: PrismaClient
}) => await currentData.prisma.$queryRaw`
WITH combined_kills AS (
  SELECT
    user_id,
    COUNT(*) as solo_kills
  FROM MHWIMonsterKill
  GROUP BY
    user_id

  UNION ALL

  SELECT
      tm.user_id,
      COUNT(*) as solo_kills
    FROM  MHWITeamMembers tm
    JOIN MHWIMonsterKillTeam kt
    ON tm.monsterKillTeamId = kt.id
    GROUP BY tm.user_id
)

SELECT user_id, SUM(solo_kills) as total_kills
FROM combined_kills
GROUP BY user_id
ORDER BY total_kills DESC
LIMIT 10
` as {
user_id: string,
total_kills: number
}[]