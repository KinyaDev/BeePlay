const { Message } = require("discord.js");
const { CharacterManager, NPCManager, PremiumManager } = require("../utils/db");
const { default: OpenAI } = require("openai");
const env = require("../utils/env");

/**
 * @param {Message} message
 */
module.exports = async (message) => {
  if (message.channel.isDMBased()) return;
  if (message.author.id === message.client.user.id) return;
  let prapi = new PremiumManager(message.guildId);

  async function respondNpc() {
    if (!(await prapi.hasPremium())) return;

    message.channel.sendTyping();
    let aiClient = new OpenAI({
      apiKey: env.OPENAI_TOKEN,
      organization: env.OPENAI_ORGA,
    });

    let npcapi = new NPCManager(message.guild.id);
    let npclist = await npcapi.list();

    for (let npc of npclist) {
      if (
        npc.channelId === message.channel.id &&
        npc.name !== message.author.username
      ) {
        try {
          let messageList = await npcapi.getMessages(npc._id);

          let npcMsg = `You hear ${message.author.username} saying "${message.content}"`;
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
            max_tokens: 200,
          });

          let msg = response.choices[0].message;

          if (msg.content.toLowerCase().includes("no-action")) return;

          npcapi.insertMessage(npc._id, "user", npcMsg);
          setTimeout(() => {
            npcapi.insertMessage(npc._id, "assistant", msg.content);
          }, 100);
          npcapi.webhookSend(npc._id, msg.content, message.channel);
        } catch (e) {
          console.error(e);
          message.reply(`Sorry, we couldn't connect to the API`);
        }
      }
    }
  }

  let charaManager = new CharacterManager(message.author.id);

  let isTriggeredWebhook = false;
  let isSimpleMessage = true;

  for (let character of await charaManager.list()) {
    let splittedBrackets = character.brackets.split("text");

    if (
      message.content.startsWith(splittedBrackets[0]) &&
      message.content.endsWith(splittedBrackets[1]) &&
      !message.author.bot
    ) {
      let parsedMsg = message.content
        .replace(new RegExp(`^${splittedBrackets[0]}`, "g"), "")
        .replace(new RegExp(`${splittedBrackets[1]}$`, "g"), "");

      message.delete();
      charaManager.send(character._id, parsedMsg, message.channel);

      isTriggeredWebhook = true;
      isSimpleMessage = false;
    }
  }

  setTimeout(async () => {
    if (isTriggeredWebhook && !isSimpleMessage) await respondNpc();
    if (!isTriggeredWebhook && isSimpleMessage) await respondNpc();
  }, 200);
};
