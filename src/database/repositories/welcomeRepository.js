/**
 * Welcome Repository
 * Corporate Warfare Discord Bot
 *
 * Data access layer for welcome verification states
 */

const { getDatabase } = require('../index');

/**
 * Welcome state data structure
 * @typedef {Object} WelcomeState
 * @property {string} messageId - Discord message ID
 * @property {string} userId - User to verify
 * @property {string} guildId - Discord guild ID
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Create a welcome state
 * @param {Object} data - Welcome state data
 * @returns {WelcomeState} Created state
 */
function create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO welcome_states (message_id, user_id, guild_id)
        VALUES (@messageId, @userId, @guildId)
    `);

    stmt.run({
        messageId: data.messageId,
        userId: data.userId,
        guildId: data.guildId,
    });

    return findByMessageId(data.messageId);
}

/**
 * Find welcome state by message ID
 * @param {string} messageId - Discord message ID
 * @returns {WelcomeState|null} Welcome state or null
 */
function findByMessageId(messageId) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM welcome_states WHERE message_id = ?').get(messageId);
    return row ? mapRowToWelcomeState(row) : null;
}

/**
 * Find welcome state by user ID
 * @param {string} userId - Discord user ID
 * @param {string} [guildId] - Optional guild filter
 * @returns {WelcomeState|null} Welcome state or null
 */
function findByUserId(userId, guildId = null) {
    const db = getDatabase();
    let query = 'SELECT * FROM welcome_states WHERE user_id = ?';
    const params = [userId];

    if (guildId) {
        query += ' AND guild_id = ?';
        params.push(guildId);
    }

    query += ' ORDER BY created_at DESC LIMIT 1';

    const row = db.prepare(query).get(...params);
    return row ? mapRowToWelcomeState(row) : null;
}

/**
 * Find all welcome states for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {WelcomeState[]} Array of welcome states
 */
function findByGuildId(guildId) {
    const db = getDatabase();
    const rows = db.prepare(
        'SELECT * FROM welcome_states WHERE guild_id = ? ORDER BY created_at DESC'
    ).all(guildId);
    return rows.map(mapRowToWelcomeState);
}

/**
 * Delete a welcome state
 * @param {string} messageId - Message ID to delete
 * @returns {boolean} True if deleted
 */
function deleteByMessageId(messageId) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM welcome_states WHERE message_id = ?').run(messageId);
    return result.changes > 0;
}

/**
 * Delete all welcome states for a user
 * @param {string} userId - User ID
 * @param {string} [guildId] - Optional guild filter
 * @returns {number} Number of deleted records
 */
function deleteByUserId(userId, guildId = null) {
    const db = getDatabase();
    let query = 'DELETE FROM welcome_states WHERE user_id = ?';
    const params = [userId];

    if (guildId) {
        query += ' AND guild_id = ?';
        params.push(guildId);
    }

    const result = db.prepare(query).run(...params);
    return result.changes;
}

/**
 * Check if a message is a welcome message
 * @param {string} messageId - Message ID to check
 * @returns {boolean} True if message is a welcome message
 */
function isWelcomeMessage(messageId) {
    const db = getDatabase();
    const row = db.prepare('SELECT 1 FROM welcome_states WHERE message_id = ? LIMIT 1').get(messageId);
    return !!row;
}

/**
 * Clean up old welcome states
 * @param {number} maxAgeHours - Maximum age in hours
 * @returns {number} Number of deleted records
 */
function cleanupOld(maxAgeHours = 24) {
    const db = getDatabase();
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
    const result = db.prepare('DELETE FROM welcome_states WHERE created_at < ?').run(cutoff);
    return result.changes;
}

/**
 * Get count of welcome states
 * @param {string} [guildId] - Optional guild filter
 * @returns {number} Welcome state count
 */
function count(guildId = null) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM welcome_states';
    const params = [];

    if (guildId) {
        query += ' WHERE guild_id = ?';
        params.push(guildId);
    }

    return db.prepare(query).get(...params).count;
}

/**
 * Map database row to welcome state object
 * @param {Object} row - Database row
 * @returns {WelcomeState} Welcome state object
 */
function mapRowToWelcomeState(row) {
    return {
        messageId: row.message_id,
        userId: row.user_id,
        guildId: row.guild_id,
        createdAt: row.created_at,
    };
}

module.exports = {
    create,
    findByMessageId,
    findByUserId,
    findByGuildId,
    deleteByMessageId,
    deleteByUserId,
    isWelcomeMessage,
    cleanupOld,
    count,
};
