/**
 * /profile Command
 * Lookup Corporate Warfare player profiles
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchProfile, formatProfileForDisplay, getProfileUrl, formatNumber, formatCurrency } = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Lookup a Corporate Warfare player profile')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setDescription('The player profile ID')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const profileId = interaction.options.getInteger('id');

        await interaction.deferReply();

        const rawProfile = await fetchProfile(profileId);

        if (!rawProfile) {
            return interaction.editReply({
                content: `${EMOJIS.ERROR} Profile #${profileId} not found.`
            });
        }

        const profile = formatProfileForDisplay(rawProfile);
        const statusEmoji = profile.isOnline ? '🟢' : '⚫';
        const statusText = profile.isOnline ? 'Online' : 'Offline';

        // Build profile embed with improved formatting
        const embed = new EmbedBuilder()
            .setColor(profile.isOnline ? config.colors.success : config.colors.primary)
            .setAuthor({
                name: profile.playerName,
                url: getProfileUrl(profile.profileSlug),
                iconURL: profile.profileImageUrl || undefined,
            })
            .setDescription(profile.bio || '*No bio set*')
            .addFields(
                { name: '💵 Cash', value: formatCurrency(profile.cash), inline: true },
                { name: '📈 Portfolio', value: formatCurrency(profile.portfolioValue), inline: true },
                { name: '💰 Net Worth', value: formatCurrency(profile.netWorth), inline: true },
                { name: '📍 Location', value: profile.startingState || 'Unknown', inline: true },
                { name: '🎂 Age', value: profile.age?.toString() || 'Unknown', inline: true },
                { name: '⚧ Gender', value: profile.gender || 'Unknown', inline: true },
                { name: '⚡ Actions', value: formatNumber(profile.actions), inline: true },
                { name: `${statusEmoji} Status`, value: statusText, inline: true },
            )
            .setFooter({ text: `Profile ID: ${profile.profileId} • ${config.embedDefaults.footer}` })
            .setTimestamp();

        // Add profile image as thumbnail if available
        if (profile.profileImageUrl) {
            embed.setThumbnail(profile.profileImageUrl);
        }

        // Add last seen if offline
        if (!profile.isOnline && profile.lastSeenAt) {
            embed.addFields({
                name: '🕐 Last Seen',
                value: `<t:${Math.floor(profile.lastSeenAt.getTime() / 1000)}:R>`,
                inline: true
            });
        }

        // Add account age
        if (profile.createdAt) {
            embed.addFields({
                name: '📅 Playing Since',
                value: `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:D>`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
