/**
 * Ticket Embed Builder
 * Corporate Warfare Discord Bot
 *
 * Builds embeds and action rows for ticket system
 */

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const ticketConfig = require('../ticketConfig');
const config = require('../../../config/config');
const { EMOJIS } = require('../../../constants');

/**
 * Build the initial ticket embed shown when a ticket is created
 * @param {Object} options - Embed options
 * @param {Object} options.ticketData - Ticket data from database
 * @param {Object} options.categoryInfo - Category configuration
 * @param {string} options.description - Ticket description
 * @param {string} options.subject - Ticket subject
 * @param {GuildMember} options.member - The member who created the ticket
 * @returns {EmbedBuilder}
 */
function buildTicketEmbed({ ticketData, categoryInfo, description, subject, member }) {
    return new EmbedBuilder()
        .setColor(ticketConfig.colors.open)
        .setTitle(`${categoryInfo.emoji} Ticket #${ticketData.id}`)
        .setDescription(description || 'No description provided.')
        .addFields(
            { name: 'Category', value: categoryInfo.label, inline: true },
            { name: 'Subject', value: subject || 'No subject', inline: true },
            { name: 'Created By', value: `${member}`, inline: true }
        )
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();
}

/**
 * Build action buttons for an open ticket
 * @returns {ActionRowBuilder}
 */
function buildTicketActions() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(ticketConfig.buttons.claim)
                .setLabel('Claim')
                .setStyle(ButtonStyle.Primary)
                .setEmoji(EMOJIS.CLAIM),
            new ButtonBuilder()
                .setCustomId(ticketConfig.buttons.close)
                .setLabel('Close')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EMOJIS.CLOSE),
            new ButtonBuilder()
                .setCustomId(ticketConfig.buttons.transcript)
                .setLabel('Transcript')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(EMOJIS.TRANSCRIPT)
        );
}

/**
 * Build the ticket claimed embed
 * @param {GuildMember} staff - Staff member who claimed
 * @returns {EmbedBuilder}
 */
function buildClaimedEmbed(staff) {
    return new EmbedBuilder()
        .setColor(ticketConfig.colors.claimed)
        .setDescription(`${EMOJIS.CLAIM} ${ticketConfig.messages.ticketClaimed.replace('{user}', staff.toString())}`)
        .setTimestamp();
}

/**
 * Build the ticket closed embed
 * @param {GuildMember} closer - Member who closed the ticket
 * @param {string} reason - Close reason
 * @returns {EmbedBuilder}
 */
function buildClosedEmbed(closer, reason = 'No reason provided.') {
    return new EmbedBuilder()
        .setColor(ticketConfig.colors.closed)
        .setTitle(`${EMOJIS.CLOSE} Ticket Closed`)
        .addFields(
            { name: 'Closed By', value: `${closer}`, inline: true },
            { name: 'Reason', value: reason, inline: true }
        )
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();
}

/**
 * Build action buttons for a closed ticket
 * @returns {ActionRowBuilder}
 */
function buildClosedActions() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(ticketConfig.buttons.transcript)
                .setLabel('Save Transcript')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(EMOJIS.TRANSCRIPT),
            new ButtonBuilder()
                .setCustomId(ticketConfig.buttons.delete)
                .setLabel('Delete Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EMOJIS.DELETE)
        );
}

module.exports = {
    buildTicketEmbed,
    buildTicketActions,
    buildClaimedEmbed,
    buildClosedEmbed,
    buildClosedActions,
};
