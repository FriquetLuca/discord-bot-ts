import type { CartPermission, PrismaClient } from "@prisma/client"

export const findCurrentCartPage = async (ctx: {
  prisma: PrismaClient,
  userId: string,
  limit: number,
  offset: number,
}) => {
  const { prisma, userId, limit, offset } = ctx
  return await prisma.$queryRaw`
  SELECT
    sc.label as label,
    sm.cart_id as cart_id,
    sm.permission as permission,
    sc.createdAt as createdAt,
    sc.updatedAt as updatedAt
  FROM ShoppingMember sm
  JOIN ShoppingCart sc ON sc.id = sm.cart_id
  WHERE sm.user_id = ${userId}
  ORDER BY createdAt DESC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  ` as {
    label: string
    cart_id: string
    permission: CartPermission
    createdAt: Date
    updatedAt: Date
  }[]
}