const { Message } = require("discord.js");
const { CharacterManager, NPCManager } = require("../utils/db");
const { default: OpenAI } = require("openai");
const env = require("../utils/env");
let aiClient = new OpenAI({
  apiKey: env.OPENAI_TOKEN,
  organization: env.OPENAI_ORGA,
});
/**
 * @param {Message} message
 */
module.exports = async (message) => {
  if (message.channel.isDMBased()) return;

  let npcapi = new NPCManager(message.guild.id);
  let npclist = await npcapi.list();

  for (let npc of npclist) {
    if (
      npc.channelId === message.channel.id &&
      message.mentions.parsedUsers.find(
        (u) => u.id === message.client.user.id
      ) &&
      npc.name !== message.author.username &&
      message.author.bot
    ) {
      npcapi.insertMessage(
        npc._id,
        "user",
        `You got a message from ${message.author.username} saying "${message.content}", please respond`
      );

      let messageList = await npcapi.getMessages(npc._id);

      let response = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messageList,
      });

      let msg = response.choices[0].message;
      npcapi.insertMessage(npc._id, "assistant", msg.content);

      npcapi.webhookSend(npc._id, msg.content, message.channel);
    }
  }

  if (message.author.bot) return;

  let charaManager = new CharacterManager(message.author.id);

  for (let character of await charaManager.list()) {
    let splittedBrackets = character.brackets.split("text");

    if (
      message.content.startsWith(splittedBrackets[0]) &&
      message.content.endsWith(splittedBrackets[1])
    ) {
      let parsedMsg = message.content
        .replace(new RegExp(`^${splittedBrackets[0]}`, "g"), "")
        .replace(new RegExp(`${splittedBrackets[1]}$`, "g"), "");

      message.delete();
      charaManager.send(character._id, parsedMsg, message.channel);
    }
  }
};
