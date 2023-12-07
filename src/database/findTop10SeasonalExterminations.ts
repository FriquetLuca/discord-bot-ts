import type { PrismaClient } from "@prisma/client"

export const findTop10SeasonalExterminations = async (currentData: {
  prisma: PrismaClient,
  isCurrentSeason?: boolean,
}) => {
  const now = new Date()
  const isCurrentSeason = currentData.isCurrentSeason ?? false
  const limit = isCurrentSeason ? 1 : 2
  const currentSeason = await currentData.prisma.$queryRaw`
      SELECT startedAt FROM MHWISeasons ORDER BY id DESC LIMIT ${limit}
    ` as {
      startedAt: Date
    }[]
  
  const seasonStart = isCurrentSeason ? currentSeason[0].startedAt : currentSeason[1].startedAt
  const seasonEnd = isCurrentSeason ? now : currentSeason[0].startedAt

  return await currentData.prisma.$queryRaw`
    WITH combined_kills AS (
      SELECT
        user_id,
        COUNT(*) as solo_kills
      FROM MHWIMonsterKill
      WHERE (createdAt > ${seasonStart} AND createdAt <= ${seasonEnd})
      GROUP BY
        user_id
    
      UNION ALL
    
      SELECT
          tm.user_id,
          COUNT(*) as solo_kills
        FROM  MHWITeamMembers tm
        JOIN MHWIMonsterKillTeam kt
        ON (tm.monsterKillTeamId = kt.id AND kt.createdAt > ${seasonStart} AND kt.createdAt <= ${seasonEnd})
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
}
