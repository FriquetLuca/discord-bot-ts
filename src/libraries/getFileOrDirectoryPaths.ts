import fs from "fs";
import path from "path";
export default function getFileOrDirectoryPaths(p: string, a: string[] = []): string[] {
  if(fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).map((f: string) => getFileOrDirectoryPaths(a[a.push(path.join(p, f)) - 1], a));
  }
  return a;
}