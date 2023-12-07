const { ChatInputCommandInteraction } = require("discord.js");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
module.exports = (interaction, env, now) => {
  interaction.reply(
    `:ping_pong: Pong! Bot responded within ${Date.now() - now}ms`
  );
};
