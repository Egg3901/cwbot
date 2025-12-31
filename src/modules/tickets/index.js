/**
 * Tickets Module
 * Corporate Warfare Discord Bot
 *
 * Provides ticket creation and management functionality
 */

const TicketManager = require('./ticketManager');
const ticketConfig = require('./ticketConfig');
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const { EMOJIS, TIMEOUTS } = require('../../constants');
const { logError, logInfo } = require('../../utils/errorHandler');

/**
 * Module-local ticket manager reference
 * @type {TicketManager|null}
 */
let ticketManager = null;

module.exports = {
    name: 'tickets',
    description: 'Ticket support system',

    /**
     * Initialize the tickets module
     * @param {Client} client - Discord client
     */
    init(client) {
        ticketManager = new TicketManager(client);
        logInfo('Tickets', 'Module initialized');
    },

    /**
     * Get the ticket manager instance
     * @returns {TicketManager}
     */
    getTicketManager() {
        return ticketManager;
    },

    /**
     * Handle ticket-related button interactions
     * @param {ButtonInteraction} interaction - The button interaction
     */
    async handleButton(interaction) {
        const { customId } = interaction;

        // Claim ticket
        if (customId === ticketConfig.buttons.claim) {
            const result = await ticketManager.claimTicket(interaction.channel, interaction.member);
            if (!result.success) {
                return interaction.reply({ content: result.message, ephemeral: true });
            }
            return interaction.reply({ content: `${EMOJIS.SUCCESS} You have claimed this ticket.`, ephemeral: true });
        }

        // Close ticket - show confirmation
        if (customId === ticketConfig.buttons.close) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(ticketConfig.buttons.confirmClose)
                        .setLabel('Confirm Close')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(ticketConfig.buttons.cancelClose)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            return interaction.reply({
                content: 'Are you sure you want to close this ticket?',
                components: [row],
                ephemeral: true
            });
        }

        // Confirm close
        if (customId === ticketConfig.buttons.confirmClose) {
            await ticketManager.closeTicket(interaction.channel, interaction.member);
            return interaction.update({ content: `${EMOJIS.CLOSE} Ticket closed.`, components: [] });
        }

        // Cancel close
        if (customId === ticketConfig.buttons.cancelClose) {
            return interaction.update({ content: 'Close cancelled.', components: [] });
        }

        // Generate transcript
        if (customId === ticketConfig.buttons.transcript) {
            await interaction.deferReply({ ephemeral: true });
            const transcript = await ticketManager.generateTranscript(interaction.channel);

            // Send as file attachment
            const buffer = Buffer.from(transcript, 'utf-8');
            return interaction.editReply({
                content: `${EMOJIS.TRANSCRIPT} Transcript generated.`,
                files: [{
                    attachment: buffer,
                    name: `transcript-${interaction.channel.name}.txt`
                }]
            });
        }

        // Delete ticket
        if (customId === ticketConfig.buttons.delete) {
            await interaction.reply({ content: `${EMOJIS.DELETE} Deleting ticket in 5 seconds...`, ephemeral: true });
            setTimeout(async () => {
                await ticketManager.deleteTicket(interaction.channel);
            }, TIMEOUTS.TICKET_DELETE_DELAY);
        }
    },

    /**
     * Handle ticket creation modal submission
     * @param {ModalSubmitInteraction} interaction - The modal interaction
     */
    async handleModal(interaction) {
        if (interaction.customId !== ticketConfig.modals.create) return;

        const subject = interaction.fields.getTextInputValue('ticket_subject');
        const description = interaction.fields.getTextInputValue('ticket_description');
        const category = interaction.fields.getTextInputValue('ticket_category') || 'support';

        await interaction.deferReply({ ephemeral: true });

        try {
            const { channel } = await ticketManager.createTicket({
                guild: interaction.guild,
                member: interaction.member,
                category: category,
                subject: subject,
                description: description,
                parentCategory: null, // Can be configured
                staffRole: null // Can be configured
            });

            await interaction.editReply({
                content: `${EMOJIS.SUCCESS} ${ticketConfig.messages.ticketCreated}\n\nYour ticket: ${channel}`
            });
        } catch (error) {
            logError('Tickets', 'Error creating ticket', error);
            await interaction.editReply({
                content: `${EMOJIS.ERROR} Failed to create ticket. Please try again.`
            });
        }
    },

    /**
     * Handle select menu for ticket category selection
     * @param {StringSelectMenuInteraction} interaction - The select menu interaction
     */
    async handleSelectMenu(interaction) {
        if (!interaction.customId.startsWith('ticket_category')) return;

        const category = interaction.values[0];

        // Show modal for ticket details
        const modal = new ModalBuilder()
            .setCustomId(ticketConfig.modals.create)
            .setTitle('Create Ticket');

        const subjectInput = new TextInputBuilder()
            .setCustomId('ticket_subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Brief summary of your issue')
            .setRequired(true)
            .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Please describe your issue in detail')
            .setRequired(true)
            .setMaxLength(1000);

        const categoryInput = new TextInputBuilder()
            .setCustomId('ticket_category')
            .setLabel('Category (do not edit)')
            .setStyle(TextInputStyle.Short)
            .setValue(category)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(categoryInput)
        );

        await interaction.showModal(modal);
    },

    // Export config for external use
    config: ticketConfig
};
