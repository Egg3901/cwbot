const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config/config');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands'),

    async execute(interaction, client) {
        const categories = {};

        // Group commands by category (folder)
        client.commands.forEach(command => {
            const category = command.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        });

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('Corporate Warfare Bot - Help')
            .setDescription('Select a category below or browse available commands.')
            .setFooter({ text: config.embedDefaults.footer })
            .setTimestamp();

        // Add fields for each category
        for (const [category, commands] of Object.entries(categories)) {
            const commandList = commands
                .map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`)
                .join('\n');
            embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: commandList || 'No commands' });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
