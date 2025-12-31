const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const config = require('./config/config');

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

// Track ticket intro messages (persists until restart)
client.ticketIntroMessages = new Set();

// Collections for commands and modules
client.commands = new Collection();
client.modules = new Collection();

// Load handlers
require('./handlers/eventHandler')(client);
require('./handlers/commandHandler')(client);

// Load modules
const ticketsModule = require('./modules/tickets');
ticketsModule.init(client);
client.modules.set(ticketsModule.name, ticketsModule);

// Login
client.login(config.token);
