/**
 * Modal Handler
 * Corporate Warfare Discord Bot
 *
 * Handles modal submit interactions
 */

const { CUSTOM_IDS } = require('../../constants');
const { handleInteractionError, logError } = require('../../utils/errorHandler');
const { getTicketsModule } = require('../../services');

/**
 * Handle modal submit interactions
 * @param {ModalSubmitInteraction} interaction - Modal interaction
 * @param {Client} client - Discord client
 * @param {Function} next - Next middleware
 */
async function modalHandler(interaction, client, next) {
    try {
        // Tickets module modals
        if (CUSTOM_IDS.isTicket(interaction.customId)) {
            const ticketsModule = getTicketsModule();
            await ticketsModule.handleModal(interaction);
            return;
        }

    } catch (error) {
        logError('Modal', 'Error handling modal', error);
        await handleInteractionError(interaction, error, 'Modal');
    }
}

module.exports = modalHandler;
