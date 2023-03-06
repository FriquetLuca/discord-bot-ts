# Discord Bot Ts

## Setup
First thing first, create a `.env` file at the root of the project.
Copy/paste the content of `.env.example` and setup your token.
After that, install the dependencies with `npm i` if it's not already done.

## Development
To start testing the bot rapidly:
```bash
npm run start
```

To build the project:
```bash
npm run build
```
To run the build, use:
```bash
npm run bot
```

## SlashCommand
The project being just a showcase, only slashcommand is implemented.
To create a slashcommand, create a new file inside `src/commands/`, name it whatever you want then pase that and change the command content:
```ts
import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "../Command";

export const MyCommandKeyVariableWhereNameDoesntMatter: Command = {
    name: "nameOfMyCommand",
    description: "Description of my command",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Hello there uwu!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};
```

Have fun.