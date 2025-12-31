/**
 * /ticket Command
 * Ticket creation and management
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config/config');
const ticketConfig = require('../../modules/tickets/ticketConfig');
const { createTicketSelectionUIWithFields } = require('../../utils/ticketUI');

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

        // Send to channel (not ephemeral)
        const message = await interaction.channel.send({ embeds: [embed] });

        // Add reaction
        await message.react(introConfig.emoji);

        // Store message ID for reaction handling
        if (!client.ticketIntroMessages) {
            client.ticketIntroMessages = new Set();
        }
        client.ticketIntroMessages.add(message.id);

        await interaction.reply({
            content: `✅ Ticket intro posted! Users can react with ${introConfig.emoji} to create a ticket.`,
            ephemeral: true
        });
    }
};
