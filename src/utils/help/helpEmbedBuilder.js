/**
 * Help Embed Builder
 * Corporate Warfare Discord Bot
 *
 * Builds embeds for the help system
 */

const { EmbedBuilder } = require('discord.js');
const categories = require('../../config/categories');
const config = require('../../config/config');
const { EMOJIS } = require('../../constants');
const { getCommandsByCategory } = require('./commandFilter');

/**
 * Build main help embed with category overview
 * @param {Client} client - Discord client
 * @param {GuildMember} member - Member for permission filtering
 * @returns {EmbedBuilder}
 */
function buildMainHelpEmbed(client, member = null) {
    const grouped = getCommandsByCategory(client, member);

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${EMOJIS.HELP} Corporate Warfare - Help`)
        .setDescription('Select a category below to view available commands.\n\u200b')
        .setFooter({ text: `${client.commands.size} commands available` })
        .setTimestamp();

    for (const [categoryName, commands] of Object.entries(grouped)) {
        const catConfig = categories[categoryName] || categories.Uncategorized;
        embed.addFields({
            name: `${catConfig.emoji} ${categoryName}`,
            value: `${catConfig.description}\n\`${commands.length} command${commands.length !== 1 ? 's' : ''}\``,
            inline: true
        });
    }

    return embed;
}

/**
 * Build category detail embed
 * @param {Client} client - Discord client
 * @param {string} categoryName - Category to show
 * @param {GuildMember} member - Member for permission filtering
 * @returns {EmbedBuilder}
 */
function buildCategoryEmbed(client, categoryName, member = null) {
    const grouped = getCommandsByCategory(client, member);
    const commands = grouped[categoryName] || [];
    const catConfig = categories[categoryName] || categories.Uncategorized;

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${catConfig.emoji} ${categoryName} Commands`)
        .setDescription(catConfig.description + '\n\u200b')
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();

    if (commands.length === 0) {
        embed.addFields({ name: 'No Commands', value: 'No commands available in this category.' });
    } else {
        for (const cmd of commands) {
            const subcommands = cmd.data.options?.filter(opt => opt.type === 1) || [];

            if (subcommands.length > 0) {
                // Has subcommands
                const subList = subcommands.map(sub => `\`/${cmd.data.name} ${sub.name}\` - ${sub.description}`).join('\n');
                embed.addFields({ name: `/${cmd.data.name}`, value: subList });
            } else {
                embed.addFields({
                    name: `/${cmd.data.name}`,
                    value: cmd.data.description,
                    inline: true
                });
            }
        }
    }

    return embed;
}

/**
 * Build individual command detail embed
 * @param {Command} command - Command object
 * @returns {EmbedBuilder}
 */
function buildCommandEmbed(command) {
    const catConfig = categories[command.category] || categories.Uncategorized;

    const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`${catConfig.emoji} /${command.data.name}`)
        .setDescription(command.data.description)
        .setFooter({ text: config.embedDefaults.footer })
        .setTimestamp();

    // Show subcommands if any
    const subcommands = command.data.options?.filter(opt => opt.type === 1) || [];
    if (subcommands.length > 0) {
        embed.addFields({
            name: 'Subcommands',
            value: subcommands.map(sub => `\`${sub.name}\` - ${sub.description}`).join('\n')
        });
    }

    // Show options if any (non-subcommand options)
    const options = command.data.options?.filter(opt => opt.type !== 1 && opt.type !== 2) || [];
    if (options.length > 0) {
        embed.addFields({
            name: 'Options',
            value: options.map(opt => `\`${opt.name}\` - ${opt.description}${opt.required ? ' *(required)*' : ''}`).join('\n')
        });
    }

    return embed;
}

module.exports = {
    buildMainHelpEmbed,
    buildCategoryEmbed,
    buildCommandEmbed,
};
