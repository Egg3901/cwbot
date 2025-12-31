const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`[Bot] Logged in as ${client.user.tag}`);
        console.log(`[Bot] Serving ${client.guilds.cache.size} guild(s)`);

        // Set bot status
        client.user.setActivity('Corporate Warfare', { type: ActivityType.Playing });
    }
};
