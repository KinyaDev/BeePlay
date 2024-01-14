const {
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { PremiumManager } = require("../../utils/db");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { env, error, success }) {
  let prapi = new PremiumManager(interaction.guild.id);
  let type = interaction.options.getString("type");

  if (type && type === "trial") {
    if (await prapi.hasPremium())
      return interaction.editReply(error("This server already have premium!"));

    if (await prapi.hasTrial())
      return interaction.editReply(
        error("This server already have premium trial!")
      );

    if (await prapi.hasRegisteredEndedTrial())
      return interaction.editReply(error("Your trial already ended...."));

    prapi.setTrial();
    interaction.channel.send(`:tada: Premium trial started!`);
  } else {
    const stripe = new (require("stripe").default)(env.STRIPE_TOKEN);

    if (await prapi.hasPremium())
      return interaction.editReply(error("This server already have premium!"));

    async function createPremiumPaymentLink(guildId) {
      try {
        const price = await stripe.prices.create({
          currency: "eur",
          unit_amount: interaction.user.id === "505832674217295875" ? 0 : 400,
          product: "prod_P9lXaGpuzDZ7Mx",
          recurring: { interval: "month", interval_count: 1 },
        });

        const subscription = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: price.id, quantity: 1 }],
          metadata: {
            guildId: guildId,
            userId: interaction.user.id,
            channelId: interaction.channelId,
          },
          success_url: "https://ideal-roleplay.kinya.me/success",
        });

        // Return the URL to the payment link
        return subscription.url;
      } catch (error) {
        console.error("Error creating payment link:", error);
        throw error;
      }
    }

    try {
      let link = await createPremiumPaymentLink(interaction.guildId);
      let linkBtn = new ButtonBuilder()
        .setURL(link)
        .setStyle(ButtonStyle.Link)
        .setLabel("Open Stripe");

      interaction.editReply({
        content:
          'Success generating link, click on "Open Stripe" to purchase premium',
        components: [new ActionRowBuilder().addComponents(linkBtn)],
      });
    } catch (e) {
      console.log(e);
      interaction.editReply(error("Error while creating the URL."));
    }
  }
}

module.exports = exec;
