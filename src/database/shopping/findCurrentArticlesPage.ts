import { type PrismaClient } from "@prisma/client";

export const findCurrentArticlesPage = async (ctx: {
  cartId: string,
  prisma: PrismaClient,
  userId: string,
  limit: number,
  offset: number,
}) => {
  const { prisma, userId, cartId, limit, offset } = ctx
  return await prisma.$queryRaw`
  WITH cart as (
    SELECT
      sc.id as id
    FROM
      ShoppingCart sc
    JOIN
        ShoppingMember sm
      ON
        (sc.id = sm.cart_id)
    WHERE (sc.id = ${cartId} AND sm.user_id = ${userId})
  )
  SELECT
    sa.id as article_id,
    sa.label as label,
    sa.quantity as quantity,
    sa.price as price,
    sa.recipient as recipient,
    sa.createdAt as createdAt,
    sa.updatedAt as updatedAt
  FROM
    ShoppingArticle sa
  JOIN
    cart c
    ON
      (c.id = sa.cart_id)
  WHERE (c.id = ${cartId})
  ORDER BY createdAt DESC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  ` as {
    article_id: string
    label: string
    quantity: number
    price: number
    recipient?: string
    createdAt: Date
    updatedAt: Date
  }[]
}
