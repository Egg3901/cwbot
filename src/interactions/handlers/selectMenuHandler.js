/**
 * Select Menu Handler
 * Corporate Warfare Discord Bot
 *
 * Handles select menu interactions
 */

const { CUSTOM_IDS } = require('../../constants');
const { handleInteractionError, logError } = require('../../utils/errorHandler');
const {
    buildCategoryEmbed,
    buildBackButton,
    buildCommandSelectMenu,
    buildCommandEmbed,
} = require('../../utils/helpBuilder');
const { getTicketsModule } = require('../../services');

/**
 * Handle select menu interactions
 * @param {StringSelectMenuInteraction} interaction - Select menu interaction
 * @param {Client} client - Discord client
 * @param {Function} next - Next middleware
 */
async function selectMenuHandler(interaction, client, next) {
    try {
        // Help category select
        if (interaction.customId === CUSTOM_IDS.HELP.CATEGORY_SELECT) {
            const value = interaction.values[0];
            const categoryName = value.replace('help_cat_', '');

            const embed = buildCategoryEmbed(client, categoryName, interaction.member);
            const backRow = buildBackButton();
            const cmdRow = buildCommandSelectMenu(client, categoryName, interaction.member);

            const components = cmdRow ? [cmdRow, backRow] : [backRow];
            await interaction.update({ embeds: [embed], components });
            return;
        }

        // Help command select
        if (interaction.customId === CUSTOM_IDS.HELP.COMMAND_SELECT) {
            const value = interaction.values[0];
            const commandName = value.replace('help_cmd_', '');
            const command = client.commands.get(commandName);

            if (command) {
                const embed = buildCommandEmbed(command);
                const backRow = buildBackButton();
                await interaction.update({ embeds: [embed], components: [backRow] });
            }
            return;
        }

        // Tickets module select menus
        if (CUSTOM_IDS.isTicket(interaction.customId)) {
            const ticketsModule = getTicketsModule();
            await ticketsModule.handleSelectMenu(interaction);
            return;
        }

    } catch (error) {
        logError('SelectMenu', 'Error handling select menu', error);
        await handleInteractionError(interaction, error, 'SelectMenu');
    }
}

module.exports = selectMenuHandler;
