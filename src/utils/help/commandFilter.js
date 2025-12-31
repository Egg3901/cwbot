/**
 * Command Filter
 * Corporate Warfare Discord Bot
 *
 * Filters and groups commands by category with permission checking
 */

const categories = require('../../config/categories');

/**
 * Get commands grouped by category
 * @param {Client} client - Discord client
 * @param {GuildMember} member - Member to check permissions for (optional)
 * @returns {Object} Commands grouped by category
 */
function getCommandsByCategory(client, member = null) {
    const grouped = {};

    client.commands.forEach(command => {
        const categoryName = command.category || 'Uncategorized';

        // Permission check (optional)
        if (member && command.data.default_member_permissions) {
            const requiredPerms = BigInt(command.data.default_member_permissions);
            if (!member.permissions.has(requiredPerms)) {
                return; // Skip commands user can't access
            }
        }

        if (!grouped[categoryName]) {
            grouped[categoryName] = [];
        }
        grouped[categoryName].push(command);
    });

    // Sort categories by order defined in config
    return sortByCategory(grouped);
}

/**
 * Sort grouped commands by category order
 * @param {Object} grouped - Commands grouped by category
 * @returns {Object} Sorted grouped commands
 */
function sortByCategory(grouped) {
    const sorted = {};
    Object.keys(grouped)
        .sort((a, b) => {
            const orderA = categories[a]?.order || 99;
            const orderB = categories[b]?.order || 99;
            return orderA - orderB;
        })
        .forEach(key => {
            sorted[key] = grouped[key];
        });
    return sorted;
}

/**
 * Get commands for a specific category
 * @param {Client} client - Discord client
 * @param {string} categoryName - Category name
 * @param {GuildMember} member - Member for permission filtering
 * @returns {Array} Commands in category
 */
function getCommandsForCategory(client, categoryName, member = null) {
    const grouped = getCommandsByCategory(client, member);
    return grouped[categoryName] || [];
}

/**
 * Get category count
 * @param {Client} client - Discord client
 * @param {GuildMember} member - Member for permission filtering
 * @returns {number} Number of accessible categories
 */
function getCategoryCount(client, member = null) {
    const grouped = getCommandsByCategory(client, member);
    return Object.keys(grouped).length;
}

module.exports = {
    getCommandsByCategory,
    getCommandsForCategory,
    getCategoryCount,
    sortByCategory,
};
