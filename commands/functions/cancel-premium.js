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
  const stripe = new (require("stripe").default)(env.STRIPE_TOKEN);
  let subscriptionId = interaction.options.getString("subscription_id");
  let prapi = new PremiumManager(interaction.guildId);

  if (!(await prapi.hasPremium()))
    return interaction.editReply(error("No active premium here"));
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );

    interaction.editReply(
      success("Cancelled subscription, we will not charge any money anymore")
    );

    let channel = await interaction.guild.channels.fetch(
      canceledSubscription.metadata.channelId
    );

    channel.send("Premium got cancelled");
    prapi.removePremium();
  } catch (error) {
    console.error(error);
    res.status(500).send("Subscription cancellation failed.");
  }
}

module.exports = exec;
