const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
let { CharacterManager } = require("../../utils/db");
let selector = require("../../utils/selector");
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { error, env, now, information, success }) {
  let brackets = interaction.options.getString("brackets");
  let bio = interaction.options.getString("bio");
  let avatar = interaction.options.getAttachment("avatar");
  let charaapi = new CharacterManager(interaction.user.id);

  if (!brackets && !bio && !avatar)
    return interaction.editReply(
      error("You must specify at least on parameter to update...")
    );
  let object = {};

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

  if (bio) {
    if (bio.length >= 4096)
      return interaction.editReply(
        error("Biography length must be inferior to 4096 characters.")
      );
    object.bio = bio;
  }

  if (brackets) object.brackets = brackets;

  interaction.editReply(information("Select a character to update"));

  let _id = await selector(interaction, interaction.user.id);
  let result = await charaapi.update(_id, object);
  let chara = await charaapi.get(_id);
  if (!result.acknowledged)
    return interaction.editReply(
      error("We couldn't update your character, an error occured.")
    );

  interaction.editReply(success(`${chara.name} got updated!`));

  let embed = new EmbedBuilder()
    .setAuthor({
      name: interaction.user.username,
      icon_url: interaction.user.displayAvatarURL(),
    })
    .setTitle(chara.name)
    .setThumbnail(chara.icon || interaction.client.user.displayAvatarURL())
    .setDescription(chara.bio || "*no biography set*")
    .setFields({ name: "Brackets", value: chara.brackets })
    .setColor(0xffd966)
    .setTimestamp(Date.now())
    .setFooter({
      text: "Ideal Roleplay",
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  const message = await interaction.channel.send({ embeds: [embed] });
  interaction.deleteReply();

  setTimeout(() => {
    message.delete();
  }, 4000);
}

module.exports = exec;
