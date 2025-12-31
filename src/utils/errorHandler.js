/**
 * Error Handling Utilities
 * Corporate Warfare Discord Bot
 *
 * Standardized error handling and logging
 */

/**
 * Execute async function with error handling
 * @param {Function} fn - Async function to execute
 * @param {string} context - Context for logging (e.g., 'Tickets', 'Welcome')
 * @param {*} fallback - Value to return on error (default: null)
 * @returns {Promise<*>} Result of fn or fallback
 */
async function withErrorHandling(fn, context, fallback = null) {
    try {
        return await fn();
    } catch (error) {
        console.error(`[${context}] Error:`, error.message || error);
        return fallback;
    }
}

/**
 * Execute async function with silent error handling (no logging)
 * Useful for cleanup operations where failure is acceptable
 * @param {Function} fn - Async function to execute
 * @returns {Promise<*>} Result of fn or undefined
 */
async function silentCatch(fn) {
    try {
        return await fn();
    } catch {
        return undefined;
    }
}

/**
 * Handle interaction errors consistently
 * @param {Interaction} interaction - Discord interaction
 * @param {Error} error - Error that occurred
 * @param {string} context - Context for logging
 */
async function handleInteractionError(interaction, error, context) {
    console.error(`[${context}] Interaction error:`, error.message || error);

    const errorMessage = {
        content: '❌ An error occurred while processing your request.',
        ephemeral: true
    };

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    } catch {
        // Interaction may have expired, ignore
    }
}

/**
 * Create a logged error with context
 * @param {string} context - Context for the error
 * @param {string} message - Error message
 * @param {Object} data - Additional data to log
 */
function logError(context, message, data = {}) {
    console.error(`[${context}] ${message}`, data);
}

/**
 * Create a logged warning
 * @param {string} context - Context for the warning
 * @param {string} message - Warning message
 */
function logWarn(context, message) {
    console.warn(`[${context}] ${message}`);
}

/**
 * Create a logged info message
 * @param {string} context - Context for the info
 * @param {string} message - Info message
 */
function logInfo(context, message) {
    console.log(`[${context}] ${message}`);
}

module.exports = {
    withErrorHandling,
    silentCatch,
    handleInteractionError,
    logError,
    logWarn,
    logInfo,
};
