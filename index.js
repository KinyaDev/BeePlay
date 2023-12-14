const {
  Client,
  REST,
  Routes,
  Events,
  GatewayIntentBits,
  Partials,
  ActivityType,
} = require("discord.js");

const { readdirSync } = require("fs");
const path = require("path");
const { TOKEN, STRIPE_TOKEN, WEBHOOK_SECRET } = require("./utils/env");
const stripe = new (require("stripe").default)(STRIPE_TOKEN);
const { PremiumManager } = require("./utils/db");
const express = require("express");
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    "MessageContent",
    "GuildMessages",
    GatewayIntentBits.GuildVoiceStates,
  ],
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
  let guilds = await readyClient.guilds.fetch();
  console.log(
    `Ready! Logged in as ${readyClient.user.tag} in ${guilds.size} guilds`
  );
  console.log(`${guilds.map((v) => v.name).join("\n")}`);

  readyClient.user.setActivity({
    type: ActivityType.Playing,
    name: `Roleplaying in ${guilds.size} guilds`,
  });
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

app.get("/", (req, res) => {
  res.send();
});

app.get("/success", (req, res) => {
  res.send("Success! You can return to your server.");
});
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("received webhook");
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      console.log(WEBHOOK_SECRET);
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Erreur de signature du webhook", err);
      return res.status(400).send("Erreur de signature du webhook");
    }
    // Gérer l'événement
    if (event.type === "checkout.session.completed") {
      const paymentIntent = event.data.object;
      // Effectuer des actions en réponse au paiement réussi
      console.log("Paiement réussi:", paymentIntent.id);

      let guildId = paymentIntent.metadata.guildId;
      let userId = paymentIntent.metadata.userId;

      let guild = await client.guilds.fetch(guildId);
      let member = await guild.members.fetch(userId);
      let channel = await guild.channels.fetch(
        paymentIntent.metadata.channelId
      );

      channel.send(
        `:tada: ${await guild.fetchOwner().then((m) => m.user)}, ${
          member.user
        } just bought Ideal Roleplay Plus!`
      );

      let prapi = new PremiumManager(guildId);
      prapi.setPremium();
    }

    // D'autres conditions pour d'autres types d'événements peuvent être ajoutées ici

    res.status(200).end();
  }
);

app.listen(1026, () => {
  console.log("Web app listening");
});

client.login(TOKEN);
