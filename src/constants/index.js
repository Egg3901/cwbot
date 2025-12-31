/**
 * Constants Barrel Export
 * Corporate Warfare Discord Bot
 */

const TIMEOUTS = require('./timeouts');
const EMOJIS = require('./emojis');
const CUSTOM_IDS = require('./customIds');

module.exports = {
    TIMEOUTS,
    EMOJIS,
    CUSTOM_IDS,
    // Re-export for convenience
    ...TIMEOUTS,
    ...EMOJIS,
};
