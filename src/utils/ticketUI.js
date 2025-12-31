/**
 * Ticket UI Utilities
 * Shared UI components for ticket system
 * Corporate Warfare Discord Bot
 */

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ticketConfig = require('../modules/tickets/ticketConfig');
const config = require('../config/config');

/**
 * Create ticket category selection embed and menu
 * @returns {{ embed: EmbedBuilder, row: ActionRowBuilder }}
 */
function createTicketSelectionUI() {
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
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();

    return { embed, row };
}

/**
 * Create ticket category selection with field descriptions
 * @returns {{ embed: EmbedBuilder, row: ActionRowBuilder }}
 */
function createTicketSelectionUIWithFields() {
    const { embed, row } = createTicketSelectionUI();

    embed.addFields(
        ticketConfig.categories.map(cat => ({
            name: `${cat.emoji} ${cat.label}`,
            value: cat.description,
            inline: true
        }))
    );

    return { embed, row };
}

module.exports = {
    createTicketSelectionUI,
    createTicketSelectionUIWithFields
};
