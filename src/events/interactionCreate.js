const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`[Commands] No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`[Commands] Error executing ${interaction.commandName}:`, error);

                const reply = {
                    content: 'There was an error executing this command.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        }

        // Handle button interactions
        if (interaction.isButton()) {
            try {
                // Tickets module buttons
                if (interaction.customId.startsWith('ticket_')) {
                    const ticketsModule = client.modules.get('tickets');
                    if (ticketsModule) {
                        await ticketsModule.handleButton(interaction, client);
                    }
                }
            } catch (error) {
                console.error('[Buttons] Error handling button:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred.', ephemeral: true });
                }
            }
        }

        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            try {
                // Tickets module select menus
                if (interaction.customId.startsWith('ticket_')) {
                    const ticketsModule = client.modules.get('tickets');
                    if (ticketsModule) {
                        await ticketsModule.handleSelectMenu(interaction, client);
                    }
                }
            } catch (error) {
                console.error('[SelectMenu] Error handling select menu:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred.', ephemeral: true });
                }
            }
        }

        // Handle modal submissions
        if (interaction.isModalSubmit()) {
            try {
                // Tickets module modals
                if (interaction.customId.startsWith('ticket_')) {
                    const ticketsModule = client.modules.get('tickets');
                    if (ticketsModule) {
                        await ticketsModule.handleModal(interaction, client);
                    }
                }
            } catch (error) {
                console.error('[Modal] Error handling modal:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred.', ephemeral: true });
                }
            }
        }
    }
};
