/**
 * /ticket Command
 * Ticket creation and management
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/config');
const ticketConfig = require('../../modules/tickets/ticketConfig');
const { createTicketSelectionUIWithFields } = require('../../utils/ticketUI');
const { getTicketIntroMessages } = require('../../services');

module.exports = {
    category: 'Tickets',
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a support ticket')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('intro')
                .setDescription('Post ticket intro message (Admin only)')
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            return this.handleCreate(interaction, client);
        }

        if (subcommand === 'intro') {
            return this.handleIntro(interaction, client);
        }
    },

    /**
     * Handle /ticket create
     */
    async handleCreate(interaction) {
        const { embed, row } = createTicketSelectionUIWithFields();
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    /**
     * Handle /ticket intro (Admin only)
     */
    async handleIntro(interaction, client) {
        // Check for admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ You need Administrator permission to use this command.',
                ephemeral: true
            });
        }

        const introConfig = ticketConfig.intro;

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${introConfig.emoji} ${introConfig.title}`)
            .setDescription(introConfig.description)
            .addFields(
                ticketConfig.categories.map(cat => ({
                    name: `${cat.emoji} ${cat.label}`,
                    value: cat.description,
                    inline: true
                }))
            )
            .setFooter({ text: introConfig.footer })
            .setTimestamp();

        // Create ticket button
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.create)
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(introConfig.emoji)
            );

        // Send to channel with button
        const introMessage = await interaction.channel.send({ embeds: [embed], components: [row] });

        // Store intro message for persistence
        const ticketIntroMessages = getTicketIntroMessages();
        ticketIntroMessages.add(introMessage.id, interaction.guildId, interaction.channelId);

        await interaction.reply({
            content: '✅ Ticket intro posted! Users can click the button to create a ticket.',
            ephemeral: true
        });
    }
};
