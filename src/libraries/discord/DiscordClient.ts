import { Client, type ClientOptions, Collection } from "discord.js";

export class DiscordClient extends Client {
  public cooldowns: Collection<string, Collection<string, number>>;

  constructor(options: ClientOptions) {
    super(options);
    this.cooldowns = new Collection();
  }
}
