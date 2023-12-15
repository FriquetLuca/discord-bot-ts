import type { MHWIMonsterSpecies, MHWIMonsterStrength, PrismaClient } from "@prisma/client"

export const findTop10TeamHunt = async (currentData: {
  prisma: PrismaClient,
  select: {
    monster: MHWIMonsterSpecies,
    strength?: MHWIMonsterStrength,
  }
}) => await currentData.prisma.mHWIMonsterKillTeam.findMany({
  take: 10,
  where: {
    ...currentData.select
  },
  orderBy: {
    kill_time: "asc"
  },
  select: {
    kill_time: true,
    strength: true,
    createdAt: true,
    members: {
      select: {
        user_id: true,
      }
    },
  }
})