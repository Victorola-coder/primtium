const { program } = require("commander");
const fs = require("fs"); // For configuration file access

// Configuration (replace with your desired defaults)
const defaultConfig = {
  commands: {
    setup: {
      options: {
        tailwind: false,
        git: false,
      },
    },
  },
};

// Load configuration from file (optional)
function loadConfig() {
  const configPath = ".project-setup.json";
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    return defaultConfig;
  }
}

// Save configuration to file (optional)
function saveConfig(config) {
  const configPath = ".project-setup.json";
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

program
  .name("project-setup")
  .version("1.0.0")
  .description("CLI tool for setting up projects");

program
  .command("setup <projectName>")
  .description("Sets up a new project")
  .option("--tailwind", "Include Tailwind CSS")
  .option("--git", "Initialize Git repository")
  .action((projectName, options) => {
    const config = loadConfig(); // Load configuration (optional)

    // Update options based on config and user input
    options.tailwind =
      options.tailwind || config.commands.setup.options.tailwind;
    options.git = options.git || config.commands.setup.options.git;

    // Build commands based on options
    const commands = [];

    // Create directory (ensure error handling for existing directory)
    try {
      fs.mkdirSync(projectName);
      console.log(`Created directory: ${projectName}`);
    } catch (err) {
      if (err.code === "EEXIST") {
        console.error(`Directory already exists: ${projectName}`);
      } else {
        console.error(err);
      }
      return; // Exit if directory creation fails
    }

    commands.push(`cd ${projectName}`);
    if (options.tailwind) {
      commands.push(
        "npm i -D tailwindcss autoprefixer postcss && npx tailwindcss init -p && npm i"
      );
    }
    if (options.git) {
      // Prompt user for remote repository URL
      const remoteUrl = program.prompt("Enter the remote repository URL: ");

      commands.push("git init -b dev");
      commands.push(`git remote add origin ${remoteUrl}`);
      commands.push('git add . && git commit -am "init"');
      // Prompt user for confirmation before pushing
      if (program.confirm("Push to remote repository?")) {
        commands.push(`git push origin dev`);
      }
    }
    // commands.push("code ."); // Open in code editor

    // Execute commands sequentially
    commands.forEach((command) => {
      console.log(`Executing: ${command}`);
      const result = require("child_process").execSync(command);
      console.log(result.toString());
    });

    // Save configuration with updated defaults (optional)
    if (options.tailwind || options.git) {
      config.commands.setup.options.tailwind = options.tailwind;
      config.commands.setup.options.git = options.git;
      saveConfig(config);
    }
  });

program.parse(process.argv);

if (!program.args.length) program.help();
