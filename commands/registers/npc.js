const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Custom AI NPC System")
  .addSubcommand((sc) =>
    sc
      .setName("create")
      .setDescription("Create an npc in a specific channel")
      .addChannelOption((opt) =>
        opt
          .setName("channel")
          .setDescription("The channel where the NPC lives at")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("name")
          .setDescription("NPC's name (fake user profile's username)")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("prompt")
          .setDescription("Give the NPC an identity, job, name, lore, etc")
          .setRequired(true)
      )
      .addAttachmentOption((opt) =>
        opt
          .setName("avatar")
          .setDescription("NPC's avatar (fake user profile's avatar)")
          .setRequired(false)
      )
  )

  .addSubcommand((sc) => sc.setName("delete").setDescription("Delete an NPC"))
  .addSubcommand((sc) =>
    sc
      .setName("list")
      .setDescription("Get the list of NPCs")
      .addChannelOption((opt) =>
        opt
          .setName("channel")
          .setDescription("Get the list of NPCs in a channel")
      )
  )
  .setDefaultMemberPermissions("0");
