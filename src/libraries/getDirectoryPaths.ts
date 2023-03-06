import getFilesAndDirectories from "./getFileOrDirectoryPaths";
import fs from "fs";
export default function getDirectoryPaths(p: string): string[] {
  return getFilesAndDirectories(p).filter((unknownPath: string) => fs.lstatSync(unknownPath).isDirectory())
}