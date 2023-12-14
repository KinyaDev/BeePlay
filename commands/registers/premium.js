const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Get access to premium feature via Stripe")
  .addStringOption((opt) =>
    opt
      .setName("type")
      .setDescription("Try the trial for one day!")
      .setChoices({ name: "trial", value: "trial" })
  );
