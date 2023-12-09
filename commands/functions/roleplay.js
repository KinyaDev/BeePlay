const {
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
let { RoleplayManager } = require("../../utils/db");
const selector = require("../../utils/channelSelector");

/**
 * The exec command for the /roleplay command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { error, env, now, information, success }) {
  const rpapi = new RoleplayManager(interaction.guildId);
  const subCommandGroup = interaction.options.getSubcommandGroup();

  if (subCommandGroup === "channels") {
    const sc = interaction.options.getSubcommand();
    const channels = interaction.options.getString("channels");
    const channel = interaction.options.getString("channel");

    // Gets the channels IDs
    let channelIds = channels
      ? [...channels.matchAll(/<#([0-9]{19})>/g)].map((d) => d[1])
      : [];
    let mainChannelId = channel
      ? [...channel.matchAll(/<#([0-9]{19})>/g)].map((d) => d[1])
      : [];

    switch (sc) {
      case "set": {
        if (!channelIds.length)
          return interaction.editReply(error("Invalid channels provided"));

        rpapi.setChannels(channelIds);
        interaction.editReply(success(`${channels} set as roleplay channels!`));

        break;
      }
      case "remove": {
        if (!channelIds.length)
          return interaction.editReply(error("Invalid channels provided"));

        rpapi.removeChannels(channelIds);
        interaction.editReply(
          success(`${channels} removed as roleplay channels!`)
        );
        break;
      }
      case "add": {
        if (!channelIds.length)
          return interaction.editReply(error("Invalid channels provided"));

        rpapi.addChannels(channelIds);
        interaction.editReply(
          success(`${channels} added as roleplay channels!`)
        );
        break;
      }

      case "link-list": {
        let roleplayChannels = await rpapi.getChannels();

        let content = "# Places\n";

        for (let rpchannel of roleplayChannels) {
          let links = await rpapi.getLinkChannel(rpchannel);
          let parsedLinks = links.map((l) => "<#" + l + ">").join(" ");

          content += `<#${rpchannel}> -> ${
            !links.length ? "*no linked channels*" : parsedLinks
          }\n`;
        }

        interaction.channel.send(
          content === "" ? "*No roleplay channels setup*" : content
        );

        break;
      }

      case "link": {
        if (!channelIds.length || !mainChannelId.length)
          return interaction.editReply(error("Invalid channels provided"));

        rpapi.linkChannels(mainChannelId[0], channelIds);

        let links = await rpapi.getLinkChannel(mainChannelId[0]);
        interaction.editReply(
          success(
            `Done! ${links
              .map((l) => "<#" + l + ">")
              .join(" ")} are now linked to <#${mainChannelId[0]}>`
          )
        );
        break;
      }

      case "unlink": {
        if (!mainChannelId.length)
          return interaction.editReply(error("Invalid channels provided"));

        let deleteAllBtn = new ButtonBuilder()
          .setCustomId("delall")
          .setLabel("Unlink All")
          .setStyle(ButtonStyle.Danger);

        let deleteOneBtn = new ButtonBuilder()
          .setCustomId("delone")
          .setLabel("Unlink One")
          .setStyle(ButtonStyle.Primary);

        let msg = await interaction.editReply({
          content: `Wait! Would you like to unlink all places to <#${mainChannelId[0]}> or just unlink one?`,
          components: [
            new ActionRowBuilder().setComponents(deleteAllBtn, deleteOneBtn),
          ],
        });

        let collector = msg.createMessageComponentCollector({
          max: 1,
          filter: (i) => i.user.id === interaction.user.id,
        });

        collector.on("collect", async (i) => {
          switch (i.customId) {
            case "delall": {
              rpapi.unlinkChannels(mainChannelId[0]);
              interaction.editReply({ components: [], content: "_ _" });
              interaction.editReply(
                success(
                  `Done! All places are unlinked from <#${mainChannelId[0]}>!`
                )
              );
              break;
            }

            case "delone": {
              interaction.editReply({
                components: [],
                content: `Select a place to set unaccessible from <#${mainChannelId[0]}>`,
              });

              let channel = await selector(interaction, true, mainChannelId[0]);

              await rpapi.unlinkChannel(mainChannelId[0], channel.id);

              let links = await rpapi.getLinkChannel(mainChannelId[0]);

              interaction.editReply(
                success(
                  `Done! ${links
                    .map((l) => "<#" + l + ">")
                    .join(" ")} are actually linked to <#${mainChannelId[0]}>`
                )
              );
              break;
            }
          }
        });

        break;
      }
    }
  }
}

module.exports = exec;
