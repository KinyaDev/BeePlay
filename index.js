const {
  Client,
  REST,
  Routes,
  Events,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

const { readdirSync } = require("fs");
const path = require("path");
const { TOKEN } = require("./utils/env");
const db = require("./utils/db");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, "MessageContent", "GuildMessages"],
  partials: [Partials.Message, Partials.GuildMember, Partials.Channel],
});

const rest = new REST().setToken(TOKEN);
let registeredCommands = new Map();

async function reloadCommands(readyClient) {
  const commandRegisterPath = path.join(__dirname, "commands", "registers");
  const commandRegisterFiles = readdirSync(commandRegisterPath, "utf-8");

  const commandsToRegister = new Map();

  for (let slashFile of commandRegisterFiles) {
    let data = require(path.join(commandRegisterPath, slashFile));
    let commandName = slashFile.replace(".js", "");
    data.name = commandName;

    commandsToRegister.set(commandName, data);
  }

  registeredCommands = commandsToRegister;

  try {
    console.log(
      `Started refreshing ${commandsToRegister.size} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(readyClient.application.id),
      { body: Array.from(commandsToRegister).map((m) => m[1]) }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  reloadCommands(readyClient);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  let commandFunctionsPath = path.join(__dirname, "commands", "functions");
  let commandFunctionsFiles = readdirSync(commandFunctionsPath, "utf-8");

  const now = Date.now();
  registeredCommands.forEach(async (command) => {
    if (command.name === interaction.commandName) {
      try {
        let runner = require(path.join(
          commandFunctionsPath,
          `${command.name}.js`
        ));

        if (typeof runner !== "function") throw "Runner must be a function.";

        await interaction.deferReply({ fetchReply: true, ephemeral: true });

        await runner(interaction, require("./utils/env"), now, {
          error: (text) => {
            return {
              content: null,
              embeds: [{ title: `:x: ${text}`, color: 0xf44336 }],
            };
          },
          success: (text) => {
            return {
              content: null,
              embeds: [
                { title: `:white_check_mark: ${text}`, color: 0x8fce00 },
              ],
            };
          },
          information: (text) => {
            return {
              content: null,
              embeds: [
                { title: `:information_source: ${text}`, color: 0xf4d03f },
              ],
            };
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
});

let eventsPath = path.join(__dirname, "events");
let eventsFiles = readdirSync(eventsPath, "utf-8");

for (let event of eventsFiles) {
  let eventName = event.replace(".js", "");
  let req = require(path.join(eventsPath, event));

  client.on(eventName, req);
}

client.login(TOKEN);
