# Corporate Warfare Discord Bot

A modular Discord.js bot for the Corporate Warfare game.

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Run `npm run deploy` to register slash commands
5. Run `npm run dev` for development or `npm start` for production

## Features

- **Ticketing System** - Support ticket creation and management
- **Welcome Messages** - Customizable member welcome system
- **Help Commands** - Beautiful embedded help menus
- **Starboard** - Star reaction-based message highlighting

## Project Structure

```
src/
├── index.js           # Bot entry point
├── config/            # Configuration
├── handlers/          # Event and command loaders
├── events/            # Discord event handlers
├── commands/          # Slash commands by category
└── modules/           # Feature modules
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| DISCORD_TOKEN | Your bot token from Discord Developer Portal |
| CLIENT_ID | Your application's client ID |
| GUILD_ID | Development server ID (optional, for faster command deployment) |
