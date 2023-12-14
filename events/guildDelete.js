const { ActivityType } = require("discord.js");

module.exports = async (guild) => {
  guild.client.user.setActivity({
    type: ActivityType.Playing,
    name: `Roleplaying in ${await guild.client.guilds
      .fetch()
      .then((g) => g.size)} guilds`,
  });
};
