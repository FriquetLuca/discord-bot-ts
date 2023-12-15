import { type PrismaClient } from "@prisma/client"

export const findCartArticlesCount = async (ctx: {
  cartId: string,
  prisma: PrismaClient,
  userId: string,
}) => {
  const { prisma, userId, cartId } = ctx
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
      COUNT(*) as count,
      SUM(sa.quantity * sa.price) as full_price
    FROM
      ShoppingArticle sa
    JOIN cart c
      ON (c.id = sa.cart_id)
    WHERE (c.id = ${cartId})
    ` as {
      'count': BigInt
      'full_price': number
    }[]
}
