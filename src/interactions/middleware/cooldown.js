/**
 * Cooldown Middleware
 * Corporate Warfare Discord Bot
 *
 * Rate limiting for interactions to prevent spam
 */

const { TIMEOUTS, EMOJIS } = require('../../constants');

// Cooldown storage: userId -> { type -> timestamp }
const cooldowns = new Map();

/**
 * Clean up expired cooldowns periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [userId, types] of cooldowns.entries()) {
        for (const [type, timestamp] of types.entries()) {
            if (now - timestamp > TIMEOUTS.COMMAND_COOLDOWN * 2) {
                types.delete(type);
            }
        }
        if (types.size === 0) {
            cooldowns.delete(userId);
        }
    }
}, 60000); // Clean every minute

/**
 * Get cooldown duration based on interaction type
 * @param {string} type - Interaction type
 * @returns {number} Cooldown in ms
 */
function getCooldownDuration(type) {
    switch (type) {
        case 'command':
            return TIMEOUTS.COMMAND_COOLDOWN;
        case 'button':
        case 'selectMenu':
        case 'modal':
            return TIMEOUTS.REACTION_COOLDOWN;
        default:
            return TIMEOUTS.REACTION_COOLDOWN;
    }
}

/**
 * Cooldown middleware
 * @param {Interaction} interaction - Discord interaction
 * @param {Client} client - Discord client
 * @param {Function} next - Next middleware
 */
async function cooldownMiddleware(interaction, client, next) {
    const userId = interaction.user.id;
    const type = getInteractionType(interaction);
    const cooldownDuration = getCooldownDuration(type);

    // Get or create user's cooldown map
    if (!cooldowns.has(userId)) {
        cooldowns.set(userId, new Map());
    }
    const userCooldowns = cooldowns.get(userId);

    // Check if on cooldown
    const lastUsed = userCooldowns.get(type);
    const now = Date.now();

    if (lastUsed && now - lastUsed < cooldownDuration) {
        const remaining = Math.ceil((cooldownDuration - (now - lastUsed)) / 1000);

        // Only reply if we can (not all interactions need response)
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({
                    content: `${EMOJIS.WARNING} Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before trying again.`,
                    ephemeral: true,
                });
            } catch {
                // Interaction may have expired
            }
        }
        return; // Don't proceed to handler
    }

    // Update cooldown timestamp
    userCooldowns.set(type, now);

    // Proceed to next middleware/handler
    await next();
}

/**
 * Determine interaction type for cooldown grouping
 * @param {Interaction} interaction - Discord interaction
 * @returns {string} Type string
 */
function getInteractionType(interaction) {
    if (interaction.isChatInputCommand()) return 'command';
    if (interaction.isButton()) return 'button';
    if (interaction.isStringSelectMenu()) return 'selectMenu';
    if (interaction.isModalSubmit()) return 'modal';
    return 'other';
}

/**
 * Clear cooldown for a specific user
 * @param {string} userId - User ID
 * @param {string} type - Interaction type (optional, clears all if not specified)
 */
function clearCooldown(userId, type = null) {
    if (!cooldowns.has(userId)) return;

    if (type) {
        cooldowns.get(userId).delete(type);
    } else {
        cooldowns.delete(userId);
    }
}

/**
 * Check if user is on cooldown
 * @param {string} userId - User ID
 * @param {string} type - Interaction type
 * @returns {boolean} True if on cooldown
 */
function isOnCooldown(userId, type) {
    if (!cooldowns.has(userId)) return false;
    const userCooldowns = cooldowns.get(userId);
    const lastUsed = userCooldowns.get(type);
    if (!lastUsed) return false;

    const cooldownDuration = getCooldownDuration(type);
    return Date.now() - lastUsed < cooldownDuration;
}

module.exports = {
    cooldownMiddleware,
    clearCooldown,
    isOnCooldown,
};
