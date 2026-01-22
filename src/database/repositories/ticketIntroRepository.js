/**
 * Ticket Intro Repository
 * Corporate Warfare Discord Bot
 *
 * Data access layer for ticket intro message persistence
 */

const { getDatabase } = require('../index');

/**
 * Add a ticket intro message to the database
 * @param {string} messageId - Discord message ID
 * @param {string} guildId - Discord guild ID
 * @param {string} channelId - Discord channel ID
 * @returns {boolean} True if created
 */
function add(messageId, guildId, channelId) {
    const db = getDatabase();
    try {
        db.prepare(`
            INSERT OR IGNORE INTO ticket_intro_messages (message_id, guild_id, channel_id)
            VALUES (?, ?, ?)
        `).run(messageId, guildId, channelId);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if a message is a ticket intro message
 * @param {string} messageId - Discord message ID
 * @returns {boolean} True if message is a ticket intro
 */
function has(messageId) {
    const db = getDatabase();
    const row = db.prepare(
        'SELECT 1 FROM ticket_intro_messages WHERE message_id = ? LIMIT 1'
    ).get(messageId);
    return !!row;
}

/**
 * Remove a ticket intro message
 * @param {string} messageId - Discord message ID
 * @returns {boolean} True if deleted
 */
function remove(messageId) {
    const db = getDatabase();
    const result = db.prepare(
        'DELETE FROM ticket_intro_messages WHERE message_id = ?'
    ).run(messageId);
    return result.changes > 0;
}

/**
 * Get all ticket intro message IDs
 * @param {string} [guildId] - Optional guild filter
 * @returns {string[]} Array of message IDs
 */
function getAll(guildId = null) {
    const db = getDatabase();
    let query = 'SELECT message_id FROM ticket_intro_messages';
    const params = [];

    if (guildId) {
        query += ' WHERE guild_id = ?';
        params.push(guildId);
    }

    const rows = db.prepare(query).all(...params);
    return rows.map(row => row.message_id);
}

/**
 * Remove all ticket intro messages for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {number} Number of deleted records
 */
function removeByGuild(guildId) {
    const db = getDatabase();
    const result = db.prepare(
        'DELETE FROM ticket_intro_messages WHERE guild_id = ?'
    ).run(guildId);
    return result.changes;
}

/**
 * Get count of ticket intro messages
 * @param {string} [guildId] - Optional guild filter
 * @returns {number} Count
 */
function count(guildId = null) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM ticket_intro_messages';
    const params = [];

    if (guildId) {
        query += ' WHERE guild_id = ?';
        params.push(guildId);
    }

    return db.prepare(query).get(...params).count;
}

module.exports = {
    add,
    has,
    remove,
    getAll,
    removeByGuild,
    count,
};
