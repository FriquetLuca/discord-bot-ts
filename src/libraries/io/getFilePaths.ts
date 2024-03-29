import { getFileOrDirectoryPaths } from "./getFileOrDirectoryPaths"
import fs from "fs"

export function getFilePaths(p: string): string[] {
  return getFileOrDirectoryPaths(p).filter((unknownPath: string) => !fs.lstatSync(unknownPath).isDirectory())
}