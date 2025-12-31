/**
 * Embed Factory Utilities
 * Corporate Warfare Discord Bot
 *
 * Standardized embed creation for consistent UI
 */

const { EmbedBuilder } = require('discord.js');
const EMOJIS = require('../constants/emojis');

// Brand colors
const COLORS = {
    PRIMARY: 0x5865F2,    // Discord blurple
    SUCCESS: 0x57F287,    // Green
    ERROR: 0xED4245,      // Red
    WARNING: 0xFEE75C,    // Yellow
    INFO: 0x5865F2,       // Blue
    TICKET: 0x5865F2,     // Ticket theme
    WELCOME: 0x57F287,    // Welcome theme
};

/**
 * Create a base embed with consistent styling
 * @param {Object} options - Embed options
 * @returns {EmbedBuilder}
 */
function createEmbed({ title, description, color = COLORS.PRIMARY, footer, thumbnail, fields = [] }) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTimestamp();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (footer) embed.setFooter({ text: footer });
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (fields.length > 0) embed.addFields(fields);

    return embed;
}

/**
 * Create a success embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function success(title, description) {
    return createEmbed({
        title: `${EMOJIS.SUCCESS} ${title}`,
        description,
        color: COLORS.SUCCESS,
    });
}

/**
 * Create an error embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function error(title, description) {
    return createEmbed({
        title: `${EMOJIS.ERROR} ${title}`,
        description,
        color: COLORS.ERROR,
    });
}

/**
 * Create a warning embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function warning(title, description) {
    return createEmbed({
        title: `${EMOJIS.WARNING} ${title}`,
        description,
        color: COLORS.WARNING,
    });
}

/**
 * Create an info embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
function info(title, description) {
    return createEmbed({
        title: `${EMOJIS.INFO} ${title}`,
        description,
        color: COLORS.INFO,
    });
}

/**
 * Create a ticket embed
 * @param {Object} options - Ticket embed options
 * @returns {EmbedBuilder}
 */
function ticket({ title, description, user, category, fields = [] }) {
    const embed = createEmbed({
        title: `${EMOJIS.TICKET} ${title}`,
        description,
        color: COLORS.TICKET,
        fields,
    });

    if (user) {
        embed.setAuthor({
            name: user.tag || user.username,
            iconURL: user.displayAvatarURL?.() || user.avatarURL?.(),
        });
    }

    if (category) {
        embed.addFields({ name: 'Category', value: category, inline: true });
    }

    return embed;
}

/**
 * Create a welcome embed
 * @param {Object} options - Welcome embed options
 * @returns {EmbedBuilder}
 */
function welcome({ title, description, member, rulesChannel }) {
    const embed = createEmbed({
        title: `${EMOJIS.VERIFY} ${title}`,
        description,
        color: COLORS.WELCOME,
    });

    if (member) {
        embed.setThumbnail(member.displayAvatarURL?.({ dynamic: true, size: 256 }));
    }

    if (rulesChannel) {
        embed.addFields({
            name: 'Rules',
            value: `Please read <#${rulesChannel}> before continuing.`,
        });
    }

    return embed;
}

/**
 * Create a help embed
 * @param {Object} options - Help embed options
 * @returns {EmbedBuilder}
 */
function help({ title, description, fields = [], footer }) {
    return createEmbed({
        title: `${EMOJIS.HELP} ${title}`,
        description,
        color: COLORS.PRIMARY,
        fields,
        footer,
    });
}

module.exports = {
    COLORS,
    createEmbed,
    success,
    error,
    warning,
    info,
    ticket,
    welcome,
    help,
};
