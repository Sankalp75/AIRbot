const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');
const play = require('play-dl');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const player = createAudioPlayer();
let connection = null;
let queue = [];
let isPlaying = false;
let currentProcess = null;

const songs = require('./songs');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function killProcess() {
  if (currentProcess) {
    try { currentProcess.yt.kill(); } catch {}
    try { currentProcess.ffmpeg.kill(); } catch {}
    currentProcess = null;
  }
}

async function playNext() {
  if (queue.length === 0) queue.push(...shuffle([...songs]));
  const title = queue.shift();
  try {
    const results = await play.search(title, { limit: 1 });
    if (!results.length) return playNext();
    const url = results[0].url;
    killProcess();
    const yt = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', '--no-warnings', url], { stdio: ['ignore', 'pipe', 'ignore'] });
    const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1'], { stdio: ['pipe', 'pipe', 'ignore'] });
    yt.stdout.pipe(ffmpeg.stdin);
    currentProcess = { yt, ffmpeg };
    const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.Raw });
    player.play(resource);
    isPlaying = true;
    console.log(`Playing: ${title}`);
    yt.on('error', () => {});
    ffmpeg.on('error', () => {});
  } catch (e) {
    console.error(`Failed: ${title} - ${e.message}`);
    playNext();
  }
}

player.on(AudioPlayerStatus.Idle, () => {
  isPlaying = false;
  killProcess();
  playNext();
});

player.on('error', () => {
  killProcess();
  playNext();
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Hindi hits', { type: 2 });
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
    killProcess();
    connection.destroy();
    connection = null;
    queue = [];
    isPlaying = false;
    msg.reply('Left the channel.');
  }
});

client.login(process.env.TOKEN);
