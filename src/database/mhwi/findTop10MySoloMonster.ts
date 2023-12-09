import type { MHWIMonsterSpecies, MHWIMonsterStrength, PrismaClient } from "@prisma/client"

export const findTop10MySoloMonster = async (currentData: {
  prisma: PrismaClient,
  select: {
    user_id: string,
    monster: MHWIMonsterSpecies,
    strength?: MHWIMonsterStrength,
  }
}) => await currentData.prisma.mHWIMonsterKill.findMany({
  take: 10,
  where: {
    ...currentData.select
  },
  orderBy: {
    kill_time: "asc"
  },
  select: {
    id: true,
    kill_time: true,
    strength: true,
  }
})