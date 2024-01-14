const {
  Client,
  REST,
  Routes,
  Events,
  GatewayIntentBits,
  Partials,
  ActivityType,
  ApplicationCommand,
  UserContextMenuCommandInteraction,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  InteractionType,
  ContextMenuCommandAssertions,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");

const { readdirSync, readFileSync } = require("fs");
const path = require("path");
const { TOKEN } = require("./utils/env");
const App = require("./app");
const { CharacterManager } = require("./utils/db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    "MessageContent",
    "GuildMessages",
    "GuildMembers",
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.GuildMember, Partials.Channel],
});

// require("./utils/launchTunnel");

let app = App(client);

app.listen(1026, () => {
  console.log("Web app listening");
});

const rest = new REST().setToken(TOKEN);
let registeredCommands = new Map();

let webhookOwnerCommandData = new ContextMenuCommandBuilder()
  .setType(ApplicationCommandType.Message)
  .setName("Who is the Author?");

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

    commandsToRegister.set("author", webhookOwnerCommandData);

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
  reloadCommands(readyClient);

  let guilds = await readyClient.guilds.fetch();

  console.log(
    `Ready! Logged in as ${readyClient.user.tag} in ${guilds.size} guilds`
  );

  console.log(`${guilds.map((v) => v.name).join("\n")}`);
  let statuses = readFileSync(path.join(__dirname, "statuses.txt"), "utf-8")
    .split("\n")
    .map((s) => s.replace("{guilds.size}", guilds.size));

  readyClient.user.setActivity({
    type: ActivityType.Playing,
    name: statuses[0],
  });

  setInterval(() => {
    statuses = readFileSync(path.join(__dirname, "statuses.txt"), "utf-8")
      .split("\n")
      .map((s) => s.replace("{guilds.size}", guilds.size));

    readyClient.user.setActivity({
      type: ActivityType.Playing,
      name: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }, 5000);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isMessageContextMenuCommand()) {
    switch (interaction.commandName) {
      case "Who is the Author?":
        if (!interaction.targetMessage.webhookId) {
          interaction.reply({
            ephemeral: true,
            embeds: [
              {
                title: `:x: This is not a message from a character (webhook)`,
                color: 0xf44336,
              },
            ],
          });

          return;
        }

        await interaction.deferReply({ ephemeral: true });

        let members = await interaction.guild.members.fetch();

        let authors = [];
        let character;

        for (let [id, member] of members) {
          let charaapi = new CharacterManager(id);

          let charalist = await charaapi.list();

          console.log(charalist);
          let chara = charalist.find(
            (c) => c.name === interaction.targetMessage.author.username
          );

          if (chara) {
            character = chara;
            authors.push(member);
            break;
          }
        }

        if (!authors.length || !character)
          return interaction.editReply({
            embeds: [
              {
                title: `:x: This is not a message from a character (webhook)`,
                color: 0xf44336,
              },
            ],
          });

        let embed = new EmbedBuilder()
          .setThumbnail(character.icon || null)
          .setTitle(character.name)
          .setDescription(`${interaction.targetMessage.content}`)
          .setFields({
            name: `Members who have a character called ${interaction.targetMessage.author.username}`,
            value: `${authors.map((m) => m.user.username)}`,
          });

        interaction.editReply({ embeds: [embed] });

        break;
    }
  }

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

        await runner(interaction, {
          now,
          env: require("./utils/env"),
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

        console.log(
          `${interaction.user.username} triggered /${
            interaction.commandName
          } ${JSON.stringify(interaction.options.data)}`
        );
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
