module.exports = async (guild) => {
  guild.client.user.setActivity({
    type: ActivityType.Playing,
    name: `Managing roleplay in ${await client.guilds
      .fetch()
      .then((g) => g.size)} guilds`,
  });
};
