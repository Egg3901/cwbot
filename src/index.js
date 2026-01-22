const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const config = require('./config/config');
const { initDatabase, closeDatabase } = require('./database');
const { initServices } = require('./services');
const { logInfo, logError } = require('./utils/errorHandler');

// Initialize database before anything else
initDatabase();
logInfo('Startup', 'Database initialized');

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    logError('Process', 'Unhandled Rejection', { reason: reason instanceof Error ? reason.stack : reason });
});

process.on('uncaughtException', (error) => {
    logError('Process', 'Uncaught Exception', { error: error.stack });
    // Optional: exit process if state is corrupted
    // process.exit(1);
});

// Create client with necessary intents and partials
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

// Commands collection (required by discord.js command handler)
client.commands = new Collection();

// Load handlers
require('./handlers/eventHandler')(client);
require('./handlers/commandHandler')(client);

// Initialize interaction router
const { initRouter } = require('./interactions');
initRouter();

// Initialize services (tickets, welcome, etc.)
initServices(client);
logInfo('Startup', 'Services initialized');

// Graceful shutdown
process.on('SIGINT', () => {
    logInfo('Shutdown', 'Received SIGINT, closing gracefully...');
    closeDatabase();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logInfo('Shutdown', 'Received SIGTERM, closing gracefully...');
    closeDatabase();
    client.destroy();
    process.exit(0);
});

// Login
client.login(config.token);
