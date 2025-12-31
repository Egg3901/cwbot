# Known Issues

> Track bugs and problems here

---

## [ISS-001] In-Memory Data Persistence
**Severity:** CRITICAL | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** Tickets and welcome messages stored in JavaScript `Map()` objects. Data lost on bot restart.
- `ticketManager.js:21` - `this.tickets = new Map()`
- `welcome/index.js:22` - `client.welcomeMessages = new Map()`

**Impact:** Production data loss, can't scale horizontally (sharding)

**Fix:** Implemented SQLite database layer with `better-sqlite3`:
- `src/database/index.js` - Connection management, WAL mode
- `src/database/schema.js` - Table definitions, migration system
- `src/database/repositories/ticketRepository.js` - Ticket CRUD
- `src/database/repositories/welcomeRepository.js` - Welcome state CRUD
- Database initialized on startup, graceful shutdown on exit
- Data now persists in `data/bot.db`

---

## [ISS-002] Monolithic Event Handler
**Severity:** HIGH | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** `interactionCreate.js` (131 LOC) handles ALL interaction types with nested if/else.

**Impact:**
- Hard to maintain and extend
- Adding new handlers requires editing core file
- No separation of concerns

**Fix:** Created `src/interactions/` router with:
- `router.js` - Central dispatcher with middleware support
- `handlers/commandHandler.js` - Slash commands
- `handlers/buttonHandler.js` - Button interactions
- `handlers/selectMenuHandler.js` - Select menus
- `handlers/modalHandler.js` - Modal submissions
- `middleware/cooldown.js` - Rate limiting
- `interactionCreate.js` now 21 LOC

---

## [ISS-003] Client Object Pollution
**Severity:** MEDIUM | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** Multiple properties attached to client object:
- `client.ticketIntroMessages`
- `client.welcomeMessages`
- `client.ticketManager`
- `client.modules`
- `client.welcomeSettings`

**Impact:** No type safety, hard to track dependencies

**Fix:** Implemented service container pattern:
- `src/services/container.js` - DI container with register/get/init
- `src/services/index.js` - Service getters (getTicketsModule, getWelcomeModule, etc.)
- Modules now use local state, accessed via service getters
- Only `client.commands` remains (required by discord.js)
- Container supports clear() for test isolation

---

## [ISS-004] Magic Strings/Numbers
**Severity:** MEDIUM | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** Hardcoded values scattered across codebase:
- Timeouts: `60000`, `5000` ms
- Emojis: `'✅'`, `'🎫'`
- Custom ID prefixes: `'ticket_'`, `'help_'`
- Fetch limits: `100`

**Impact:** Easy to break, hard to maintain

**Fix:** Centralized in `src/constants/` directory
- Created `timeouts.js`, `emojis.js`, `customIds.js`
- Updated all modules to use constants

---

## [ISS-005] No Input Validation
**Severity:** MEDIUM | **Status:** OPEN
**Found:** 2025-12-30

**Problem:** Modal inputs used directly without sanitization:
- `modules/tickets/index.js:118-120`

**Impact:** Potential edge cases, unsafe content in embeds

**Fix:** Add validation layer with sanitization

---

## [ISS-006] No Rate Limiting
**Severity:** MEDIUM | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** No cooldowns on commands or reactions.

**Impact:** Users can spam, risk Discord API rate limits

**Fix:** Created `src/interactions/middleware/cooldown.js`:
- Per-user cooldown tracking
- 3s cooldown for commands, 1s for buttons/menus
- Auto-cleanup of expired cooldowns
- Ephemeral warning message when rate limited

---

## [ISS-007] Silent Error Handling
**Severity:** LOW | **Status:** FIXED
**Found:** 2025-12-30 | **Fixed:** 2025-12-30

**Problem:** Empty catch blocks hide errors:
```javascript
await reply.delete().catch(() => {});
await message.pin().catch(() => {});
```

**Impact:** Silent failures, hard to debug

**Fix:** Created `src/utils/errorHandler.js` with:
- `withErrorHandling()` - logs errors with context
- `silentCatch()` - intentional silent catch for cleanup ops
- `handleInteractionError()` - consistent interaction error UI
- `logError()`, `logWarn()`, `logInfo()` - standardized logging

---
