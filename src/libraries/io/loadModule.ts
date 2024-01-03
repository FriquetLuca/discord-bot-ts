import fs from "fs"
import path from "path"
import { currentDirectory, isProduction } from "@/Bot"

const unwrapExt = (commandPath: string) => {
  if(isProduction) {
    if(commandPath.endsWith(".ts")) {
      return `${commandPath.substring(0, commandPath.length - 3)}.js`
    } else if(commandPath.endsWith(".mts")) {
      return `${commandPath.substring(0, commandPath.length - 4)}.mjs`
    } else if(commandPath.endsWith(".tsx")) {
      return `${commandPath.substring(0, commandPath.length - 4)}.jsx`
    }
  }
  return commandPath
}

export function loadModule<T>(modulePath: string): T | undefined {
  const commandsPath = unwrapExt(path.join(process.cwd(), currentDirectory, modulePath))
  if(!fs.existsSync(commandsPath)) {
    return undefined
  }
  if(fs.lstatSync(commandsPath).isDirectory()) {
    return undefined
  }
  return require(commandsPath)
}
