/**
 * Ticket Manager
 * Handles ticket creation, management, and lifecycle
 * Corporate Warfare Discord Bot
 */

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');
const ticketConfig = require('./ticketConfig');
const config = require('../../config/config');

class TicketManager {
    constructor(client) {
        this.client = client;
        this.tickets = new Map(); // ticketChannelId -> ticketData
    }

    /**
     * Create a new ticket
     * @param {Object} options - Ticket creation options
     * @param {Guild} options.guild - The guild
     * @param {GuildMember} options.member - The member creating the ticket
     * @param {string} options.category - Ticket category id
     * @param {string} options.subject - Ticket subject
     * @param {string} options.description - Ticket description
     * @param {TextChannel} options.parentCategory - Category channel for tickets
     * @param {Role} options.staffRole - Staff role for permissions
     */
    async createTicket({ guild, member, category, subject, description, parentCategory, staffRole }) {
        const ticketNumber = this.tickets.size + 1;
        const channelName = `${ticketConfig.channelPrefix}${ticketNumber}-${member.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

        // Create ticket channel
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: parentCategory || null,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: member.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                ...(staffRole ? [{
                    id: staffRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ]
                }] : [])
            ]
        });

        // Get category info
        const categoryInfo = ticketConfig.categories.find(c => c.id === category) || ticketConfig.categories[0];

        // Create ticket embed
        const embed = new EmbedBuilder()
            .setColor(ticketConfig.colors.open)
            .setTitle(`${categoryInfo.emoji} Ticket #${ticketNumber}`)
            .setDescription(description || 'No description provided.')
            .addFields(
                { name: 'Category', value: categoryInfo.label, inline: true },
                { name: 'Subject', value: subject || 'No subject', inline: true },
                { name: 'Created By', value: `${member}`, inline: true }
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        // Create action buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.claim)
                    .setLabel('Claim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.close)
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.transcript)
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝')
            );

        const message = await channel.send({
            content: `${member} Welcome to your ticket!`,
            embeds: [embed],
            components: [row]
        });

        await message.pin().catch(() => {});

        // Store ticket data
        const ticketData = {
            id: ticketNumber,
            channelId: channel.id,
            guildId: guild.id,
            creatorId: member.id,
            category: category,
            subject: subject,
            description: description,
            claimedBy: null,
            createdAt: new Date(),
            closedAt: null,
            status: 'open'
        };

        this.tickets.set(channel.id, ticketData);

        return { channel, ticketData };
    }

    /**
     * Claim a ticket
     * @param {TextChannel} channel - The ticket channel
     * @param {GuildMember} staff - The staff member claiming
     */
    async claimTicket(channel, staff) {
        const ticket = this.tickets.get(channel.id);
        if (!ticket) return { success: false, message: 'Ticket not found.' };
        if (ticket.claimedBy) return { success: false, message: ticketConfig.messages.alreadyClaimed };

        ticket.claimedBy = staff.id;
        ticket.status = 'claimed';

        const embed = new EmbedBuilder()
            .setColor(ticketConfig.colors.claimed)
            .setDescription(`✋ ${ticketConfig.messages.ticketClaimed.replace('{user}', staff.toString())}`)
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        return { success: true, message: 'Ticket claimed.' };
    }

    /**
     * Close a ticket
     * @param {TextChannel} channel - The ticket channel
     * @param {GuildMember} closer - The member closing the ticket
     * @param {string} reason - Close reason
     */
    async closeTicket(channel, closer, reason = 'No reason provided.') {
        const ticket = this.tickets.get(channel.id);
        if (!ticket) return { success: false, message: 'Ticket not found.' };

        ticket.status = 'closed';
        ticket.closedAt = new Date();

        const embed = new EmbedBuilder()
            .setColor(ticketConfig.colors.closed)
            .setTitle('🔒 Ticket Closed')
            .addFields(
                { name: 'Closed By', value: `${closer}`, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.transcript)
                    .setLabel('Save Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId(ticketConfig.buttons.delete)
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

        await channel.send({ embeds: [embed], components: [row] });

        // Update channel permissions to remove user write access
        const creator = await channel.guild.members.fetch(ticket.creatorId).catch(() => null);
        if (creator) {
            await channel.permissionOverwrites.edit(creator.id, {
                SendMessages: false
            }).catch(() => {});
        }

        return { success: true, message: 'Ticket closed.' };
    }

    /**
     * Generate transcript for a ticket
     * @param {TextChannel} channel - The ticket channel
     */
    async generateTranscript(channel) {
        const messages = await channel.messages.fetch({ limit: 100 });
        const ticket = this.tickets.get(channel.id);

        let transcript = `# Ticket Transcript\n`;
        transcript += `**Ticket:** #${ticket?.id || 'Unknown'}\n`;
        transcript += `**Channel:** ${channel.name}\n`;
        transcript += `**Generated:** ${new Date().toISOString()}\n\n`;
        transcript += `---\n\n`;

        const sortedMessages = [...messages.values()].reverse();
        for (const msg of sortedMessages) {
            const timestamp = msg.createdAt.toISOString();
            transcript += `[${timestamp}] ${msg.author.tag}: ${msg.content || '[Embed/Attachment]'}\n`;
        }

        return transcript;
    }

    /**
     * Delete a ticket channel
     * @param {TextChannel} channel - The ticket channel
     */
    async deleteTicket(channel) {
        this.tickets.delete(channel.id);
        await channel.delete().catch(() => {});
        return { success: true };
    }

    /**
     * Get ticket by channel ID
     * @param {string} channelId - The channel ID
     */
    getTicket(channelId) {
        return this.tickets.get(channelId);
    }

    /**
     * Check if a channel is a ticket
     * @param {string} channelId - The channel ID
     */
    isTicket(channelId) {
        return this.tickets.has(channelId);
    }
}

module.exports = TicketManager;
