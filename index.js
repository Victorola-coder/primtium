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
  const configPath = ".init.json";
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    return defaultConfig;
  }
}

// Save configuration to file (optional)
function saveConfig(config) {
  const configPath = ".init.json";
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

program
  .name("init")
  .version("1.0.0")
  .description("CLI tool for setting up ReactJs + Vite + Tailwindcss projects");

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
    commands.push(`cd ${projectName}`);
    if (options.tailwind) {
      commands.push(
        "npm i -D tailwindcss autoprefixer postcss && npx tailwindcss init -p && npm i"
      );
    }
    if (options.git) {
      commands.push(
        'git init -b dev && git remote add origin https://github.com/your-username/your-repo.git && git add . && git commit -am "init" && git push origin dev'
      );
    }
    commands.push("code ."); // Open in code editor

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
