import getFileOrDirectoryPaths from "@/libraries/getFileOrDirectoryPaths";
import fs from "fs";
export default function getFilePaths(p: string): string[] {
  return getFileOrDirectoryPaths(p).filter((unknownPath: string) => !fs.lstatSync(unknownPath).isDirectory())
}