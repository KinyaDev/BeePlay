const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Show your characters or show characters of a user")
  .addUserOption((opt) =>
    opt.setName("mention").setDescription("Mention of a user")
  );
