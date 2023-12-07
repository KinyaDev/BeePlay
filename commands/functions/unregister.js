const { ChatInputCommandInteraction } = require("discord.js");
let { Player, CharacterManager } = require("../../utils/db");
const selector = require("../../utils/selector");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
module.exports = async (
  interaction,
  env,
  now,
  { error, information, success }
) => {
  try {
    interaction.editReply({
      ephemeral: true,
      content: "Select a character to delete!",
    });

    let charaId = await selector(interaction, interaction.user.id);
    let charaapi = new CharacterManager(interaction.user.id);
    let chara = await charaapi.get(charaId);

    charaapi.unregister(charaId);

    sendSuccess(`${chara.name} has been successfully deleted!`);
  } catch {
    interaction.editReply(error("Couldn't find any character..."));
  }
};
