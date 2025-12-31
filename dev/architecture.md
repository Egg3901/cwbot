# Architecture - Corporate Warfare Bot

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Discord.js v14
- **Language:** JavaScript (ES6+)

## Design Principles
1. **Modular** - Each feature is self-contained in `/modules`
2. **Scalable** - Ready for API integration
3. **DRY** - Maximum code reuse via shared utilities

## Folder Structure
```
src/
├── index.js              # Entry point, client setup
├── config/config.js      # Environment and settings
├── handlers/
│   ├── eventHandler.js   # Loads events from /events
│   └── commandHandler.js # Loads commands from /commands
├── events/               # Discord event handlers
├── commands/             # Slash commands by category
└── modules/              # Self-contained feature modules
    ├── tickets/
    ├── welcome/
    └── starboard/
```

## Module Pattern
Each module should export:
- `name` - Module identifier
- `init(client)` - Setup function
- Event listeners as needed
- Commands registered separately

---
*Last Updated: 2024-12-30*
