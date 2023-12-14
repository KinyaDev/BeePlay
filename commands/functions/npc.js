const {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
let { PremiumManager, NPCManager } = require("../../utils/db");
const { ObjectId } = require("mongodb");
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { error, env, now, information, success }) {
  let premiumManager = new PremiumManager(interaction.guildId);
  let npcapi = new NPCManager(interaction.guildId);

  let hasPremium = await premiumManager.hasPremium();
  //  && interaction.user.id !== "505832674217295875"
  if (!hasPremium)
    return interaction.editReply(
      error("This is a premium feature, please buy the subscription.")
    );

  let subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "create": {
      let channel = interaction.options.getChannel("channel", true);
      let name = interaction.options.getString("name", true);
      let prompt = interaction.options.getString("prompt", true);
      let avatar = interaction.options.getAttachment("avatar");

      let object = {
        channelId: channel.id,
        prompt,
        name,
      };

      if (avatar) {
        if (
          !(
            avatar.contentType === "image/png" ||
            avatar.contentType === "image/jpeg" ||
            avatar.contentType === "image/gif"
          )
        )
          return interaction.editReply(
            error(`Image must be type PNG, JPEG or GIF !`)
          );

        object.icon = avatar.url;
      }

      let { insertedId } = await npcapi.register(
        object.channelId,
        object.name,
        object.icon,
        object.prompt
      );

      let npc = await npcapi.get(insertedId);
      console.log(npc, insertedId);

      interaction.editReply(success(`${npc.name} is now live in ${channel}!`));
      npcapi.startNPC(npc._id, channel.name);

      break;
    }

    case "delete": {
      let list = await npcapi.list();
      let selectmenu = new StringSelectMenuBuilder()
        .setCustomId("delnpc")
        .setPlaceholder("Make a selection");

      for (let npc of list) {
        let ch = await interaction.guild.channels.fetch(npc.channelId);
        selectmenu.addOptions({
          label: `${npc.name} - ${ch.name}`,
          value: npc._id.toString(),
        });
      }

      if (!selectmenu.options.length)
        return interaction.editReply(error("Couldn't find any NPCs"));

      let msg = await interaction.editReply({
        content: "Select a NPC to delete",
        components: [new ActionRowBuilder().addComponents(selectmenu)],
      });

      let collector = msg.createMessageComponentCollector();
      collector.on("collect", async (i) => {
        let _id = new ObjectId(i.values[0]);
        let npc = await npcapi.get(_id);
        collector.stop();
        interaction.editReply(success(`${npc.name} has been deleted!`));
        interaction.editReply({ components: [] });

        npcapi.unregister(_id);
        npcapi.clearMessage(_id);
      });
      break;
    }

    case "list": {
      let npclist = await npcapi.list();
      let embeds = [];

      for (let npc of npclist) {
        embeds.push(
          new EmbedBuilder()
            .setTitle(npc.name)
            .setThumbnail(
              npc.icon || interaction.client.user.displayAvatarURL()
            )
            .setDescription(npc.prompt)
            .setFields({ name: "Channel", value: `<#${npc.channelId}>` })
        );
      }

      interaction.channel.send({ content: `# NPCs`, embeds });
      break;
    }
  }
}

module.exports = exec;
