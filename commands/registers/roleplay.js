const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

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
      .addSubcommand((opt) =>
        opt
          .setName("link-list")
          .setDescription(
            "Get the list of all main place channels and the places linked to"
          )
      )
      .addSubcommand((opt) =>
        opt
          .setName("link")
          .setDescription(
            "Link roleplay channels each others for the travel command"
          )
          .addStringOption((opt) =>
            opt
              .setName("channel")
              .setDescription(
                "Mentionned channel, main channel to link others to"
              )
              .setRequired(true)
          )
          .addStringOption((opt) =>
            opt
              .setName("channels")
              .setDescription(
                "Mentionned channels to make accessible in the main channel"
              )
              .setRequired(true)
          )
      )
      .addSubcommand((opt) =>
        opt
          .setName("unlink")
          .setDescription(
            "Unlink roleplay channels each others for the travel command"
          )
          .addStringOption((opt) =>
            opt
              .setName("channel")
              .setDescription(
                "Mentionned channel, main channel to unlink others to"
              )
              .setRequired(true)
          )
      )
  )
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
