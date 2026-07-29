# AIRbot

A Discord music bot for audio channels that plays random well-known Hindi songs from YouTube. No video, no ads — just music across all eras, from Kishore Kumar to Arijit Singh.

## Features

- **Random playback** — shuffles through 100+ iconic Hindi songs
- **Ad-free streaming** — pulls audio directly from YouTube media streams
- **Lightweight** — join a voice channel and play, no complex setup
- **Era-spanning library** — 50s classics to today's chartbusters

## Commands

| Command | Description |
|---------|-------------|
| `!play` or `!join` | Bot joins your voice channel and starts playing |
| `!skip` | Skip the current song |
| `!stop` or `!leave` | Bot disconnects and stops playback |

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Discord application](https://discord.com/developers/applications) with a bot token

### Installation

```bash
git clone https://github.com/Sankalp75/AIRbot.git
cd AIRbot
npm install
```

### Configuration

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your Discord bot token:
   ```
   TOKEN=your_bot_token_here
   ```

### Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create an application → Bot → **Reset Token** → copy it
3. Under **Bot** → **Privileged Gateway Intents**, enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent (optional)
4. Under **OAuth2** → **URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Connect`, `Speak`
   - Open the generated URL and invite the bot to your server

### Run

```bash
npm start
```

## Project Structure

```
AIRbot/
├── index.js          # Main bot logic
├── songs.js          # Hindi song library (100 tracks)
├── .env.example      # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Song Library

The bot includes 100 well-known Hindi songs spanning:
- **Golden Era** — Kishore Kumar, Lata Mangeshkar, Mohammed Rafi, Mukesh
- **90s** — Kumar Sanu, Udit Narayan, Alka Yagnik, Kavita Krishnamurthy
- **2000s** — K.K., Shaan, Sunidhi Chauhan, Shreya Ghoshal
- **2010s+** — Arijit Singh, Jubin Nautiyal, B Praak, King

## License

ISC
