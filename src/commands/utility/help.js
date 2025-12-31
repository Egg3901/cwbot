/**
 * /help Command
 * Dynamic interactive help system
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder } = require('discord.js');
const {
    buildMainHelpEmbed,
    buildCategorySelectMenu
} = require('../../utils/helpBuilder');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands'),

    async execute(interaction, client) {
        const embed = buildMainHelpEmbed(client, interaction.member);
        const row = buildCategorySelectMenu(client, interaction.member);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
