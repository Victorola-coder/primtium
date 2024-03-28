#!/usr/bin/env node

const { Command } = require("commander");
const { execSync } = require("child_process");

const program = new Command();

program
  .option("-n, --project-name <name>", "Specify project name")
  .option("--skip-git", "Skip initializing git repository")
  .parse(process.argv);

const projectName = program.projectName || "my-project";

try {
  console.log("Installing dependencies...");
  execSync(`cd ${projectName} && npm i -D tailwindcss autoprefixer postcss`);
  execSync(`npx tailwindcss init -p`);
  execSync(`npm i`, { cwd: projectName });
  console.log("Opening project in VSCode...");
  execSync(`code .`, { cwd: projectName });
  if (!program.skipGit) {
    console.log("Initializing git repository...");
    execSync(
      `git init -b dev && git remote add origin https://github.com/Victorola-coder/${projectName}.git && git add . && git commit -am "init" && git push origin dev`,
      { cwd: projectName }
    );
  }
  console.log("Setup completed successfully!✔🚀");
} catch (error) {
  console.error("Error occurred:", error.message);
  process.exit(1);
}
