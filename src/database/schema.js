/**
 * Database Schema
 * Corporate Warfare Discord Bot
 *
 * Table definitions and migrations
 */

const { logInfo } = require('../utils/errorHandler');

/**
 * Schema version for migrations
 */
const SCHEMA_VERSION = 3;

/**
 * Initialize database schema
 * @param {Database} db - SQLite database instance
 */
function initSchema(db) {
    // Create schema version table
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Check current version
    const currentVersion = db.prepare(
        'SELECT MAX(version) as version FROM schema_version'
    ).get()?.version || 0;

    if (currentVersion < SCHEMA_VERSION) {
        logInfo('Database', `Migrating schema from v${currentVersion} to v${SCHEMA_VERSION}`);
        runMigrations(db, currentVersion);
    } else {
        logInfo('Database', `Schema is up to date (v${SCHEMA_VERSION})`);
    }
}

/**
 * Run all pending migrations
 * @param {Database} db - SQLite database instance
 * @param {number} fromVersion - Current schema version
 */
function runMigrations(db, fromVersion) {
    const migrations = [
        migration001_initial,
        migration002_ticketIntroMessages,
        migration003_users,
    ];

    for (let i = fromVersion; i < migrations.length; i++) {
        const version = i + 1;
        logInfo('Database', `Running migration ${version}...`);

        db.transaction(() => {
            migrations[i](db);
            db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version);
        })();

        logInfo('Database', `Migration ${version} complete`);
    }
}

/**
 * Migration 001: Initial schema
 * Creates tickets and welcome_states tables
 */
function migration001_initial(db) {
    // Tickets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id TEXT UNIQUE NOT NULL,
            guild_id TEXT NOT NULL,
            creator_id TEXT NOT NULL,
            category TEXT,
            subject TEXT,
            description TEXT,
            claimed_by TEXT,
            status TEXT DEFAULT 'open' CHECK(status IN ('open', 'claimed', 'closed')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            closed_at TEXT,

            -- Indexes for common queries
            CONSTRAINT idx_tickets_channel UNIQUE(channel_id)
        )
    `);

    // Create indexes for tickets
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_creator ON tickets(creator_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    `);

    // Welcome states table
    db.exec(`
        CREATE TABLE IF NOT EXISTS welcome_states (
            message_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            guild_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes for welcome_states
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_welcome_user ON welcome_states(user_id);
        CREATE INDEX IF NOT EXISTS idx_welcome_guild ON welcome_states(guild_id);
    `);

    // Server config table (for future use)
    db.exec(`
        CREATE TABLE IF NOT EXISTS server_config (
            guild_id TEXT PRIMARY KEY,
            config_key TEXT NOT NULL,
            config_value TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild_id, config_key)
        )
    `);

    logInfo('Database', 'Created tables: tickets, welcome_states, server_config');
}

/**
 * Migration 002: Ticket intro messages
 * Persists ticket intro message IDs for restart recovery
 */
function migration002_ticketIntroMessages(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS ticket_intro_messages (
            message_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_intro_guild ON ticket_intro_messages(guild_id);
    `);

    logInfo('Database', 'Created table: ticket_intro_messages');
}

/**
 * Migration 003: Users table
 * Stores Discord to Game Profile mappings
 */
function migration003_users(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            discord_id TEXT PRIMARY KEY,
            user_id INTEGER,
            profile_id INTEGER,
            username TEXT,
            player_name TEXT,
            profile_slug TEXT,
            profile_image_url TEXT,
            discord_username TEXT,
            discord_discriminator TEXT,
            discord_avatar TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);
        CREATE INDEX IF NOT EXISTS idx_users_player_name ON users(player_name);
    `);

    logInfo('Database', 'Created table: users');
}

module.exports = {
    initSchema,
    SCHEMA_VERSION,
};
