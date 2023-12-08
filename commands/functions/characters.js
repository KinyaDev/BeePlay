const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
let { Player, CharacterManager } = require("../../utils/db");
const selector = require("../../utils/selector");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { error, env, now, information, success }) {
  let user = interaction.options.getUser("mention") || interaction.user;
  let charaapi = new CharacterManager(user.id);

  async function makeEmbed(_id) {
    let chara = await charaapi.get(_id);
    console.log(chara);
    let embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setTitle(chara.name)
      .setDescription(chara.bio || "*no biography set*")
      .setFields({ name: "Brackets", value: chara.brackets })
      .setThumbnail(chara.icon || interaction.client.user.displayAvatarURL())
      .setColor(0xf4d03f);

    return embed;
  }

  let charas = await charaapi.list();

  if (charas.length === 0)
    return interaction.editReply(error("Couldn't find any characters"));

  let firstEmbed = await makeEmbed((await charaapi.first())._id);
  let msg = await interaction.channel.send({ embeds: [firstEmbed] });

  async function updateEmbed(charaId) {
    try {
      let updatedEmbed = await makeEmbed(charaId);
      if (!msg.editable) return;

      msg.edit({ embeds: [updatedEmbed] });

      let charaId2 = await selector(interaction, user.id);
      await updateEmbed(charaId2);
    } catch {
      interaction.editReply(error("Couldn't find any characters"));
    }
  }

  try {
    let charaId = await selector(interaction, user.id);
    await updateEmbed(charaId);
  } catch {
    interaction.editReply(error("Couldn't find any characters"));
  }
}

module.exports = exec;
