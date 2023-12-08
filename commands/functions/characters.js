const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
let { Player, CharacterManager } = require("../../utils/db");
const selector = require("../../utils/selector");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
module.exports = async (
  interaction,
  env,
  now,
  { error, information, success }
) => {
  let user = interaction.options.getUser("mention") || interaction.user;
  let charaapi = new CharacterManager(user.id);

  async function makeEmbed(_id) {
    let chara = await charaapi.get(_id);
    let embed = new EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setTitle(chara.name)
      .setDescription(chara.bio || "*no biography set*")
      .setFields({ name: "Brackets", value: chara.brackets })
      .setThumbnail(
        chara.icon ||
          "https://t3.ftcdn.net/jpg/02/11/82/46/360_F_211824632_UGp8XQ8OYqBnoPJ2QXH5BCqYbAxqvK9F.jpg"
      )
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
      await selector(interaction, user.id).then(updateEmbed);

      let updatedEmbed = await makeEmbed(charaId);
      msg.edit({ embeds: [updatedEmbed] });
    } catch {
      interaction.editReply(error("Couldn't find any characters"));
    }
  }

  try {
    await selector(interaction, user.id).then(updateEmbed);
  } catch {
    interaction.editReply(error("Couldn't find any characters"));
  }
};
