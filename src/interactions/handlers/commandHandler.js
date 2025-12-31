/**
 * Command Handler
 * Corporate Warfare Discord Bot
 *
 * Handles slash command interactions
 */

const { handleInteractionError, logError } = require('../../utils/errorHandler');

/**
 * Handle slash command interactions
 * @param {ChatInputCommandInteraction} interaction - Command interaction
 * @param {Client} client - Discord client
 * @param {Function} next - Next middleware
 */
async function commandHandler(interaction, client, next) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logError('Commands', `No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        logError('Commands', `Error executing ${interaction.commandName}`, error);
        await handleInteractionError(interaction, error, 'Commands');
    }
}

module.exports = commandHandler;
