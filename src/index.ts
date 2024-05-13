import { existsSync, writeFileSync, rmdirSync, rmSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { SERENITY_PACKAGES } from "./packages"
import { INDEX_TEMPLATE, PACKAGE_TEMPLATE } from "./templates"
import { Logger, LoggerColors } from "@serenityjs/logger"

// Create a new instance of the logger
const logger = new Logger("Executable", LoggerColors.YellowBright)
logger.info("Starting the Serenity launcher...")

// Check if a package.json file exists
if (!existsSync("./package.json")) {
  // Create a package.json file
  writeFileSync("./package.json", PACKAGE_TEMPLATE)

  // Log the creation of the package.json file
  logger.info("Created a new package.json file.")
}

// Check if a index.js file exists
if (!existsSync("./index.js")) {
  // Create a index.js file
  writeFileSync("./index.js", INDEX_TEMPLATE)

  // Log the creation of the index.js file
  logger.info("Created a new index.js file.")
}

// Check if there is a ".beta" file, if so delete the "node_modules" directory
if (existsSync("./.beta") && existsSync("./node_modules")) {
  // Delete the "node_modules" directory
  rmdirSync("./node_modules", { recursive: true })

  // Log the switch to beta versions
  logger.info("Switched to beta versions of the Serenity packages.")
}

// Check if there is a ".latest" file, if so delete the "node_modules" directory
if (existsSync("./.latest") && existsSync("./node_modules")) {
  // Delete the "node_modules" directory
  rmdirSync("./node_modules", { recursive: true })

  // Log the switch to stable versions
  logger.info("Switched to stable versions of the Serenity packages.")
}

// Check if the "node_modules" directory exists
if (!existsSync("./node_modules")) {
  // Check if the launcher will be using stable or beta versions of the packages
  const tag = existsSync("./.beta") ? "beta" : "latest"

  // Install the packages
  spawnSync("npm", ["install", ...SERENITY_PACKAGES.map(pkg => `${pkg}@${tag}`)], {
    stdio: "ignore"
  })

  // Delte the ".beta" or ".latest" file if it exists
  if (existsSync(`./.${tag}`)) {
    // Delete the ".beta" or ".latest" file
    rmSync(`./.${tag}`)
  }

  // Log the installation of the beta packages
  if (tag === "beta") {
    logger.info(`Installed ${tag} versions of the Serenity packages. To switch to stable versions, create an empty ".latest" file and restart the launcher.`)
  } else {
    // Log the installation of the stable packages
    logger.info(`Installed ${tag} versions of the Serenity packages. To switch to beta versions, create an empty ".beta" file and restart the launcher.`)
  }
}

// Set the process title
process.title = "SerenityJS"

// Start the launcher
spawnSync("node", ["index.js"], {
  stdio: "inherit",
})
