const { MongoClient } = require("mongodb");
const env = require("./env");
const { TextChannel } = require("discord.js");
const client = new MongoClient(env.MONGO_STRING);

client.connect().then(() => {
  console.log("Connected to the database");
});

let db = client.db("beeplay");
let characters = db.collection("characters");
let guilds = db.collection("guilds");

class Player {
  constructor(userId) {
    this.userId = userId;
  }

  characters = new CharacterManager(this.userId);
}

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

module.exports = {
  CharacterManager,
  characters,
  Player,
  RoleplayManager,
};
