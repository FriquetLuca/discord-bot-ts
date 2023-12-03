import type { MHWIMonsterSpecies, MHWIMonsterStrenght, PrismaClient } from "@prisma/client"

export const findTop10SoloHunt = async (currentData: {
  prisma: PrismaClient,
  select: {
    monster: MHWIMonsterSpecies,
    strength?: MHWIMonsterStrenght,
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
    user_id: true,
    strength: true,
    kill_time: true,
    createdAt: true,
  }
})