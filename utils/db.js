const { MongoClient, ObjectId } = require("mongodb");
const env = require("./env");
const { TextChannel } = require("discord.js");
const dayjs = require("dayjs");
const client = new MongoClient(env.MONGO_STRING);

client.connect().then(() => {
  console.log("Connected to the database");
});

let db = client.db("beeplay");
let characters = db.collection("characters");
let guilds = db.collection("guilds");
let premium = db.collection("premium");
let npcs = db.collection("npcs");
let premiumRequest = db.collection("premium_requests");
let npcmessages = db.collection("npc_messages");
let trials = db.collection("trials");
let events = db.collection("events");

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

    (async () => {
      if ((await this.hasTrial()) && (await this.hasTrialEnded(Date.now()))) {
        this.removePremium();
        trials.insertOne({ guildId: this.guildId });
      }
    })();
  }

  async hasRegisteredEndedTrial() {
    let data = await trials.findOne({ guildId: this.guildId });
    return data;
  }

  async setTrial() {
    if (await this.hasPremium()) return;

    premium.insertOne({ guildId: this.guildId, trialDate: Date.now() });
  }

  async hasTrialEnded(date) {
    let data = await this.get();
    let trialDate = new Date(data.trialDate);
    trialDate.setDate(trialDate.getDate() + 1);
    return dayjs(date).isAfter(trialDate);
  }

  async hasTrial() {
    let data = await this.get();
    return new Object(data).hasOwnProperty("trialDate");
  }

  async setPremium() {
    if (await this.hasPremium()) return;
    premium.insertOne({ guildId: this.guildId });
  }

  async removePremium() {
    premium.deleteOne({ guildId: this.guildId });
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
    let parsedSystem = `You play a character in roleplay called ${npcData.name}.
    You reside in ${channelName} and movement is restricted to your current location.    
    People can talk to you. Say "no-action" if people aren't talking to you, otherwise say your response directly.
    Your lore or personnality is "${npcData.prompt}"`;

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
    await npcmessages.deleteMany({ npcId: _id });
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
        name: "Ideal Roleplay Character",
        avatar: channel.client.user.displayAvatarURL(),
      });

    wh.send({
      username: chara.name,
      avatarURL: chara.icon || channel.client.user.displayAvatarURL(),
      content,
    });
  }
}

class EventManager {
  constructor(guildId) {
    this.guildId = guildId;
  }

  async getEvents(filter) {
    let obj = { guildId: this.guildId };

    if (filter) Object.assign(obj, filter);
    return await events.find(obj).toArray();
  }

  async roleMessage(roleId, channelId, inMessage, outMessage) {
    let result = await events.insertOne({
      guildId: this.guildId,
      type: "rolemsg",
      roleId,
      channelId,
      inMessage,
      outMessage,
    });

    return result;
  }

  async deleteRoleMessage(_id) {
    events.deleteOne({ _id });
  }

  async joinMessage(channelId, message) {
    let result = await events.insertOne({
      guildId: this.guildId,
      type: "joinmsg",
      channelId,
      message,
    });

    return result;
  }

  async deleteJoinMessage(_id) {
    events.deleteOne({ guildId: this.guildId, _id });
  }

  async leaveMessage(channelId, message) {
    let result = await events.insertOne({
      guildId: this.guildId,
      type: "leavemsg",
      channelId,
      message,
    });

    return result;
  }

  async deleteLeaveMessage(_id) {
    events.deleteOne({ guildId: this.guildId, _id });
  }

  async joinRole(roleId) {
    let result = await events.insertOne({
      guildId: this.guildId,
      type: "joinrole",
      roleId,
    });

    return result;
  }

  async joinBotRole(roleId) {
    let result = await events.insertOne({
      guildId: this.guildId,
      type: "joinbotrole",
      roleId,
    });

    return result;
  }

  async deleteJoinRole(_id) {
    events.deleteOne({ guildId: this.guildId, _id });
  }
}

class PremiumRequestManager {
  constructor(guildId) {
    this.guildId = guildId;
  }

  getRequest() {
    return premiumRequest.findOne({ guildId: this.guildId });
  }

  static getRequest(code) {
    return premiumRequest.findOne({ code });
  }

  async createRequest(code) {
    let request = await this.getRequest();
    if (request) return false;

    premiumRequest.insertOne({ guildId: this.guildId, code });
  }

  static processPremium(code) {
    return new Promise(async (resolve, reject) => {
      let request = await this.getRequest(code);
      if (request) {
        let premiumApi = new PremiumManager(request.guildId);

        if (await premiumApi.hasPremium()) return reject("already");

        premiumApi.setPremium();
        resolve();
      } else reject("invalid-code");
    });
  }
}

module.exports = {
  CharacterManager,
  RoleplayManager,
  PremiumManager,
  NPCManager,
  EventManager,
  PremiumManager,
  PremiumRequestManager,
};
