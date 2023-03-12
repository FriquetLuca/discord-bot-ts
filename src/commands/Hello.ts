import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "@/Command";
import { prisma } from "@/database/prisma";
const result = (resultQueries: { id: string; user_id: bigint; guild_id: bigint; }[] | undefined) => {
    if(!resultQueries) {
        return undefined;
    }
    let rst = "";
    for(const query of resultQueries) {
        rst = `${rst}guild id: ${query.guild_id} | user id:${query.user_id}\n`;
    }
    return rst;
};
export const Hello: Command = {
    name: "hello",
    description: "Returns a greeting",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there uwu!";
        if(!prisma) {
            await interaction.followUp({
                ephemeral: true,
                content
            });
        } else {
            const resultQuery = await prisma.user.findMany({
                select: {
                    id: true,
                    user_id: true,
                    guild_id: true
                }
            });
            await interaction.followUp({
                ephemeral: true,
                content: (result(resultQuery) || content)
            });
        }
    }
};