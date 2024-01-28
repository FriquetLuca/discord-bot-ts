import fs from "fs"

export function readFile(filePath: string, encoding: BufferEncoding = "utf8"): string | undefined {
  if(!fs.existsSync(filePath)) {
    return undefined
  }
  if(fs.lstatSync(filePath).isDirectory()) {
    return undefined
  }
  return fs.readFileSync(filePath, { encoding })
}
