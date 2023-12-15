import { type PrismaClient } from "@prisma/client"

export const findCartCount = async (ctx: {
  prisma: PrismaClient,
  userId: string,
}) => {
  const { prisma, userId } = ctx
  return await prisma.$queryRaw`
    SELECT
      COUNT(*) as count
    FROM
      ShoppingMember sm
    JOIN
        ShoppingCart sc
      ON
        sc.id = sm.cart_id
    WHERE
      sm.user_id = ${userId}
    ` as {
      count: BigInt
    }[]
}