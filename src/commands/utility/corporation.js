/**
 * /corporation Command
 * Lookup Corporate Warfare corporations
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
    fetchCorporation,
    formatCorporationForDisplay,
    getCorporationUrl,
    getProfileUrl,
    formatCurrency,
    formatNumber,
} = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('corporation')
        .setDescription('Lookup a Corporate Warfare corporation')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setDescription('The corporation ID')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const corpId = interaction.options.getInteger('id');

        await interaction.deferReply();

        const rawCorp = await fetchCorporation(corpId);

        if (!rawCorp) {
            return interaction.editReply({
                content: `${EMOJIS.ERROR} Corporation #${corpId} not found.`
            });
        }

        const corp = formatCorporationForDisplay(rawCorp);

        // Build corporation embed
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🏢 ${corp.name}`)
            .setURL(getCorporationUrl(corp.id))
            .addFields(
                { name: '🏛️ Type', value: corp.type || 'Unknown', inline: true },
                { name: '🏭 Sector', value: corp.sector || 'Unknown', inline: true },
                { name: '📍 HQ', value: corp.hqState || 'Unknown', inline: true },
            )
            .setFooter({ text: `Corporation ID: ${corp.id} • ${config.embedDefaults.footer}` })
            .setTimestamp();

        // Add logo as thumbnail if available
        if (corp.logo) {
            embed.setThumbnail(corp.logo);
        }

        // CEO info
        if (corp.ceo) {
            const ceoLink = `[${corp.ceo.playerName}](${getProfileUrl(corp.ceo.profileSlug)})`;
            embed.addFields({ name: '👔 CEO', value: ceoLink, inline: true });
        }

        // Financials
        embed.addFields(
            { name: '💰 Capital', value: formatCurrency(corp.capital), inline: true },
            { name: '📊 Share Price', value: formatCurrency(corp.sharePrice), inline: true },
        );

        // Share information
        const shareInfo = [
            `**Total:** ${formatNumber(corp.shares)}`,
            `**Public:** ${formatNumber(corp.publicShares)}`,
        ];
        embed.addFields({ name: '📈 Shares', value: shareInfo.join('\n'), inline: true });

        // Dividend info if set
        if (corp.dividendPercentage > 0) {
            embed.addFields({
                name: '💵 Dividend',
                value: `${corp.dividendPercentage}%`,
                inline: true
            });
        }

        // Top shareholders (max 5)
        if (corp.shareholders && corp.shareholders.length > 0) {
            const topShareholders = corp.shareholders
                .sort((a, b) => b.shares - a.shares)
                .slice(0, 5);

            const shareholderList = topShareholders.map((sh, i) => {
                const percentage = ((sh.shares / corp.shares) * 100).toFixed(1);
                const name = sh.playerName || 'Unknown';
                return `${i + 1}. **${name}** - ${formatNumber(sh.shares)} (${percentage}%)`;
            }).join('\n');

            embed.addFields({
                name: '👥 Top Shareholders',
                value: shareholderList || 'None',
                inline: false
            });
        }

        // Founded date
        if (corp.createdAt) {
            embed.addFields({
                name: '📅 Founded',
                value: `<t:${Math.floor(corp.createdAt.getTime() / 1000)}:D>`,
                inline: true
            });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
