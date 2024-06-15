const NPM_SCRIPTS = [
  "npm pkg set serenityjs=latest",
  "npm pkg set private=true",
  "npm pkg set name=serenityjs",
  "npm pkg set version=1.0.0",
  "npm pkg set workspaces[0]=\"plugins/*\"",
]

export { NPM_SCRIPTS }