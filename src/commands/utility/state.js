/**
 * /state Command
 * Display state market information
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchState, formatNumber } = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('state')
        .setDescription('View market information for a specific state')
        .addStringOption(option =>
            option
                .setName('code')
                .setDescription('Two-letter state code (e.g., CA, NY)')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(2)
        ),

    async execute(interaction) {
        const stateCode = interaction.options.getString('code').toUpperCase();
        await interaction.deferReply();

        const stateData = await fetchState(stateCode);

        if (!stateData) {
            return interaction.editReply({
                content: `${EMOJIS.ERROR} State **${stateCode}** not found or API error.`
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🗺️ Market Data: ${stateData.name || stateCode}`)
            .setDescription(`Market conditions for **${stateData.name || stateCode}** (${stateCode})`)
            .addFields(
                { name: '🏛️ Tax Rate', value: stateData.tax_rate ? `${stateData.tax_rate}%` : 'N/A', inline: true },
                { name: '👥 Population', value: formatNumber(stateData.population), inline: true },
                { name: '👷 Labor Cost', value: stateData.labor_cost ? `$${stateData.labor_cost}/hr` : 'N/A', inline: true },
                { name: '📈 Demand Mod', value: stateData.demand_modifier ? `${stateData.demand_modifier}x` : '1.0x', inline: true },
                { name: '🏭 Industry', value: stateData.dominant_industry || 'Diversified', inline: true }
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        // Add resource data if available
        if (stateData.resources && stateData.resources.length > 0) {
            const resources = stateData.resources.map(r => `• ${r.name}: ${r.abundance || 'Normal'}`).join('\n');
            embed.addFields({ name: '⛏️ Key Resources', value: resources.substring(0, 1024) });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
