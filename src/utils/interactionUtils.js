/**
 * Interaction Utilities
 * Corporate Warfare Discord Bot
 *
 * Shared utilities for Discord interaction handling
 */

/**
 * Determine the type of interaction
 * @param {Interaction} interaction - Discord interaction
 * @returns {string|null} Interaction type
 */
function getInteractionType(interaction) {
    if (interaction.isChatInputCommand()) return 'command';
    if (interaction.isButton()) return 'button';
    if (interaction.isStringSelectMenu()) return 'selectMenu';
    if (interaction.isModalSubmit()) return 'modal';
    if (interaction.isAutocomplete()) return 'autocomplete';
    if (interaction.isUserContextMenuCommand()) return 'userContext';
    if (interaction.isMessageContextMenuCommand()) return 'messageContext';
    return null;
}

/**
 * Get the identifier for an interaction (for logging/cooldowns)
 * @param {Interaction} interaction - Discord interaction
 * @returns {string} Interaction identifier
 */
function getInteractionId(interaction) {
    if (interaction.isChatInputCommand()) {
        return interaction.commandName;
    }
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        return interaction.customId;
    }
    if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
        return interaction.commandName;
    }
    return 'unknown';
}

module.exports = {
    getInteractionType,
    getInteractionId,
};
