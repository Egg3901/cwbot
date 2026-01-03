/**
 * /leaderboard Command
 * Display Corporate Warfare wealth leaderboard with pagination
 * Corporate Warfare Discord Bot
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require('discord.js');
const {
    fetchLeaderboard,
    formatLeaderboardEntry,
    formatCurrency,
    getProfileUrl,
} = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

const ENTRIES_PER_PAGE = 10;
const COLLECTOR_TIMEOUT = 60000; // 60 seconds

// Sort option mappings
const SORT_OPTIONS = {
    wealth: { field: 'net_worth', label: 'Total Wealth', emoji: '💰' },
    cash: { field: 'cash', label: 'Cash', emoji: '💵' },
    portfolio: { field: 'portfolio_value', label: 'Portfolio', emoji: '📈' },
};

/**
 * Get medal emoji for top 3 ranks
 * @param {number} rank - Player rank
 * @returns {string} Medal emoji or empty string
 */
function getMedalEmoji(rank) {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
}

/**
 * Build leaderboard embed
 * @param {Object} data - Leaderboard API response
 * @param {string} sortKey - Sort option key
 * @param {number} page - Current page
 * @returns {EmbedBuilder}
 */
function buildLeaderboardEmbed(data, sortKey, page) {
    const sortOption = SORT_OPTIONS[sortKey];
    const totalPages = Math.ceil(data.total / ENTRIES_PER_PAGE);

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`🏆 ${sortOption.label} Leaderboard`)
        .setFooter({ text: `Page ${page}/${totalPages} • ${data.total} players • ${config.embedDefaults.footer}` })
        .setTimestamp();

    if (!data.entries || data.entries.length === 0) {
        embed.setDescription('No players found.');
        return embed;
    }

    const lines = data.entries.map(rawEntry => {
        const entry = formatLeaderboardEntry(rawEntry);
        const medal = getMedalEmoji(entry.rank);
        const rank = `#${entry.rank}`;

        // Get the value based on sort type
        let value;
        switch (sortKey) {
            case 'cash':
                value = formatCurrency(entry.cash);
                break;
            case 'portfolio':
                value = formatCurrency(entry.portfolioValue);
                break;
            default:
                value = formatCurrency(entry.netWorth);
        }

        // Format: #1 🥇 **PlayerName** - $1,000,000
        const playerLink = `[${entry.playerName}](${getProfileUrl(entry.profileSlug)})`;

        if (medal) {
            return `${rank} ${medal} ${playerLink}\n${sortOption.emoji} ${value}`;
        }
        return `${rank} ${playerLink} - ${value}`;
    });

    embed.setDescription(lines.join('\n\n'));
    return embed;
}

/**
 * Build pagination buttons
 * @param {number} page - Current page
 * @param {number} totalPages - Total pages
 * @param {string} sortKey - Current sort option
 * @returns {ActionRowBuilder}
 */
function buildPaginationButtons(page, totalPages, sortKey) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`lb_prev_${sortKey}`)
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
                .setDisabled(page <= 1),
            new ButtonBuilder()
                .setCustomId(`lb_page_${sortKey}`)
                .setLabel(`Page ${page}/${totalPages}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`lb_next_${sortKey}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('▶️')
                .setDisabled(page >= totalPages)
        );
}

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the Corporate Warfare wealth leaderboard')
        .addStringOption(option =>
            option
                .setName('sort')
                .setDescription('Sort leaderboard by')
                .setRequired(false)
                .addChoices(
                    { name: 'Total Wealth (default)', value: 'wealth' },
                    { name: 'Cash', value: 'cash' },
                    { name: 'Portfolio Value', value: 'portfolio' }
                )
        ),

    async execute(interaction) {
        const sortKey = interaction.options.getString('sort') || 'wealth';
        const sortField = SORT_OPTIONS[sortKey].field;
        let currentPage = 1;

        await interaction.deferReply();

        // Fetch initial data
        const data = await fetchLeaderboard(currentPage, sortField, ENTRIES_PER_PAGE);

        if (!data) {
            return interaction.editReply({
                content: `${EMOJIS.ERROR} Failed to fetch leaderboard. Please try again later.`
            });
        }

        const totalPages = Math.ceil(data.total / ENTRIES_PER_PAGE);
        const embed = buildLeaderboardEmbed(data, sortKey, currentPage);
        const buttons = buildPaginationButtons(currentPage, totalPages, sortKey);

        const message = await interaction.editReply({
            embeds: [embed],
            components: totalPages > 1 ? [buttons] : []
        });

        // No pagination needed for single page
        if (totalPages <= 1) return;

        // Create button collector
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: COLLECTOR_TIMEOUT,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async buttonInteraction => {
            const [, action] = buttonInteraction.customId.split('_');

            if (action === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (action === 'next' && currentPage < totalPages) {
                currentPage++;
            }

            // Fetch new page data
            const newData = await fetchLeaderboard(currentPage, sortField, ENTRIES_PER_PAGE);

            if (!newData) {
                await buttonInteraction.reply({
                    content: `${EMOJIS.ERROR} Failed to fetch page. Please try again.`,
                    ephemeral: true
                });
                return;
            }

            const newEmbed = buildLeaderboardEmbed(newData, sortKey, currentPage);
            const newButtons = buildPaginationButtons(currentPage, totalPages, sortKey);

            await buttonInteraction.update({
                embeds: [newEmbed],
                components: [newButtons]
            });
        });

        collector.on('end', async () => {
            // Disable buttons after timeout
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('lb_prev_disabled')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('◀️')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('lb_page_disabled')
                        .setLabel(`Page ${currentPage}/${totalPages}`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('lb_next_disabled')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('▶️')
                        .setDisabled(true)
                );

            try {
                await message.edit({ components: [disabledButtons] });
            } catch (e) {
                // Message may have been deleted
            }
        });
    }
};
