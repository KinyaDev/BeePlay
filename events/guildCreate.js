const { ActivityType, Guild } = require("discord.js");

module.exports =
  /**
   *
   * @param {Guild} guild
   */
  async (guild) => {
    guild.client.user.setActivity({
      type: ActivityType.Playing,
      name: `Roleplaying in ${await guild.client.guilds
        .fetch()
        .then((g) => g.size)} guilds`,
    });

    let owner = await guild.fetchOwner();

    let msg = {
      embeds: [
        {
          author: {
            name: owner.user.username,
            icon_url: owner.user.displayAvatarURL(),
          },
          title: "Thanks for inviting me",
          description:
            "Hi. I'm " +
            guild.client.user.displayName +
            ". And I can make your roleplays more immersive ! Try `/help` to see the list of commands",
          color: 0xf4d03f,
        },
      ],
    };

    try {
      if (guild.systemChannel) {
        guild.systemChannel.send(msg);
      }

      owner.send(msg);
    } catch {}
  };
