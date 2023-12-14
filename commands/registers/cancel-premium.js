const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Cancel your premium subscription")
  .addStringOption((opt) =>
    opt
      .setName("subscription_id")
      .setDescription(
        "ID of your subscription. If you lost it please contact the developper."
      )
  );
