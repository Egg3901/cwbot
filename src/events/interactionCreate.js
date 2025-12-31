/**
 * Interaction Create Event
 * Corporate Warfare Discord Bot
 *
 * Routes all interactions through the central router
 */

const { Events } = require('discord.js');
const { router } = require('../interactions');
const { logError } = require('../utils/errorHandler');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            await router.route(interaction, client);
        } catch (error) {
            logError('InteractionCreate', 'Unhandled error in router', error);
        }
    },
};
