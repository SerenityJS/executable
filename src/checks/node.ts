import { execSync } from "node:child_process"
import { logger } from "../logger"

function nodeCheck(): boolean {
  // Check if node is installed globally & if the correct version is installed
  try {
    // Execute node --version
    execSync("node --version", { encoding: "utf-8" }).trim()

    // Return true as the check passed
    return true
  } catch (error) {
    // If node is not installed, install it
    logger.error("Node is not installed, please install Node from https://nodejs.org/")

    // Return false as the check failed
    return false
  }
}

export { nodeCheck }