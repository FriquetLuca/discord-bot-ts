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
    SUM(sa.quantity * sa.price) as full_price,
    sc.id as cart_id,
    MAX(sm.permission) as permission,
    sc.createdAt as createdAt,
    sc.updatedAt as updatedAt
  FROM ShoppingCart sc
  JOIN ShoppingMember sm ON (sc.id = sm.cart_id)
  LEFT JOIN ShoppingArticle sa ON (sc.id = sa.cart_id)
  WHERE (sm.user_id = ${userId})
  GROUP BY cart_id
  ORDER BY createdAt DESC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  ` as {
    label: string
    full_price: number,
    cart_id: string
    permission: CartPermission
    createdAt: Date
    updatedAt: Date
  }[]
}