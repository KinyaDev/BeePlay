const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setDescription("Play around voice channels!")
  .addSubcommand((sc) =>
    sc
      .setName("connect")
      .setDescription("Connect the bot to your voice channel")
      .addChannelOption((sc) =>
        sc.setName("channel").setDescription("Voice channel")
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName("play-file")
      .setDescription("Play a file in the voice channel")
      .addAttachmentOption((opt) =>
        opt.setName("file").setDescription(".mp3 file").setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName("play-youtube")
      .setDescription("Play a youtube audio in the voice channel")
      .addStringOption((opt) =>
        opt.setName("url").setDescription("Youtube URL").setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc.setName("stop").setDescription("Stop the playing audio")
  );
