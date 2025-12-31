/**
 * Ticket Repository
 * Corporate Warfare Discord Bot
 *
 * Data access layer for tickets
 */

const { getDatabase } = require('../index');

/**
 * Ticket data structure
 * @typedef {Object} TicketData
 * @property {number} id - Ticket ID (auto-generated)
 * @property {string} channelId - Discord channel ID
 * @property {string} guildId - Discord guild ID
 * @property {string} creatorId - User who created the ticket
 * @property {string} [category] - Ticket category
 * @property {string} [subject] - Ticket subject
 * @property {string} [description] - Ticket description
 * @property {string} [claimedBy] - Staff who claimed the ticket
 * @property {string} status - Ticket status (open/claimed/closed)
 * @property {string} createdAt - Creation timestamp
 * @property {string} [closedAt] - Close timestamp
 */

/**
 * Create a new ticket
 * @param {Object} data - Ticket data
 * @returns {TicketData} Created ticket
 */
function create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO tickets (channel_id, guild_id, creator_id, category, subject, description, status)
        VALUES (@channelId, @guildId, @creatorId, @category, @subject, @description, @status)
    `);

    const result = stmt.run({
        channelId: data.channelId,
        guildId: data.guildId,
        creatorId: data.creatorId,
        category: data.category || null,
        subject: data.subject || null,
        description: data.description || null,
        status: data.status || 'open',
    });

    return findById(result.lastInsertRowid);
}

/**
 * Find ticket by ID
 * @param {number} id - Ticket ID
 * @returns {TicketData|null} Ticket or null
 */
function findById(id) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    return row ? mapRowToTicket(row) : null;
}

/**
 * Find ticket by channel ID
 * @param {string} channelId - Discord channel ID
 * @returns {TicketData|null} Ticket or null
 */
function findByChannelId(channelId) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
    return row ? mapRowToTicket(row) : null;
}

/**
 * Find all tickets for a guild
 * @param {string} guildId - Discord guild ID
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.limit] - Limit results
 * @returns {TicketData[]} Array of tickets
 */
function findByGuildId(guildId, options = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM tickets WHERE guild_id = ?';
    const params = [guildId];

    if (options.status) {
        query += ' AND status = ?';
        params.push(options.status);
    }

    query += ' ORDER BY created_at DESC';

    if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
    }

    const rows = db.prepare(query).all(...params);
    return rows.map(mapRowToTicket);
}

/**
 * Find all tickets by creator
 * @param {string} creatorId - User ID
 * @returns {TicketData[]} Array of tickets
 */
function findByCreatorId(creatorId) {
    const db = getDatabase();
    const rows = db.prepare(
        'SELECT * FROM tickets WHERE creator_id = ? ORDER BY created_at DESC'
    ).all(creatorId);
    return rows.map(mapRowToTicket);
}

/**
 * Update a ticket
 * @param {string} channelId - Channel ID to update
 * @param {Object} data - Data to update
 * @returns {TicketData|null} Updated ticket or null
 */
function update(channelId, data) {
    const db = getDatabase();
    const updates = [];
    const params = {};

    if (data.claimedBy !== undefined) {
        updates.push('claimed_by = @claimedBy');
        params.claimedBy = data.claimedBy;
    }
    if (data.status !== undefined) {
        updates.push('status = @status');
        params.status = data.status;
    }
    if (data.closedAt !== undefined) {
        updates.push('closed_at = @closedAt');
        params.closedAt = data.closedAt;
    }

    if (updates.length === 0) {
        return findByChannelId(channelId);
    }

    params.channelId = channelId;
    const stmt = db.prepare(`
        UPDATE tickets SET ${updates.join(', ')}
        WHERE channel_id = @channelId
    `);

    stmt.run(params);
    return findByChannelId(channelId);
}

/**
 * Delete a ticket
 * @param {string} channelId - Channel ID to delete
 * @returns {boolean} True if deleted
 */
function deleteByChannelId(channelId) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM tickets WHERE channel_id = ?').run(channelId);
    return result.changes > 0;
}

/**
 * Check if a channel is a ticket
 * @param {string} channelId - Channel ID to check
 * @returns {boolean} True if channel is a ticket
 */
function isTicket(channelId) {
    const db = getDatabase();
    const row = db.prepare('SELECT 1 FROM tickets WHERE channel_id = ? LIMIT 1').get(channelId);
    return !!row;
}

/**
 * Get count of tickets
 * @param {string} [guildId] - Optional guild filter
 * @param {string} [status] - Optional status filter
 * @returns {number} Ticket count
 */
function count(guildId = null, status = null) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM tickets WHERE 1=1';
    const params = [];

    if (guildId) {
        query += ' AND guild_id = ?';
        params.push(guildId);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    return db.prepare(query).get(...params).count;
}

/**
 * Get next ticket number for a guild
 * @param {string} guildId - Guild ID
 * @returns {number} Next ticket number
 */
function getNextTicketNumber(guildId) {
    const db = getDatabase();
    const row = db.prepare(
        'SELECT MAX(id) as maxId FROM tickets WHERE guild_id = ?'
    ).get(guildId);
    return (row?.maxId || 0) + 1;
}

/**
 * Map database row to ticket object
 * @param {Object} row - Database row
 * @returns {TicketData} Ticket object
 */
function mapRowToTicket(row) {
    return {
        id: row.id,
        channelId: row.channel_id,
        guildId: row.guild_id,
        creatorId: row.creator_id,
        category: row.category,
        subject: row.subject,
        description: row.description,
        claimedBy: row.claimed_by,
        status: row.status,
        createdAt: row.created_at,
        closedAt: row.closed_at,
    };
}

module.exports = {
    create,
    findById,
    findByChannelId,
    findByGuildId,
    findByCreatorId,
    update,
    deleteByChannelId,
    isTicket,
    count,
    getNextTicketNumber,
};
