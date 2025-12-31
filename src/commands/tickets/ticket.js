/**
 * /ticket Command
 * Opens ticket creation interface
 * Corporate Warfare Discord Bot
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const config = require('../../config/config');
const ticketConfig = require('../../modules/tickets/ticketConfig');

module.exports = {
    category: 'Tickets',
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a support ticket'),

    async execute(interaction, client) {
        // Build category select menu
        const options = ticketConfig.categories.map(cat => ({
            label: cat.label,
            description: cat.description,
            value: cat.id,
            emoji: cat.emoji
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category_select')
            .setPlaceholder('Select a ticket category')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎫 Create a Ticket')
            .setDescription('Please select a category for your ticket below.\n\nA private channel will be created for you to discuss your issue with our staff.')
            .addFields(
                ticketConfig.categories.map(cat => ({
                    name: `${cat.emoji} ${cat.label}`,
                    value: cat.description,
                    inline: true
                }))
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};
