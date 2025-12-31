/**
 * Guild Member Add Event
 * Handles new member joins
 * Corporate Warfare Discord Bot
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const client = member.client;

        // Welcome module handles unverified role + welcome message
        const welcomeModule = client.modules.get('welcome');
        if (welcomeModule) {
            await welcomeModule.handleMemberJoin(member);
        }
    }
};
