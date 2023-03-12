import { Command } from "./Command";
import path from "path";
import getFilePaths from "./libraries/getFilePaths";

function LoadCommands(): Command[] {
  const commandsPath = path.join(__dirname, "/commands/");
  const allCommands = getFilePaths(commandsPath);
  const result: Command[] = [];
  for(const command of allCommands) {
    const cmd = require(command);
    for(const cmdKey in cmd) {
      result.push(cmd[cmdKey]);
    }
  }
  return result;
}

export const Commands = LoadCommands();