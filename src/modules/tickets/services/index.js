/**
 * Ticket Services
 * Corporate Warfare Discord Bot
 *
 * Barrel export for ticket-related services
 */

const transcriptService = require('./transcriptService');
const ticketEmbedBuilder = require('./ticketEmbedBuilder');

module.exports = {
    // Transcript service
    ...transcriptService,

    // Embed builder
    ...ticketEmbedBuilder,
};
