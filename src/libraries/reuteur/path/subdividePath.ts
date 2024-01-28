export const subdividePath = (currentPath: string) => {
  if(currentPath[0] === "/") {
    if(currentPath[currentPath.length - 1] === "/") {
      return currentPath.substring(1, currentPath.length - 1).split("/")
    }
    return currentPath.substring(1, currentPath.length).split("/")
  }
  if(currentPath[currentPath.length - 1] === "/") {
    return currentPath.substring(0, currentPath.length - 1).split("/")
  }
  return currentPath.split("/")
}
