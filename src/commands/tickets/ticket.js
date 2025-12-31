/**
 * /ticket Command
 * Ticket creation and management
 * Corporate Warfare Discord Bot
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} = require('discord.js');
const config = require('../../config/config');
const ticketConfig = require('../../modules/tickets/ticketConfig');

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
    async handleCreate(interaction, client) {
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
