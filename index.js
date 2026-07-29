const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const player = createAudioPlayer();
let connection = null;
let queue = [];
let isPlaying = false;

const songs = require('./songs');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function playNext() {
  if (queue.length === 0) {
    queue.push(...shuffle([...songs]));
  }
  const title = queue.shift();
  try {
    const results = await play.search(title, { limit: 1 });
    if (!results.length) return playNext();
    const stream = await play.stream(results[0].url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    player.play(resource);
    isPlaying = true;
    console.log(`Playing: ${title}`);
  } catch (e) {
    console.error(`Failed to play: ${title}`, e.message);
    playNext();
  }
}

player.on(AudioPlayerStatus.Idle, () => {
  isPlaying = false;
  playNext();
});

player.on('error', () => playNext());

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Hindi hits 🎵', { type: 2 });
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(' ');
  const cmd = args[0].toLowerCase();

  if (cmd === '!play' || cmd === '!join') {
    const vc = msg.member?.voice.channel;
    if (!vc) return msg.reply('Join a voice channel first.');
    if (connection) return msg.reply('Already connected.');
    connection = joinVoiceChannel({ channelId: vc.id, guildId: vc.guild.id, adapterCreator: vc.guild.voiceAdapterCreator });
    connection.subscribe(player);
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signing, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        connection.destroy();
        connection = null;
      }
    });
    queue.push(...shuffle([...songs]));
    playNext();
    msg.reply(`Joined ${vc.name} and started playing Hindi hits!`);
  }

  if (cmd === '!skip') {
    if (!isPlaying) return msg.reply('Nothing playing.');
    player.stop();
    msg.reply('Skipped.');
  }

  if (cmd === '!stop' || cmd === '!leave') {
    if (!connection) return msg.reply('Not in a voice channel.');
    player.stop();
    connection.destroy();
    connection = null;
    queue = [];
    isPlaying = false;
    msg.reply('Left the channel.');
  }
});

client.login(process.env.TOKEN);
