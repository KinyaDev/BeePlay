const { Client } = require("discord.js");
const { TOKEN, STRIPE_TOKEN, WEBHOOK_SECRET } = require("../utils/env");
const stripe = new (require("stripe").default)(STRIPE_TOKEN);
const { PremiumManager } = require("../utils/db");

/**
 *
 * @param {Client} client
 */
function App(client) {
  const express = require("express");
  const app = express();

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

      console.log(event.type);
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

  return app;
}

module.exports = App;
