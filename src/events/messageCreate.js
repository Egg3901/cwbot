const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Module hooks will be added here
        // Example: starboard reactions, welcome DMs, etc.
    }
};
