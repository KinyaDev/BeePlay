const { MongoClient, ObjectId } = require("mongodb");
const env = require("./env");
const { TextChannel } = require("discord.js");
const client = new MongoClient(env.MONGO_STRING);

client.connect().then(() => {
  console.log("Connected to the database");
});

let db = client.db("beeplay");
let characters = db.collection("characters");
let guilds = db.collection("guilds");
let premium = db.collection("premium");
let npcs = db.collection("npcs");
let npcmessages = db.collection("npc_messages");

class CharacterManager {
  constructor(userId) {
    this.userId = userId;
  }

  async register(name, icon, brackets, bio) {
    let result = await characters.insertOne({
      userId: this.userId,
      name,
      icon,
      brackets,
      bio,
    });

    return result;
  }

  unregister(_id) {
    characters.deleteOne({ userId: this.userId, _id });
  }

  /**
   *
   * @param {ObjectId} _id
   * @param {{icon?: string, brackets?: string, bio?:string}} params
   */
  async update(_id, params) {
    return await characters.updateOne(
      { userId: this.userId, _id },
      { $set: params }
    );
  }
  async get(_id) {
    return await characters.findOne({ userId: this.userId, _id });
  }
  async list() {
    return await characters.find({ userId: this.userId }).toArray();
  }

  async first() {
    return (await this.list())[0];
  }

  /**
   *
   * @param {string} content
   * @param {TextChannel} channel
   */
  async send(_id, content, channel) {
    const webhooks = await channel.fetchWebhooks();

    let wh = webhooks.find((w) => w.owner.id === channel.client.user.id);
    let chara = await this.get(_id);
    if (!wh)
      wh = await channel.createWebhook({
        name: "BeePlay Character",
        avatar: channel.client.user.displayAvatarURL(),
      });

    wh.send({
      username: chara.name,
      avatarURL: chara.icon || channel.client.user.displayAvatarURL(),
      content,
    });
  }
}

class RoleplayManager {
  constructor(guildId) {
    this.guildId = guildId;
  }

  addChannels(channelIds) {
    for (let id of channelIds) {
      guilds.insertOne({ guildId: this.guildId, type: "rp", channelId: id });
    }
  }

  removeChannels(channelIds) {
    for (let id of channelIds) {
      guilds.deleteOne({ guildId: this.guildId, type: "rp", channelId: id });
    }
  }

  setChannels(channelIds) {
    guilds.deleteMany({ guildId: this.guildId, type: "rp" });
    this.addChannels(channelIds);
  }

  async getChannels() {
    let data = await guilds
      .find({ guildId: this.guildId, type: "rp" })
      .toArray();
    return data.map((d) => d.channelId);
  }

  async linkChannels(channelId, channelIds) {
    let links = await this.getLinkChannel(channelId);
    if (links.length === 0) {
      guilds.insertOne({
        guildId: this.guildId,
        type: "link",
        channelId,
        channelIds,
      });
    } else {
      this.unlinkChannels(channelId);
      for (let id of channelIds) {
        links.push(id);
      }

      guilds.updateOne(
        { guildId: this.guildId, type: "link", channelId: channelId },
        { $set: { channelIds: links } }
      );

      return links;
    }
  }

  async unlinkChannels(channelId) {
    guilds.deleteOne({ guildId: this.guildId, type: "link", channelId });
  }

  async unlinkChannel(channelId1, channelId2) {
    let links = await this.getLinkChannel(channelId1);

    if (links.length > 1) {
      links = links.filter((l) => l !== channelId2);
      guilds.updateOne(
        { guildId: this.guildId, type: "link", channelId: channelId1 },
        { $set: { channelIds: links } }
      );
    } else if (links.length === 1) {
      guilds.deleteOne({
        guildId: this.guildId,
        type: "link",
        channelId: channelId1,
      });
    }

    return links;
  }

  async getLinkChannel(channelId) {
    let linkChannel = await guilds.findOne({
      type: "link",
      guildId: this.guildId,
      channelId,
    });

    if (linkChannel) return linkChannel.channelIds;
    return [];
  }
}

class PremiumManager {
  constructor(guildId) {
    this.guildId = guildId;
  }

  togglePremium() {
    if (this.get()) {
      premium.deleteOne({ guildId: this.guildId });
    } else premium.insertOne({ guildId: this.guildId });
  }

  async get() {
    let data = await premium.findOne({ guildId: this.guildId });

    return data;
  }

  async hasPremium() {
    return !!(await this.get());
  }
}

class NPCManager {
  constructor(guildId) {
    this.guildId = guildId;
  }

  async register(channelId, name, icon, prompt) {
    let result = await npcs.insertOne({
      guildId: this.guildId,
      channelId,
      name,
      icon,
      prompt,
    });

    return result;
  }

  async list(channelId) {
    if (channelId)
      return await npcs.find({ guildId: this.guildId, channelId }).toArray();

    return await npcs.find({ guildId: this.guildId }).toArray();
  }

  async unregister(_id) {
    let result = await npcs.deleteOne({ guildId: this.guildId, _id });

    return result;
  }

  async get(_id) {
    return await npcs.findOne({ guildId: this.guildId, _id });
  }

  async startNPC(_id, channelName) {
    let npcData = await this.get(_id);
    let parsedSystem = `You are now an NPC in a roleplay discussion and you live in/at ${channelName}. You can't change places unless the place you want to get to is literally where you live.
    Your name is ${npcData.data} and here is your lore with all information:\n${npcData.prompt}`;

    npcmessages.insertOne({
      npcId: _id,
      role: "system",
      content: parsedSystem,
    });
  }

  async insertMessage(_id, role, parsedContent) {
    npcmessages.insertOne({ npcId: _id, role, content: parsedContent });
  }

  async getMessages(_id) {
    return await npcmessages.find({ npcId: _id }).toArray();
  }

  async clearMessage(_id) {
    await npcmessages.deleteMany({ guildId: this.guildId, npcId: _id });
  }

  /**
   *
   * @param {string} content
   * @param {TextChannel} channel
   */
  async webhookSend(_id, content, channel) {
    const webhooks = await channel.fetchWebhooks();

    let wh = webhooks.find((w) => w.owner.id === channel.client.user.id);
    let chara = await this.get(_id);
    if (!wh)
      wh = await channel.createWebhook({
        name: "BeePlay Character",
        avatar: channel.client.user.displayAvatarURL(),
      });

    wh.send({
      username: chara.name,
      avatarURL: chara.icon || channel.client.user.displayAvatarURL(),
      content,
    });
  }
}

module.exports = {
  CharacterManager,
  RoleplayManager,
  PremiumManager,
  NPCManager,
};
