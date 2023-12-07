const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Register a character")
  .addStringOption((opt) =>
    opt
      .setName("name")
      .setDescription("Name of your character")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("brackets")
      .setDescription(
        "Prefix or suffix with the placeholder 'text' to call your character when you want to make them speak"
      )
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("bio").setDescription("Description of your character")
  )
  .addAttachmentOption((opt) =>
    opt.setName("avatar").setDescription("Avatar of your character")
  );
