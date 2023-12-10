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
      npc.name !== message.author.username &&
      message.author.bot
    ) {
      try {
        let messageList = await npcapi.getMessages(npc._id);

        let npcMsg = `${message.author.username}: "${message.content}". Say only "no-action" if ${message.author.username} isn't talking to you. Write directly your message without comments and you don't have to assist him/her`;
        messageList.push({
          npcId: npc._id,
          role: "user",
          content: npcMsg,
        });

        let parsedMessages = [];

        for (let msg of messageList) {
          parsedMessages.push({ role: msg.role, content: msg.content });
        }

        let response = await aiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: parsedMessages,
        });

        let msg = response.choices[0].message;

        if (msg.content === "no-action") return;

        npcapi.insertMessage(npc._id, "user", npcMsg);

        npcapi.insertMessage(npc._id, "assistant", msg.content);
        npcapi.webhookSend(npc._id, msg.content, message.channel);
      } catch (e) {
        console.error(e);
        message.reply(
          `Ah!! Sorry... We don't have enough money or a a bank account setup for the moment to use the AI Service. Please try later. `
        );
      }
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
