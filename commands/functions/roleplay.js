const { ChatInputCommandInteraction } = require("discord.js");
let { RoleplayManager } = require("../../utils/db");
const selector = require("../../utils/channelSelector");

/**
 * The exec command for the /roleplay command
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {process.env} env
 * @param {Date} now
 */
async function exec(interaction, env, now, { error, information, success }) {
  const rpapi = new RoleplayManager(interaction.guildId);
  const subCommandGroup = interaction.options.getSubcommandGroup();

  if (subCommandGroup === "channels") {
    const sc = interaction.options.getSubcommand();
    const channels = interaction.options.getString("channels");

    // Gets the channels IDs
    let channelIds = [...channels.matchAll(/<#([0-9]{19})>/g)].map((d) => d[1]);

    if (!channelIds.length)
      return interaction.editReply(error("Invalid channels provided"));

    switch (sc) {
      case "set": {
        rpapi.setChannels(channelIds);
        interaction.editReply(success(`${channels} set as roleplay channels!`));

        break;
      }
      case "remove": {
        rpapi.removeChannels(channelIds);
        interaction.editReply(
          success(`${channels} removed as roleplay channels!`)
        );
        break;
      }
      case "add": {
        rpapi.addChannels(channelIds);
        interaction.editReply(
          success(`${channels} added as roleplay channels!`)
        );
        break;
      }
    }
  }
}

module.exports = exec;
