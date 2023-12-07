const {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { CharacterManager, RoleplayManager } = require("./db");
const { ObjectId } = require("mongodb");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
function selector(interaction, doLink, channelId) {
  return new Promise(async (resolve, reject) => {
    let rpapi = new RoleplayManager(interaction.guildId);

    let selectmenu = new StringSelectMenuBuilder()
      .setPlaceholder(`${interaction.user.username} makes a selection`)
      .setCustomId("selector");

    let channelIds = doLink
      ? await rpapi.getLinkChannel(channelId)
      : await rpapi.getChannels();

    for (let channelId of channelIds) {
      let channel = await interaction.guild.channels.fetch(channelId);
      if (!channel) return;
      selectmenu.addOptions({
        label: channel.name,
        emoji: "#",
        value: channel.id,
      });
    }

    if (selectmenu.options.length === 0) return reject("no-channel");

    let msg = await interaction.channel.send({
      components: [new ActionRowBuilder().setComponents(selectmenu)],
    });

    let collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", (i) => {
      resolve(new ObjectId(i.values[0]));
      collector.stop();
      msg.delete();
    });
  });
}

module.exports = selector;
