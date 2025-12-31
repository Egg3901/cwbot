const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/config');

// Create client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

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
