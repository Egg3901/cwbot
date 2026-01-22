/**
 * User Repository
 * Corporate Warfare Discord Bot
 *
 * Data access layer for user mappings (Discord <-> Game Profile)
 */

const { getDatabase } = require('../index');
const { logError } = require('../../utils/errorHandler');

/**
 * Upsert a user mapping
 * @param {Object} user - User data
 * @returns {boolean} True if successful
 */
function upsert(user) {
    const db = getDatabase();
    try {
        db.prepare(`
            INSERT INTO users (
                discord_id, user_id, profile_id, username, player_name,
                profile_slug, profile_image_url, discord_username,
                discord_discriminator, discord_avatar, updated_at
            ) VALUES (
                @discord_id, @user_id, @profile_id, @username, @player_name,
                @profile_slug, @profile_image_url, @discord_username,
                @discord_discriminator, @discord_avatar, CURRENT_TIMESTAMP
            )
            ON CONFLICT(discord_id) DO UPDATE SET
                user_id = excluded.user_id,
                profile_id = excluded.profile_id,
                username = excluded.username,
                player_name = excluded.player_name,
                profile_slug = excluded.profile_slug,
                profile_image_url = excluded.profile_image_url,
                discord_username = excluded.discord_username,
                discord_discriminator = excluded.discord_discriminator,
                discord_avatar = excluded.discord_avatar,
                updated_at = CURRENT_TIMESTAMP
        `).run(user);
        return true;
    } catch (error) {
        logError('Database', `Failed to upsert user ${user.discord_id}`, error);
        return false;
    }
}

/**
 * Get user by Discord ID
 * @param {string} discordId - Discord user ID
 * @returns {Object|null} User data or null
 */
function getByDiscordId(discordId) {
    const db = getDatabase();
    try {
        return db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
    } catch (error) {
        logError('Database', `Failed to get user by Discord ID ${discordId}`, error);
        return null;
    }
}

/**
 * Get user by Profile ID
 * @param {number} profileId - Game profile ID
 * @returns {Object|null} User data or null
 */
function getByProfileId(profileId) {
    const db = getDatabase();
    try {
        return db.prepare('SELECT * FROM users WHERE profile_id = ?').get(profileId);
    } catch (error) {
        logError('Database', `Failed to get user by Profile ID ${profileId}`, error);
        return null;
    }
}

/**
 * Get total mapped users count
 * @returns {number} Count
 */
function count() {
    const db = getDatabase();
    try {
        return db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    } catch (error) {
        logError('Database', 'Failed to count users', error);
        return 0;
    }
}

module.exports = {
    upsert,
    getByDiscordId,
    getByProfileId,
    count,
};
