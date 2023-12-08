const { ChatInputCommandInteraction } = require("discord.js");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
function exec(interaction, { env, now }) {
  interaction.reply(
    `:ping_pong: Pong! Bot responded within ${Date.now() - now}ms`
  );
}

module.exports = exec;
