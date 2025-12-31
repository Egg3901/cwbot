/**
 * Timeout Constants
 * Corporate Warfare Discord Bot
 *
 * Centralized timeout values for consistency
 */

module.exports = {
    // Component auto-delete timeouts (in ms)
    TICKET_MENU_DELETE: 60000,      // 60 seconds
    TICKET_DELETE_DELAY: 5000,      // 5 seconds before channel delete

    // Interaction timeouts
    COMPONENT_TIMEOUT: 300000,      // 5 minutes for component collectors

    // Rate limiting
    COMMAND_COOLDOWN: 3000,         // 3 seconds between commands
    REACTION_COOLDOWN: 1000,        // 1 second between reactions

    // Fetch limits
    MESSAGE_FETCH_LIMIT: 100,       // Max messages to fetch for transcript
};
