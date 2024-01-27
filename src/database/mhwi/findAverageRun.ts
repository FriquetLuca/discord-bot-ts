import type { PrismaClient } from "@prisma/client"

export async function findAverageRun({ prisma }: {
  prisma: PrismaClient
}) {
  const result = await prisma.$queryRaw`
WITH combined_kills AS (
  SELECT
    monster,
    kill_time,
    strength
  FROM MHWIMonsterKill

  UNION ALL

  SELECT
    monster,
    kill_time,
    strength
  FROM MHWIMonsterKillTeam
)
SELECT
  MAX(monster) as monster,
  AVG(kill_time) as average,
  MAX(strength) as strength
FROM combined_kills
GROUP BY monster, strength
ORDER BY average;
` as {
  monster: number,
  strength: string,
  average: number,
}[]
  return result.map(v => ({
    ...v,
    average: BigInt(Math.round(v.average))
  }))
}