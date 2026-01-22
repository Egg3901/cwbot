# Architecture

## Overview
This project is a Discord bot for the "Corporate Warfare" game. It allows users to view profiles, corporations, markets, and leaderboards directly from Discord. It also supports syncing Discord members with game profiles.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: discord.js (v14)
- **Database**: SQLite (better-sqlite3)
- **API Integration**: REST API (native fetch)

## Directory Structure
- `src/commands`: Slash command definitions.
- `src/events`: Discord event handlers.
- `src/interactions`: Interaction routing and middleware.
- `src/services`: Business logic and external API integration.
- `src/database`: Database schema and repositories.
- `src/config`: Configuration and constants.

## Core Components

### 1. Command Handling
Slash commands are registered in `deploy-commands.js` and handled via `src/interactions/router.js`. Commands are modularized in `src/commands/`.

### 2. Corporate Warfare API Service
Located in `src/services/corporateWarfareApi.js`.
- Handles communication with `https://corporate-warfare.com/api`.
- Implements caching (TTL) to avoid rate limits.
- Endpoints:
  - `GET /profile/:id`
  - `GET /corporation/:id`
  - `GET /leaderboard`
  - `GET /game/time`
  - `GET /markets/states/:code`
  - `GET /markets/commodities`
  - `POST /discord/sync`

### 3. Database
Uses SQLite for local storage.
- `userRepository`: Stores mappings between Discord users and Game profiles.
- `ticketRepository`: Manages support tickets (if enabled).

## External Integrations

### Corporate Warfare API
The bot acts as a client to the game's API.
- **Base URL**: `https://corporate-warfare.com/api` (configurable via `GAME_API_BASE_URL`)
- **Authentication**: Some endpoints require `X-Bot-Token`.

## Deployment
- Runs as a persistent Node.js process.
- Requires `.env` for secrets (`DISCORD_TOKEN`, `DISCORD_BOT_API_TOKEN`, etc.).
