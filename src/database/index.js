/**
 * Database Connection
 * Corporate Warfare Discord Bot
 *
 * SQLite database initialization and connection management
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { logInfo, logError } = require('../utils/errorHandler');

// Database file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'bot.db');

// Singleton database instance
let db = null;

/**
 * Initialize the database connection
 * @returns {Database} SQLite database instance
 */
function initDatabase() {
    if (db) {
        return db;
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        logInfo('Database', `Created data directory: ${DATA_DIR}`);
    }

    try {
        // Create database connection
        db = new Database(DB_PATH, {
            verbose: process.env.NODE_ENV === 'development' ? console.log : null,
        });

        // Enable foreign keys and WAL mode for better performance
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        logInfo('Database', `Connected to SQLite database: ${DB_PATH}`);

        // Initialize schema
        const { initSchema } = require('./schema');
        initSchema(db);

        return db;
    } catch (error) {
        logError('Database', 'Failed to initialize database', error);
        throw error;
    }
}

/**
 * Get the database instance
 * @returns {Database} SQLite database instance
 * @throws {Error} If database not initialized
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        logInfo('Database', 'Database connection closed');
    }
}

/**
 * Run a transaction
 * @param {Function} fn - Function to run in transaction
 * @returns {*} Result of the function
 */
function transaction(fn) {
    const database = getDatabase();
    return database.transaction(fn)();
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase,
    transaction,
};
