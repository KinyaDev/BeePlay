const {
  joinVoiceChannel,
  VoiceConnection,
  getVoiceConnection,
  AudioPlayer,
  AudioResource,
  createAudioResource,
  createAudioPlayer,
} = require("@discordjs/voice");
const {
  ChatInputCommandInteraction,
  BaseGuildVoiceChannel,
} = require("discord.js");

const https = require("https");
const ytdl = require("ytdl-core");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function exec(interaction, { env, now, error, success }) {
  let subcommand = interaction.options.getSubcommand();
  let channel = interaction.options.getChannel("channel");

  switch (subcommand) {
    case "connect": {
      let channels = Array.from(await interaction.guild.channels.fetch()).map(
        (v) => v[1]
      );

      /**
       * @type {VoiceConnection | undefined}
       */
      let connection;

      if (channel && channel instanceof BaseGuildVoiceChannel) {
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: interaction.guildId,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        });
      } else {
        /**
         * @type {BaseGuildVoiceChannel}
         */
        let x;
        for (let vc of channels) {
          if (
            vc instanceof BaseGuildVoiceChannel &&
            vc.members.has(interaction.user.id)
          ) {
            x = vc;
          }
        }
        if (x) {
          connection = joinVoiceChannel({
            channelId: x.id,
            guildId: interaction.guildId,
            adapterCreator: x.guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: false,
          });
        } else
          return interaction.editReply(
            error("You are not in a voice channel!")
          );
      }

      interaction.editReply(success("Connected!"));
      break;
    }

    case "play-file": {
      let channels = Array.from(await interaction.guild.channels.fetch()).map(
        (v) => v[1]
      );

      /**
       * @type {VoiceConnection | undefined}
       */
      let connection;

      let file = interaction.options.getAttachment("file");

      if (file.contentType !== "audio/mpeg")
        return interaction.editReply(error("File must be an audio!"));

      /**
       * @type {BaseGuildVoiceChannel}
       */
      let x;
      for (let vc of channels) {
        if (
          vc instanceof BaseGuildVoiceChannel &&
          vc.members.has(interaction.user.id)
        ) {
          x = vc;
        }
      }
      if (x) {
        connection = getVoiceConnection(x.guildId);
      } else
        return interaction.editReply(error("You are not in a voice channel!"));

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: x.id,
          guildId: x.guildId,
          selfMute: false,
          selfDeaf: false,
          adapterCreator: x.guild.voiceAdapterCreator,
        });
      }

      connection.dispatchAudio();

      let audioPlayer = createAudioPlayer();

      connection.subscribe(audioPlayer);

      https.get(file.url, (stream) => {
        audioPlayer.play(createAudioResource(stream));
      });

      interaction.editReply(success("Playing!"));

      break;
    }

    case "stop": {
      let channels = Array.from(await interaction.guild.channels.fetch()).map(
        (v) => v[1]
      );

      /**
       * @type {VoiceConnection | undefined}
       */
      let connection;

      /**
       * @type {BaseGuildVoiceChannel}
       */
      let x;
      for (let vc of channels) {
        if (
          vc instanceof BaseGuildVoiceChannel &&
          vc.members.has(interaction.user.id)
        ) {
          x = vc;
        }
      }
      if (x) {
        connection = getVoiceConnection(x.guildId);
      } else
        return interaction.editReply(error("You are not in a voice channel!"));

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: x.id,
          guildId: x.guildId,
          selfMute: false,
          selfDeaf: false,
          adapterCreator: x.guild.voiceAdapterCreator,
        });
      }

      connection.dispatchAudio();
      connection.destroy();
      connection.disconnect();

      interaction.editReply(success("Stopped!"));

      break;
    }

    case "play-youtube": {
      let channels = Array.from(await interaction.guild.channels.fetch()).map(
        (v) => v[1]
      );

      /**
       * @type {VoiceConnection | undefined}
       */
      let connection;

      let url = interaction.options.getString("url");

      if (!url.startsWith("https://www.youtube.com/watch?v="))
        return interaction.editReply(
          error("It's not a youtube video or audio!")
        );

      /**
       * @type {BaseGuildVoiceChannel}
       */
      let x;
      for (let vc of channels) {
        if (
          vc instanceof BaseGuildVoiceChannel &&
          vc.members.has(interaction.user.id)
        ) {
          x = vc;
        }
      }
      if (x) {
        connection = getVoiceConnection(x.guildId);
      } else
        return interaction.editReply(error("You are not in a voice channel!"));

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: x.id,
          guildId: x.guildId,
          selfMute: false,
          selfDeaf: false,
          adapterCreator: x.guild.voiceAdapterCreator,
        });
      }

      connection.dispatchAudio();

      let audioPlayer = createAudioPlayer();

      connection.subscribe(audioPlayer);

      let stream = ytdl(url, { filter: "audioonly" });
      audioPlayer.play(createAudioResource(stream));

      interaction.editReply(success("Playing!"));

      break;
    }
  }
}

module.exports = exec;
