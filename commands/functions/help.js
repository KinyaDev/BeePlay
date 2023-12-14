const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  SlashCommandBuilder,
} = require("discord.js");
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { env, now }) {
  let mainEmbed = new EmbedBuilder()
    .setTitle("Commands")
    .setColor(0xf4d03f)
    .setThumbnail(interaction.client.user.displayAvatarURL());

  // OtherEmbed
  let otherDescription = [
    "`/help` - Get the list of commands",
    "`/ping` - Get latency of the bot",
    "`/travel` - With roleplay channels setup",
  ];

  let otherEmbed = new EmbedBuilder()
    .setTitle("Others Commands")
    .setColor(0xf4d03f)
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setDescription(otherDescription.join("\n"));

  // CharacterEmbed
  let charaDesc = [
    "`/characters (mention)` - show your character or those of the mentionned member",
    "`/update (brackets) (avatar) (bio)` - Update details of your character",
    "`/register` - Register a character",
    "`/unregister`",
  ];

  let characterEmbed = new EmbedBuilder()
    .setTitle("Character Customization & Management")
    .setColor(0xf4d03f)
    .setDescription(charaDesc.join("\n"));

  // NPC Embed
  let npcDescription = ["`/npc create`", "`/npc delete`", "`/npc list`"];

  let npcEmbed = new EmbedBuilder()
    .setTitle("[PREMIUM] Custom AI NPCs")
    .setColor(0xf4d03f)
    .setDescription(npcDescription.join("\n"));

  // Roleplay Channels Embed
  let roleplayChDesc = [
    "`/roleplay channels add`",
    "`/roleplay channels remove`",
    "`/roleplay channels set`",
    "`/roleplay channels link`",
    "`/roleplay channels unlink`",
  ];

  let roleplayChEmbed = new EmbedBuilder()
    .setTitle("Roleplay Channels Management")
    .setColor(0xf4d03f)
    .setDescription(roleplayChDesc.join("\n"));

  // Commands for voice channels Embed
  let voiceDesc = [
    "`/voice connect`",
    "`/voice play-youtube`",
    "`/voice play-file`",
    "`/voice stop`",
  ];

  let voiceEmbed = new EmbedBuilder()
    .setTitle("Commands for Voice Channels")
    .setColor(0xf4d03f)
    .setDescription(voiceDesc.join("\n"));

  // Commands for voice channels Embed
  let eventDesc = [];

  let eventEmbed = new EmbedBuilder()
    .setTitle("Event Commands")
    .setColor(0xf4d03f)
    .setDescription(voiceDesc.join("\n"));

  // Send Embeds
  interaction.editReply({
    embeds: [
      mainEmbed,
      npcEmbed,
      characterEmbed,
      roleplayChEmbed,
      voiceEmbed,
      otherEmbed,
      eventEmbed,
    ],
  });
}

module.exports = exec;
