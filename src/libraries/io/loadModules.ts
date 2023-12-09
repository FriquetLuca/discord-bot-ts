import path from "path"
import { getFilePaths } from "./getFilePaths"

export function loadModules<T>(modulePath: string): T[] {
  const commandsPath = path.join(process.cwd(), modulePath)
  const allCommands = getFilePaths(commandsPath)
  const result: T[] = []
  for(const command of allCommands) {
    const cmd = require(command)
    for(const cmdKey in cmd) {
      result.push(cmd[cmdKey])
    }
  }
  return result
}
