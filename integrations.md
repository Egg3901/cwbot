# Corporate Warfare Discord Bot Guide

This doc is the working spec for the Discord bot component. It focuses on the `/sync` command that links Discord guild members to website profiles, plus the existing game APIs the bot can use.

## Goal: `/sync` command

The `/sync` command should:
- Pull members from a Discord server.
- Send those Discord IDs to the game backend.
- Receive matched website profiles (if users have linked Discord).
- Store the mapping in the bot DB for fast lookups and role/verification workflows.

## Required API (now available)

### Sync endpoint

`POST /api/discord/sync`

**Auth**
- Provide a shared secret with either:
  - `X-Bot-Token: <DISCORD_BOT_API_TOKEN>` or
  - `Authorization: Bearer <DISCORD_BOT_API_TOKEN>`
- Configure `DISCORD_BOT_API_TOKEN` in the web app environment.

**Request body**
```json
{
  "guild_id": "123456789012345678",
  "users": [
    { "id": "111111111111111111", "username": "Alpha", "discriminator": "0001", "avatar": "abc123" },
    { "id": "222222222222222222", "username": "Beta", "discriminator": "0002", "avatar": null }
  ]
}
```

**Response body**
```json
{
  "success": true,
  "summary": {
    "guild_id": "123456789012345678",
    "total": 2,
    "matched": 1,
    "unmatched": 1,
    "updated": 1
  },
  "matched": [
    {
      "discord_id": "111111111111111111",
      "user_id": 42,
      "profile_id": 9001,
      "username": "alpha",
      "player_name": "Alpha",
      "profile_slug": "alpha",
      "profile_image_url": "https://...",
      "discord_username": "Alpha",
      "discord_discriminator": "0001",
      "discord_avatar": "abc123"
    }
  ],
  "unmatched": ["222222222222222222"],
  "timestamp": "2026-01-22T00:00:00.000Z"
}
```

**Notes**
- `users` supports up to 5000 members per request. Batch large guilds.
- When a Discord ID is already linked, the endpoint refreshes the stored Discord username/discriminator/avatar.
- Only users who have linked Discord via OAuth will match.

## How Discord linking works

Users link Discord on the website:
- `GET /api/auth/discord` -> initiates OAuth.
- `GET /api/auth/discord/callback` -> stores `discord_id` on the user.
- `POST /api/profile/discord/unlink` -> removes the link.

Your `/sync` command depends on this linkage. If a user is unmatched, prompt them to link on the website.

## Suggested `/sync` flow (bot)

1. Fetch guild members from Discord.
2. Call `/api/discord/sync` with member IDs (plus username/discriminator/avatar if available).
3. Store returned mappings in the bot DB (discord_id -> user_id/profile_id/profile_slug).
4. Optionally assign roles or post a report: "Matched: X / Unmatched: Y".

## Quick-win commands

- `/time` -> `GET /api/game/time`
- `/leaderboard` -> `GET /api/leaderboard?sort=net_worth`
- `/state CA` -> `GET /api/markets/states/CA`
- `/market commodities` -> `GET /api/markets/commodities`
- `/corp <id>` -> `GET /api/corporation/<id>`

## Environment variables (bot)

```
DISCORD_BOT_TOKEN=...                 # Discord token used by the bot itself
GAME_API_BASE_URL=https://...         # Base URL of the web app
DISCORD_BOT_API_TOKEN=...             # Shared secret for /api/discord/sync
```

## Implementation notes

- Most market endpoints are public; portfolio/profile endpoints require JWT auth.
- Cache market data for 30–60 seconds to avoid rate limits.
- For big guilds, batch `/sync` in chunks of 1000–5000 users.
- Store the mapping in the bot DB; do not query the game API on every command.

Last updated: 2026-01-22

