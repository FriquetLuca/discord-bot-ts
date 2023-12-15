# Discord Bot Ts

## Setup
First thing first, create a `.env` file at the root of the project.
Copy/paste the content of `.env.example` and setup your token.
After that, install the dependencies with `npm i` if it's not already done.

## Development

To test the bot rapidly on your own discord server, do:
```bash
npm run dev
```

You'll sometimes find yourself needing to clean all your commands because of some errors or whatever. For this specific case, use the `clean` keyword.
Example:
```bash
npm run dev:clean
```

## Production

You can build the bot by using the command:
```bash
npm run build
```

Afterwards, run the bot with:
```bash
npm run start
```

Or if you happen to have duplicated commands, run the bot with:
```bash
npm run start:clean
```

Note: It can takes an hour or so before your commands are reloaded using `start`, so for development purposes, don't use your production bot token (as it may cause trouble to people using the bot while you're developping on it) nor should you even develop from this at all.

## Project

The project is made using [`Typescript`](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html), [`DiscordJS`](https://discordjs.guide/) and [`Prisma`](https://www.prisma.io/docs/orm/overview/introduction) so don't hesitate to use their documentation for help.
The project structure is as follow :
- prisma
- src
  - database
  - events
  - libraries
  - mods
    - commands
    - messageCommands
    - startups
    - userCommands
  - Bot.ts

### Prisma

In `/prisma`, you'll find the prisma schema and also the following commands implemented in the `package.json` file:
- `npm run db:generate` => Generate your prisma types
- `npm run db:push` => Push your changes in the prisma schema to the database
- `npm run db:studio` => Open Prisma Studio to access your database

### src

In `/src`, everything related to the bot is present. You'll find the root of the bot as the `Bot.ts` file (that you won't ever need to change as far as I know) but you'll be able to find all the arguments you want to pass to the bot with the exposed `Args` variable.

You also have access to your guild ids and client id from what was exposed to the `.env` file and finaly, there's a `isDevelopment` variable to use if you want to know if you're in `dev` mode or `prod` mode.

#### database

This is the file where you want to write down your prisma queries but also where `PrismaClient` is exposed to the bot itself (`/src/database/prisma.ts`).

#### events

Inside this folder, you can define all your custom events for the bot, ...

#### libraries

##### discord

This library contain some wrappers around `DiscordJS` for an implementation of cooldown on commands and other nice features.
The main files being wrappers and modules loaders, I won't go into details but I'll gives some explanations for the submodules at least.

`@/libraries/discord/builders`
You'll find 3 distincts builders in here:
1. `chatCommandBuilder` (Wrapper around `SlashCommandBuilder`)
2. `menuMessageCommandBuilder` (Wrapper around `ContextMenuCommandBuilder`)
3. `menuUserCommandBuilder` (Wrapper around `ContextMenuCommandBuilder`)

`@/libraries/discord/client`
Some shortcuts or useful things to do on the `client`.

`@/libraries/discord/commandInteractions`
Some shortcuts or useful things to do on `interactions` when using a slash command.

`@/libraries/discord/pagination`
A bunch of tools for pagination.

`@/libraries/discord/validators`
Lazy validators for discord

##### io

This library is meant to be used when searching for files or directories in a recursive manner, it also handle modules.

##### time

The library here is to handle time. To be more precise, you'll be able to create schedulers with it. There's also a little function for time written in the following way:
`3'15"37`.

#### mods

Mod is the directory where all your command implementations, startups systems, ... are located. Everything over here is, in itself, a module and treated as such.

##### commands

This is where all your slash commands are located.

To create one, create a file, export your command from a `chatCommandBuilder` that has been `build` and you're good to go.

Example: `hello-world.ts`
```ts
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const HelloWorldOrSomething = chatCommandBuilder()
  .setName("say-world")
  .setDescription("Hello world")
  .handleCommand(async ({ interaction }) => {    
    await interaction.reply({
      content: "Hello World !"
    })
  })
  .build()
```

There's some examples inside `mhwi` and `shopping`.

##### messageCommands

This is where all your message commands are located (the commands you're able to use from right clicking on a message).

To create a message command, create a file, export your command from a `menuMessageCommandBuilder` that has been `build` and you're good to go.

Example: `hello-world.ts`
```ts
import { menuMessageCommandBuilder } from "@/libraries/discord/builders"

export const HelloWorldOrSomething = menuMessageCommandBuilder()
  .setName("say-world")
  .handleCommand(async ({ interaction }) => {    
    await interaction.reply({
      content: "Hello World !"
    })
  })
  .build()
```

##### startups

This folder contains all the functions that are going to be executed once the bot has been started. You can create some CRON executions from it using a `schedule` for example.

To create a startups, create a file and export your function.

Example: `new-start.ts`
```ts
import { type Client } from "discord.js"

export function newStart(client: Client) {
  console.log("The bot has been started !")
}
```

##### userCommands

This is where all your user commands are located (the commands you're able to use from right clicking on a user).

To create a user command, create a file, export your command from a `menuUserCommandBuilder` that has been `build` and you're good to go.

Example: `hello-world.ts`
```ts
import { menuUserCommandBuilder } from "@/libraries/discord/builders"

export const HelloWorldOrSomething = menuUserCommandBuilder()
  .setName("say-world")
  .handleCommand(async ({ interaction }) => {    
    await interaction.reply({
      content: "Hello World !"
    })
  })
  .build()
```
