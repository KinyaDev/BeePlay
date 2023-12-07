const { Message } = require("discord.js");
const { CharacterManager } = require("../utils/db");

/**
 *
 * @param {Message} message
 */
module.exports = async (message) => {
  if (message.author.bot) return;
  if (message.channel.isDMBased()) return;

  let charaManager = new CharacterManager(message.author.id);

  for (let character of await charaManager.list()) {
    let splittedBrackets = character.brackets.split("text");
    if (
      !(
        message.content.startsWith(splittedBrackets[0]) &&
        message.content.endsWith(splittedBrackets[1])
      )
    )
      return;

    let parsedMsg = message.content
      .replace(new RegExp(`^${splittedBrackets[0]}`, "g"), "")
      .replace(new RegExp(`${splittedBrackets[1]}$`, "g"), "");

    message.delete();
    charaManager.send(character._id, parsedMsg, message.channel);
  }
};
