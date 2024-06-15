import { spawnSync, execSync } from "node:child_process"
import { existsSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { nodeCheck } from "./checks"
import { COMMON_PACKAGES, SERENITY_PACKAGES } from "./packages"
import { INDEX_TEMPLATE, TSCONFIG_TEMPLATE } from "./templates"
import { logger } from "./logger"
import { NPM_SCRIPTS } from "./scripts"

logger.info("Starting the Serenity launcher...")

// Start the launcher
const start = () => {
  try {
    // Execute the launcher
    spawnSync("npm", ["exec", "ts-node", "index.ts"], { stdio: "inherit" })

    // Set the process title
    process.title = "SerenityJS"
  } catch (error) {
    // Log the failed launcher
    logger.error("Executable encountered an error...")

    // Restart the launcher
    setTimeout(() => start(), 5000)
  }
}

// Check if node and yarn are installed
if (nodeCheck()) {
  // Check if package.json exists
  if (!existsSync("package.json")) {
    // Create a blank package.json
    writeFileSync("package.json", JSON.stringify({}, null, 2))

    // Execute the npm scripts
    for (const script of NPM_SCRIPTS) {
      try {
        // Execute the script
        execSync(script, { stdio: "inherit" })
      } catch (error) {
        // Log the failed script
        logger.error(`Failed to execute script: ${script}`, error)

        // Exit the process
        process.exit(1)
      }
    }

    try {
      // Install the package
      logger.info("Installing common packages...")
      spawnSync("npm", ["install", "--save-dev", ...COMMON_PACKAGES], { stdio: "inherit" })
    } catch (error) {
      // Log the failed package
      logger.error(`Failed to install common packages...`, error)

      // Exit the process
      process.exit(1)
    }

    try {
      // Get the dist tag for the serenityjs packages
      const distTag = execSync("npm pkg get serenityjs", { encoding: "utf-8" }).trim().replace(/"/g, "")

      // Install the serenityjs packages
      logger.info(`Installing serenity packages with dist tag: "${distTag}"`)
      spawnSync("npm", ["install", "--save-dev", ...SERENITY_PACKAGES.map(pkg => `${pkg}@${distTag}`)], { stdio: "inherit" })
    } catch (error) {
      // Log the failed package
      logger.error(`Failed to install serenity packages...`, error)

      // Exit the process
      process.exit(1)
    }
  } else {
    // Check if the launcher is up to date with the selected dist tag
    try {
      // Get the dist tag for the serenityjs packages
      const distTag = execSync("npm pkg get serenityjs", { encoding: "utf-8" }).trim().replace(/"/g, "")

      // Check if the dist tag is local
      if (distTag === "local") {
        // Log the local dist tag
        logger.info(`Using local serenity packages...`)
      } else if (distTag !== "latest" && distTag !== "beta") {
        // Log the invalid dist tag
        logger.error(`Invalid dist tag: "${distTag}"`)

        // Exit the process
        process.exit(1)
      } else {
        // Check if the launcher is up to date with the selected dist tag
        // If not, update and install the packages
        const latest = execSync(`npm info @serenityjs/serenity@${distTag} version`, { encoding: "utf-8" }).trim()
        const current = execSync("npm pkg get version", { encoding: "utf-8", cwd: resolve(process.cwd(), "node_modules", "@serenityjs", "serenity") }).trim().replace(/"/g, "")

        // Check if the launcher is up to date
        if (current !== latest) {
          // Update the launcher
          logger.info(`SerenityJS v${latest} is now available! Updating now...`)
          spawnSync("npm", ["install", "--save-dev", ...SERENITY_PACKAGES.map(pkg => `${pkg}@${latest}`)], { stdio: "inherit" })
          logger.success(`SerenityJS update complete! v${current} -> v${latest}`)
        }
      }
    } catch (error) {
      // Log the failed package
      logger.error(`Failed to update serenity packages...`, error)

      // Exit the process
      process.exit(1)
    }
  }

  // Check if tsconfig.json exists
  if (!existsSync("tsconfig.json")) {
    // Create a blank tsconfig.json
    writeFileSync("tsconfig.json", TSCONFIG_TEMPLATE)

    // Log the creation of the tsconfig.json file
    logger.info("Created a new tsconfig.json file.")
  }

  // Check if index.ts exists
  if (!existsSync("index.ts")) {
    // Create a blank index.ts
    writeFileSync("index.ts", INDEX_TEMPLATE)

    // Log the creation of the index.ts file
    logger.info("Created a new index.ts file.")
  }

  // Start the launcher
  start()

} else process.exit(1)