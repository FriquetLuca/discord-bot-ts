import { type ApplicationCommandOptionType } from "discord.js";

export class OptionCommandBuilder<T extends string, U extends ApplicationCommandOptionType> {
  private currentCommand: {
    name: T;
    type: U;
    description: string;
    required: boolean;
    choices: { name: string; value: string }[];
    autocomplete: boolean;
  };
  constructor(element: object) {
    this.currentCommand = element as typeof this.currentCommand
  }
  public description(description: string) {
    this.currentCommand["description"] = description
    return this
  }
  public required(required: boolean) {
    this.currentCommand["required"] = required
    return this
  }
  public addChoice<A extends { name: string; value: string }>(choice: A) {
    this.currentCommand["choices"].push(choice)
    return this
  }
  public addChoices<A extends { name: string; value: string }>(choices: A[]) {
    this.currentCommand["choices"].push(...choices)
    return this
  }
  public autocomplete<A extends boolean>(autocomplete: A) {
    this.currentCommand["autocomplete"] = autocomplete
    return this
  }
  public build() {
    return this.currentCommand
  }
}

export function optionCommandBuilder<A extends string, B extends ApplicationCommandOptionType>(name: A, type: B) {
  return new OptionCommandBuilder({
    name,
    type,
    required: false,
    choices: [] as { name: string; value: string }[],
  }) as OptionCommandBuilder<A, B>
}
