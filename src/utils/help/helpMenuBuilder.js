/**
 * Help Menu Builder
 * Corporate Warfare Discord Bot
 *
 * Builds menus and buttons for the help system
 */

const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const categories = require('../../config/categories');
const { CUSTOM_IDS } = require('../../constants');
const { getCommandsByCategory } = require('./commandFilter');

/**
 * Build category select menu
 * @param {Client} client - Discord client
 * @param {GuildMember} member - Member for permission filtering
 * @returns {ActionRowBuilder}
 */
function buildCategorySelectMenu(client, member = null) {
    const grouped = getCommandsByCategory(client, member);

    const options = Object.keys(grouped).map(categoryName => {
        const catConfig = categories[categoryName] || categories.Uncategorized;
        return {
            label: categoryName,
            description: catConfig.description.substring(0, 50),
            value: `help_cat_${categoryName}`,
            emoji: catConfig.emoji
        };
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(CUSTOM_IDS.HELP.CATEGORY_SELECT)
        .setPlaceholder('Select a category')
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Build command select menu for a category
 * @param {Client} client - Discord client
 * @param {string} categoryName - Category name
 * @param {GuildMember} member - Member for permission filtering
 * @returns {ActionRowBuilder|null}
 */
function buildCommandSelectMenu(client, categoryName, member = null) {
    const grouped = getCommandsByCategory(client, member);
    const commands = grouped[categoryName] || [];

    if (commands.length === 0) return null;

    const options = commands.map(cmd => ({
        label: `/${cmd.data.name}`,
        description: cmd.data.description.substring(0, 50),
        value: `help_cmd_${cmd.data.name}`
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(CUSTOM_IDS.HELP.COMMAND_SELECT)
        .setPlaceholder('Select a command for details')
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * Build back button row
 * @returns {ActionRowBuilder}
 */
function buildBackButton() {
    const button = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.HELP.BACK)
        .setLabel('Back to Categories')
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(button);
}

module.exports = {
    buildCategorySelectMenu,
    buildCommandSelectMenu,
    buildBackButton,
};
