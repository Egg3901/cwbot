/**
 * /time Command
 * Display current game time
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchGameTime } = require('../../services/corporateWarfareApi');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Show the current game time'),

    async execute(interaction) {
        await interaction.deferReply();

        const timeData = await fetchGameTime();

        if (!timeData) {
            return interaction.editReply({
                content: `${EMOJIS.ERROR} Failed to fetch game time.`
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🕒 Corporate Warfare Time')
            .addFields(
                { name: 'Game Date', value: timeData.game_date || 'Unknown', inline: true },
                { name: 'Tick', value: (timeData.tick || 0).toString(), inline: true },
                { name: 'Next Tick', value: `<t:${Math.floor((Date.now() + (timeData.ms_to_next_tick || 0)) / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
