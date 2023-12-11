import { menuCommandBuilder } from "@/libraries/discord/builders"
import { ApplicationCommandType, bold, italic, userMention } from "discord.js"

export const NewShopCart = menuCommandBuilder()
  .name("Remove ShopCart Member")
  .type(ApplicationCommandType.User)
  .handleCommand(async ({ interaction, prisma }) => {
    if(!interaction.isUserContextMenuCommand()) {
      return
    }
    
    const user_id = interaction.user.id
    await interaction.deferReply()

    const currentContext = await prisma.shoppingContext.findUnique({
      where: {
        user_id
      },
      select: {
        hash: true,
      }
    })

    if(currentContext !== null && currentContext.hash !== null) {
      const user_permissions = await prisma.shoppingMember.findFirst({
        where: {
          user_id,
          cart_id: currentContext.hash
        },
        select: {
          id: true,
          permission: true
        }
      })

      if(user_permissions === null || user_permissions.permission === "MEMBER") {
        await interaction.followUp({
          content: "Erreur : Vous n'avez pas des droits suffisants pour supprimer des gens de ce caddie."
        })
        return
      }

      const target_id = interaction.targetUser.id
      const target_exist = await prisma.shoppingMember.findFirst({
        where: {
          user_id: target_id,
          cart_id: currentContext.hash
        },
        select: {
          id: true,
        }
      })

      if(target_exist === null) {
        await interaction.followUp({
          content: "Erreur : Cet utilisateur n'existe pas dans ce caddie."
        })
        return;
      }
      const caddie = await prisma.shoppingCart.findUnique({
        where: {
          id: currentContext.hash
        },
        select: {
          label: true
        }
      })
      if(caddie !== null) {
        await prisma.shoppingMember.deleteMany({
          where: {
            user_id: target_id,
            cart_id: currentContext.hash,
            permission: "MEMBER",
          }
        })
        await interaction.followUp({
          content: `L'utilisateur ${userMention(target_id)} a été retirée avec succès du caddie : ${bold(caddie.label)} (${italic(`Hash: \`${currentContext.hash}\``)}).`
        })
      } else {
        await interaction.followUp({
          content: `Erreur : Le caddie contextuel est actuellement associé à un caddie qui n'existe plus.`
        })
      }
    } else {
      await interaction.followUp({
        content: "Erreur : Le caddie contextuel est actuellement indéfini."
      })
    }

  })
  .build()
