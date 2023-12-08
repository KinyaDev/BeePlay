const { ChatInputCommandInteraction } = require("discord.js");
let { Player, CharacterManager } = require("../../utils/db");
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { error, env, now, information, success }) {
  let name = interaction.options.getString("name", true);
  let brackets = interaction.options.getString("brackets", true);
  let bio = interaction.options.getString("bio");
  let avatar = interaction.options.getAttachment("avatar");

  let object = { name, brackets };

  if (avatar) {
    if (
      !(
        avatar.contentType === "image/png" ||
        avatar.contentType === "image/jpeg" ||
        avatar.contentType === "image/gif"
      )
    )
      return sendError(`Image must be type PNG, JPEG or GIF !`);

    object.icon = avatar.url;
  }

  if (bio) {
    if (bio.length >= 4096)
      return interaction.editReply(
        error("Biography length must be inferior to 4096 characters.")
      );
    object.bio = bio;
  }

  let result = await new CharacterManager(interaction.user.id).register(
    object.name,
    object.icon,
    object.brackets,
    object.bio
  );

  if (!result.acknowledged)
    return interaction.editReply(
      error("We couldn't register your character, an error occured.")
    );

  interaction.editReply(success(`${object.name} finally has been made !`));

  interaction.channel.send({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: `${object.name}`,
        thumbnail: {
          url: object.icon || interaction.client.user.displayAvatarURL(),
        },
        description: object.bio || "*no biography set*",
        fields: [
          {
            name: "Brackets",
            value: object.brackets,
          },
        ],
        color: 0xffd966,
      },
    ],
  });
}

module.exports = exec;
