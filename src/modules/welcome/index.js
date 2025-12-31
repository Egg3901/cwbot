/**
 * Welcome Module
 * Corporate Warfare Discord Bot
 *
 * Handles welcome messages and verification for new members
 */

const { EmbedBuilder } = require('discord.js');
const welcomeConfig = require('./welcomeConfig');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');
const { logError, logInfo, logWarn } = require('../../utils/errorHandler');
const { welcomeRepository } = require('../../database/repositories');

module.exports = {
    name: 'welcome',
    description: 'Welcome and verification system',

    /**
     * Initialize the welcome module
     * @param {Client} client - Discord client
     */
    init(client) {
        // Clean up old welcome states (older than 24 hours)
        const cleaned = welcomeRepository.cleanupOld(24);
        if (cleaned > 0) {
            logInfo('Welcome', `Cleaned up ${cleaned} old welcome states`);
        }
        logInfo('Welcome', 'Module initialized');
    },

    /**
     * Handle new member join
     * @param {GuildMember} member - The new member
     */
    async handleMemberJoin(member) {
        const { guild } = member;

        // Assign unverified role
        if (config.unverifiedRoleId) {
            try {
                const unverifiedRole = guild.roles.cache.get(config.unverifiedRoleId);
                if (unverifiedRole) {
                    await member.roles.add(unverifiedRole);
                }
            } catch (error) {
                logError('Welcome', 'Error assigning unverified role', error);
            }
        }

        // Get welcome channel
        const channel = guild.channels.cache.get(config.welcomeChannelId);
        if (!channel) {
            logWarn('Welcome', 'Welcome channel not found');
            return;
        }

        // Build and send welcome embed
        const embed = this.buildWelcomeEmbed(member);

        try {
            const message = await channel.send({
                content: `${member}`,
                embeds: [embed]
            });

            // Add verification reaction
            await message.react(welcomeConfig.verifyEmoji);

            // Store in database for verification tracking
            welcomeRepository.create({
                messageId: message.id,
                userId: member.id,
                guildId: guild.id,
            });

        } catch (error) {
            logError('Welcome', 'Error sending welcome message', error);
        }
    },

    /**
     * Handle verification reaction
     * @param {MessageReaction} reaction - The reaction
     * @param {User} user - The user who reacted
     */
    async handleVerification(reaction, user) {
        // Look up welcome state in database
        const welcomeData = welcomeRepository.findByMessageId(reaction.message.id);

        // Only the welcome message owner can verify
        if (!welcomeData || welcomeData.userId !== user.id) return false;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return false;

        try {
            // Remove unverified role
            if (config.unverifiedRoleId) {
                const unverifiedRole = guild.roles.cache.get(config.unverifiedRoleId);
                if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
                    await member.roles.remove(unverifiedRole);
                }
            }

            // Add member role
            if (config.memberRoleId) {
                const memberRole = guild.roles.cache.get(config.memberRoleId);
                if (memberRole) {
                    await member.roles.add(memberRole);
                }
            }

            // Send verification confirmation
            const rulesChannel = config.rulesChannelId ? `<#${config.rulesChannelId}>` : '#rules';
            const verifiedMsg = welcomeConfig.verifiedMessage.replace(/{rules}/g, rulesChannel);

            await reaction.message.channel.send({
                content: `${user} ${verifiedMsg}`
            });

            // Clean up: remove from database
            welcomeRepository.deleteByMessageId(reaction.message.id);

            return true;
        } catch (error) {
            logError('Welcome', 'Error during verification', error);
            return false;
        }
    },

    /**
     * Build welcome embed with placeholders
     * @param {GuildMember} member - The new member
     */
    buildWelcomeEmbed(member) {
        const { guild, user } = member;

        const rulesChannel = config.rulesChannelId ? `<#${config.rulesChannelId}>` : '#rules';

        const replacePlaceholders = (text) => {
            if (!text) return text;
            return text
                .replace(/{user}/g, `<@${user.id}>`)
                .replace(/{username}/g, user.username)
                .replace(/{server}/g, guild.name)
                .replace(/{memberCount}/g, guild.memberCount.toString())
                .replace(/{rules}/g, rulesChannel);
        };

        const embed = new EmbedBuilder()
            .setColor(welcomeConfig.embed.color)
            .setTitle(replacePlaceholders(welcomeConfig.embed.title))
            .setDescription(replacePlaceholders(welcomeConfig.embed.description))
            .setFooter({ text: welcomeConfig.embed.footer })
            .setTimestamp();

        if (welcomeConfig.embed.thumbnail) {
            embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));
        }

        return embed;
    },

    config: welcomeConfig
};
