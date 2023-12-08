const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Customise your roleplay")
  .addSubcommandGroup((sc) =>
    sc
      // Mark channels as roleplay channels or not
      .setName("channels")
      .setDescription("Setup roleplay channels")

      // Add command
      .addSubcommand((opt) =>
        opt
          .setName("add")
          .setDescription("Add roleplay channels to this guild")
          .addStringOption((opt) =>
            opt
              .setName("channels")
              .setDescription("Mentionned channels to add as roleplay channels")
              .setRequired(true)
          )
      )

      // Set subcommand
      .addSubcommand((opt) =>
        opt
          .setName("set")
          .setDescription("Set roleplay channels to this guild")
          .addStringOption((opt) =>
            opt
              .setName("channels")
              .setDescription("Mentionned channels to set as roleplay channels")
              .setRequired(true)
          )
      )

      // Remove subcommand
      .addSubcommand((opt) =>
        opt
          .setName("remove")
          .setDescription("Remove roleplay channels to this guild")
          .addStringOption((opt) =>
            opt
              .setName("channels")
              .setDescription(
                "Mentionned channels to remove as roleplay channels"
              )
              .setRequired(true)
          )
      )
  );
