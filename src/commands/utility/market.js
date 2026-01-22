/**
 * /market Command
 * View global market information
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchCommodities, formatCurrency } = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('View global market information')
        .addSubcommand(sub =>
            sub
                .setName('commodities')
                .setDescription('View current commodity prices')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'commodities') {
            await handleCommodities(interaction);
        }
    }
};

async function handleCommodities(interaction) {
    await interaction.deferReply();

    const commodities = await fetchCommodities();

    if (!commodities) {
        return interaction.editReply({
            content: `${EMOJIS.ERROR} Failed to fetch commodity prices.`
        });
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('📦 Global Commodity Prices')
        .setDescription('Current global market averages per unit')
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();

    if (commodities.length === 0) {
        embed.setDescription('No commodities found.');
    } else {
        // Group by category if available, otherwise list all
        // Assuming format: { name, price, change_percent, category }
        
        // Simple list formatting
        const lines = commodities.map(c => {
            const price = formatCurrency(c.price);
            const trend = getTrendEmoji(c.change_percent);
            const change = c.change_percent ? `${c.change_percent > 0 ? '+' : ''}${c.change_percent}%` : '';
            
            return `**${c.name}**: ${price} ${trend} \`${change}\``;
        });

        // Split into fields if too long
        if (lines.length > 15) {
            const mid = Math.ceil(lines.length / 2);
            embed.addFields(
                { name: 'Part 1', value: lines.slice(0, mid).join('\n'), inline: true },
                { name: 'Part 2', value: lines.slice(mid).join('\n'), inline: true }
            );
        } else {
            embed.setDescription(lines.join('\n'));
        }
    }

    await interaction.editReply({ embeds: [embed] });
}

function getTrendEmoji(percent) {
    if (!percent) return '➖';
    if (percent > 5) return '🚀';
    if (percent > 0) return '📈';
    if (percent < -5) return '📉';
    if (percent < 0) return '🔻';
    return '➖';
}
