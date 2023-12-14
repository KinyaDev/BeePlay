const { Message } = require("discord.js");
const { CharacterManager, NPCManager, PremiumManager } = require("../utils/db");
const { default: OpenAI } = require("openai");
const env = require("../utils/env");

const { createTunnel } = require("tunnel-ssh");

const sshOptions = {
  host: env.AI_HOST,
  port: 22,
  username: "tunnel_user",
  password: env.AI_PWD,
};

function mySimpleTunnel(sshOptions, port, autoClose = true) {
  let forwardOptions = {
    srcAddr: "127.0.0.1",
    srcPort: port,
    dstAddr: "127.0.0.1",
    dstPort: port,
  };

  let tunnelOptions = {
    autoClose: autoClose,
  };

  let serverOptions = {
    port: port,
  };

  return createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
}

let tunnel = mySimpleTunnel(sshOptions, 4891);

let aiClient = new OpenAI({
  apiKey: env.OPENAI_TOKEN,
  organization: env.OPENAI_ORGA,
  baseURL: "http://localhost:4891/v1",
});
/**
 * @param {Message} message
 */
module.exports = async (message) => {
  if (message.channel.isDMBased()) return;
  if (message.author.id === message.client.user.id) return;
  let prapi = new PremiumManager(message.guildId);
  if (!(await prapi.hasPremium())) return;

  async function respondNpc() {
    let npcapi = new NPCManager(message.guild.id);
    let npclist = await npcapi.list();

    for (let npc of npclist) {
      if (
        npc.channelId === message.channel.id &&
        npc.name !== message.author.username
      ) {
        try {
          let messageList = await npcapi.getMessages(npc._id);

          let npcMsg = `${message.author.username}: "${message.content}". Say only "no-action" if ${message.author.username} isn't talking to you. Write directly your message without comments.`;
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
            model: "gpt4all-j-v1.3-groovy",
            messages: parsedMessages,
            max_tokens: 50,
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
          message.reply(
            `Ah!! Sorry... We don't have enough money or a a bank account setup for the moment to use the AI Service. Please try later. `
          );
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

      message.channel.sendTyping();
      isTriggeredWebhook = true;
      isSimpleMessage = false;
    }
  }

  setTimeout(async () => {
    if (isTriggeredWebhook && !isSimpleMessage) await respondNpc();
    if (!isTriggeredWebhook && isSimpleMessage) await respondNpc();
  }, 200);
};
