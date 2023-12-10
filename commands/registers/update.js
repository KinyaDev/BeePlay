const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Update avatar, bio or brackets of your character")
  .addStringOption((opt) =>
    opt.setName("brackets").setDescription("New brackets of your character")
  )
  .addStringOption((opt) =>
    opt.setName("bio").setDescription("New description of your character")
  )
  .addAttachmentOption((opt) =>
    opt.setName("avatar").setDescription("New avatar of your character")
  );
