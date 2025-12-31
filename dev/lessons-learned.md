# Lessons Learned

> Insights from development

---

## [LL-001] Discord.js Partials Configuration
**Date:** 2024-12-30 | **Severity:** HIGH

**Issue:** Reaction events not firing for messages sent before bot restart.

**Root Cause:** Discord.js caches messages/reactions. Uncached (old) messages need `Partials` enabled and explicit `.fetch()` calls.

**Solution:**
```javascript
// In client setup
partials: [Partials.Message, Partials.Channel, Partials.Reaction]

// In event handler
if (reaction.partial) await reaction.fetch();
if (reaction.message.partial) await reaction.message.fetch();
```

**Prevention:** Always configure Partials for reaction-based features upfront.

---

## [LL-002] Event Handler Client Reference
**Date:** 2024-12-30 | **Severity:** MEDIUM

**Issue:** `client` parameter passed to event handlers was undefined in some contexts.

**Root Cause:** Event handler passes `client` as last argument, but reaction events have different arity.

**Solution:** Use `reaction.client` or `message.client` instead of relying on passed parameter.

```javascript
// Instead of: async execute(reaction, user, client)
async execute(reaction, user) {
    const client = reaction.client; // Always available
}
```

**Prevention:** Prefer accessing client from interaction/event object rather than function parameters.

---

## [LL-003] Avoid Debug Logging in Production
**Date:** 2024-12-30 | **Severity:** LOW

**Issue:** Excessive `console.log` statements (8 debug logs in one handler) cluttered output and slowed execution.

**Solution:** Remove debug logs before committing, or use a proper logging library with log levels.

**Prevention:** Use a logging utility with DEBUG/INFO/ERROR levels. Only commit with appropriate log level.

---

## [LL-004] DRY - Extract Shared UI Components
**Date:** 2024-12-30 | **Severity:** MEDIUM

**Issue:** Ticket selection UI (embed + select menu) was duplicated in two files (~32 lines each).

**Solution:** Created `src/utils/ticketUI.js` with shared `createTicketSelectionUI()` function.

**Impact:** Reduced total LOC by ~50 lines, single source of truth for ticket UI.

**Prevention:** Before implementing UI, check if similar patterns exist. Create utilities for reusable components.

---

## [LL-005] Emoji Comparison in Discord.js
**Date:** 2024-12-30 | **Severity:** LOW

**Issue:** Emoji comparison was over-complicated with 3 redundant checks.

**Solution:** Simplified to: `reaction.emoji.name === '🎫' || reaction.emoji.toString() === '🎫'`

**Note:** For Unicode emojis, `.name` contains the emoji character. For custom emojis, use `.id`.

---

*Auto-updated by ECHO v1.4.0*
