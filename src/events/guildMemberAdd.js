/**
 * Guild Member Add Event
 * Handles new member joins
 * Corporate Warfare Discord Bot
 */

const { Events } = require('discord.js');
const { getWelcomeModule } = require('../services');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Welcome module handles unverified role + welcome message
        const welcomeModule = getWelcomeModule();
        await welcomeModule.handleMemberJoin(member);
    }
};
