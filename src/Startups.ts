import { Client } from "discord.js"
import path from "path"
import getFilePaths from "./libraries/io/getFilePaths"

function LoadStartups() {
  const commandsPath = path.join(__dirname, "/startups/")
  const allCommands = getFilePaths(commandsPath)
  const result: ((client: Client) => void)[] = []
  for(const command of allCommands) {
    const cmd = require(command)
    for(const cmdKey in cmd) {
      result.push(cmd[cmdKey])
    }
  }
  return result
}

export const Startups = LoadStartups()