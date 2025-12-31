/**
 * Ticket Manager
 * Handles ticket creation, management, and lifecycle
 * Corporate Warfare Discord Bot
 */

const { ChannelType, PermissionFlagsBits } = require('discord.js');
const ticketConfig = require('./ticketConfig');
const { silentCatch } = require('../../utils/errorHandler');
const { ticketRepository } = require('../../database/repositories');
const {
    generateTranscript,
    buildTicketEmbed,
    buildTicketActions,
    buildClaimedEmbed,
    buildClosedEmbed,
    buildClosedActions,
} = require('./services');

class TicketManager {
    constructor(client) {
        this.client = client;
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
        // Get next ticket number from database
        const ticketNumber = ticketRepository.getNextTicketNumber(guild.id);
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

        // Store ticket in database
        const ticketData = ticketRepository.create({
            channelId: channel.id,
            guildId: guild.id,
            creatorId: member.id,
            category: category,
            subject: subject,
            description: description,
            status: 'open',
        });

        // Create ticket embed and action buttons using services
        const embed = buildTicketEmbed({ ticketData, categoryInfo, description, subject, member });
        const row = buildTicketActions();

        const message = await channel.send({
            content: `${member} Welcome to your ticket!`,
            embeds: [embed],
            components: [row]
        });

        await silentCatch(() => message.pin());

        return { channel, ticketData };
    }

    /**
     * Claim a ticket
     * @param {TextChannel} channel - The ticket channel
     * @param {GuildMember} staff - The staff member claiming
     */
    async claimTicket(channel, staff) {
        const ticket = ticketRepository.findByChannelId(channel.id);
        if (!ticket) return { success: false, message: 'Ticket not found.' };
        if (ticket.claimedBy) return { success: false, message: ticketConfig.messages.alreadyClaimed };

        // Update in database
        ticketRepository.update(channel.id, {
            claimedBy: staff.id,
            status: 'claimed',
        });

        const embed = buildClaimedEmbed(staff);
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
        const ticket = ticketRepository.findByChannelId(channel.id);
        if (!ticket) return { success: false, message: 'Ticket not found.' };

        // Update in database
        ticketRepository.update(channel.id, {
            status: 'closed',
            closedAt: new Date().toISOString(),
        });

        const embed = buildClosedEmbed(closer, reason);
        const row = buildClosedActions();

        await channel.send({ embeds: [embed], components: [row] });

        // Update channel permissions to remove user write access
        const creator = await silentCatch(() => channel.guild.members.fetch(ticket.creatorId));
        if (creator) {
            await silentCatch(() => channel.permissionOverwrites.edit(creator.id, {
                SendMessages: false
            }));
        }

        return { success: true, message: 'Ticket closed.' };
    }

    /**
     * Generate transcript for a ticket
     * @param {TextChannel} channel - The ticket channel
     * @returns {Promise<string>} Formatted transcript
     */
    async generateTranscript(channel) {
        return generateTranscript(channel);
    }

    /**
     * Delete a ticket channel
     * @param {TextChannel} channel - The ticket channel
     */
    async deleteTicket(channel) {
        ticketRepository.deleteByChannelId(channel.id);
        await silentCatch(() => channel.delete());
        return { success: true };
    }

    /**
     * Get ticket by channel ID
     * @param {string} channelId - The channel ID
     */
    getTicket(channelId) {
        return ticketRepository.findByChannelId(channelId);
    }

    /**
     * Check if a channel is a ticket
     * @param {string} channelId - The channel ID
     */
    isTicket(channelId) {
        return ticketRepository.isTicket(channelId);
    }
}

module.exports = TicketManager;
