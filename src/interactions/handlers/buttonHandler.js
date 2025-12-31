/**
 * Button Handler
 * Corporate Warfare Discord Bot
 *
 * Handles button interactions
 */

const { CUSTOM_IDS } = require('../../constants');
const { handleInteractionError, logError } = require('../../utils/errorHandler');
const {
    buildMainHelpEmbed,
    buildCategorySelectMenu,
} = require('../../utils/helpBuilder');
const { getTicketsModule, getWelcomeModule } = require('../../services');

/**
 * Handle button interactions
 * @param {ButtonInteraction} interaction - Button interaction
 * @param {Client} client - Discord client
 * @param {Function} next - Next middleware
 */
async function buttonHandler(interaction, client, next) {
    try {
        // Help system back button
        if (interaction.customId === CUSTOM_IDS.HELP.BACK) {
            const embed = buildMainHelpEmbed(client, interaction.member);
            const row = buildCategorySelectMenu(client, interaction.member);
            await interaction.update({ embeds: [embed], components: [row] });
            return;
        }

        // Tickets module buttons
        if (CUSTOM_IDS.isTicket(interaction.customId)) {
            const ticketsModule = getTicketsModule();
            await ticketsModule.handleButton(interaction);
            return;
        }

        // Welcome module buttons (if any)
        if (CUSTOM_IDS.isWelcome(interaction.customId)) {
            const welcomeModule = getWelcomeModule();
            if (welcomeModule?.handleButton) {
                await welcomeModule.handleButton(interaction);
            }
            return;
        }

    } catch (error) {
        logError('Buttons', 'Error handling button', error);
        await handleInteractionError(interaction, error, 'Buttons');
    }
}

module.exports = buttonHandler;
