const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { env, now }) {
  let mainEmbed = new EmbedBuilder()
    .setTitle("Commands")
    .setColor(0xf4d03f)
    .setDescription("List of all existing commands and how to use them!")
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
    .setDescription(otherDescription.join("\n"))
    .setImage(
      "https://i.pinimg.com/originals/5b/4d/3c/5b4d3c7d74405f59aca97a057debad8b.jpg"
    )
    .setTimestamp(Date.now())
    .setFooter({
      text: "Ideal Roleplay",
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  // CharacterEmbed
  let charaDesc = [
    "`/characters (mention)` - Show your character or those of the mentionned member",
    "`/update (brackets) (avatar) (bio)` - A select menu will appear to update details of your character",
    "`/register [name] [brackets] (avatar) (bio)` - Register a character",
    "`/unregister` - A select menu will appear to delete one of your characters",
  ];

  let characterEmbed = new EmbedBuilder()
    .setTitle("Character Customization & Management")
    .setColor(0xf4d03f)
    .setDescription(charaDesc.join("\n"));

  // NPC Embed
  // let npcDescription = [
  //   "`/npc create [channel] [name] [prompt]` - Create a NPC with channel mention, name and behavior.",
  //   "`/npc delete` - A select menu will appear to delete a NPC",
  //   "`/npc list (channel)` - Get the list of all NPC in your server",
  // ];

  // let npcEmbed = new EmbedBuilder()
  //   .setTitle("[PREMIUM] Custom AI NPCs")
  //   .setColor(0xf4d03f)
  //   .setDescription(npcDescription.join("\n"));

  // Roleplay Channels Embed
  let roleplayChDesc = [
    "`/roleplay channels add [channels]` - Specify mentions of channels to add among roleplay channels",
    "`/roleplay channels remove [channels]` - Specify mentions of channels to remove from roleplay channels",
    "`/roleplay channels set [channels]` - Specify mentions of channels to set as roleplay channels",
    "`/roleplay channels link [channel] [channels]` - Specify channels linked to the main channel. `[channels]` will be accessible from `[channel]`",
    "`/roleplay channels unlink [channel] [channels]` - Specify channels to unlink to the main channel. `[channels]` won't be accessible anymore from `[channel]`",
    "`/roleplay channels link-list` - Show roleplay channels and linked channels.",
  ];

  let roleplayChEmbed = new EmbedBuilder()
    .setTitle("Roleplay Channels Management")
    .setColor(0xf4d03f)
    .setDescription(roleplayChDesc.join("\n"));

  // Commands for voice channels Embed
  let voiceDesc = [
    "`/voice connect` - Connect a bot a voice channel or the voice channel where you are",
    "`/voice play-youtube [url]` - Play audio from the url of a youtube video",
    "`/voice play-file [attachment]` - Play audio from a audio file",
    "`/voice stop` - Stop the audio and disconnect the bot",
  ];

  let voiceEmbed = new EmbedBuilder()
    .setTitle("Commands for Voice Channels")
    .setColor(0xf4d03f)
    .setDescription(voiceDesc.join("\n"));

  // Commands for voice channels Embed
  // let eventDesc = ["*Nothing for the moment*"];

  // let eventEmbed = new EmbedBuilder()
  //   .setTitle("Event Commands")
  //   .setColor(0xf4d03f)
  //   .setDescription(eventDesc.join("\n"));

  // Button

  let button = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL("https://discord.gg/SADKYJSq88")
    .setLabel("Join Support Server");

  // Send Embeds
  interaction.channel.send({
    embeds: [
      mainEmbed,
      characterEmbed,
      roleplayChEmbed,
      voiceEmbed,
      otherEmbed,
    ],
    components: [new ActionRowBuilder().setComponents(button)],
  });
}

module.exports = exec;
