const {
  ChatInputCommandInteraction,
  ChannelType,
  GuildChannel,
  PermissionsBitField,
  CategoryChannel,
} = require("discord.js");
const { RoleplayManager } = require("../../utils/db");
const channelSelector = require("../../utils/channelSelector");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { env, now, error, information }) {
  let rpapi = new RoleplayManager(interaction.guildId);
  let channelIds = await rpapi.getChannels();
  let channels = [];

  for (let channelId of channelIds) {
    channels.push(await interaction.guild.channels.fetch(channelId));
  }

  if (!channelIds.includes(interaction.channelId))
    return interaction.editReply(error("You are not in a roleplay channel!"));

  await interaction.editReply(information("Select a place to travel to!"));

  try {
    let targetChannel = await channelSelector(
      interaction,
      true,
      interaction.channel.id
    );

    for (let otherRoleplayChannel of channels) {
      if (otherRoleplayChannel instanceof GuildChannel) {
        otherRoleplayChannel.permissionOverwrites.set([
          { deny: PermissionsBitField.Flags.ViewChannel, id: interaction.user },
        ]);
      } else if (
        otherRoleplayChannel.type === ChannelType.GuildCategory &&
        otherRoleplayChannel instanceof GuildChannel
      ) {
        otherRoleplayChannel.permissionOverwrites.set([
          { deny: PermissionsBitField.Flags.ViewChannel, id: interaction.user },
        ]);

        function children(id) {
          return interaction.guild.channels.cache.filter(
            (c) => c.parentId === id
          );
        }

        for (let [id, child] of children(otherRoleplayChannel.id)) {
          if (child instanceof GuildChannel) {
            child.permissionOverwrites.set([
              {
                deny: PermissionsBitField.Flags.ViewChannel,
                id: interaction.user,
              },
            ]);
          }
        }
      }
    }

    targetChannel.permissionOverwrites.set([
      { allow: PermissionsBitField.Flags.ViewChannel, id: interaction.user },
    ]);

    interaction.channel.send(
      information(
        `${interaction.user.username}'s character is travelling to ${targetChannel}`
      )
    );
  } catch {
    interaction.editReply(error("Couldn't find any accessible places"));
  }
}

module.exports = exec;
