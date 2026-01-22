/**
 * Services Module
 * Corporate Warfare Discord Bot
 *
 * Barrel export and service registration
 */

const container = require('./container');
const { ticketIntroRepository } = require('../database/repositories');

/**
 * Register all services with the container
 */
function registerServices() {
    // Tickets module service
    container.register('tickets', (client) => {
        const ticketsModule = require('../modules/tickets');
        ticketsModule.init(client);
        return ticketsModule;
    });

    // Welcome module service
    container.register('welcome', (client) => {
        const welcomeModule = require('../modules/welcome');
        welcomeModule.init(client);
        return welcomeModule;
    });

    // Ticket intro messages tracking (persisted to database)
    container.register('ticketIntroMessages', () => {
        return ticketIntroRepository;
    });
}

/**
 * Initialize the service container
 * @param {Client} client - Discord.js client
 */
function initServices(client) {
    container.setClient(client);
    registerServices();
    container.initializeAll();
}

/**
 * Get the tickets module
 * @returns {Object}
 */
function getTicketsModule() {
    return container.getService('tickets');
}

/**
 * Get the ticket manager from the tickets module
 * @returns {TicketManager}
 */
function getTicketManager() {
    return getTicketsModule().getTicketManager();
}

/**
 * Get the welcome module service
 * @returns {Object}
 */
function getWelcomeModule() {
    return container.getService('welcome');
}

/**
 * Get the ticket intro messages repository
 * @returns {Object} Repository with add, has, remove methods
 */
function getTicketIntroMessages() {
    return container.getService('ticketIntroMessages');
}

module.exports = {
    // Container
    container,
    initServices,
    registerServices,

    // Service getters
    getTicketsModule,
    getTicketManager,
    getWelcomeModule,
    getTicketIntroMessages,

    // Re-export container methods for convenience
    getService: container.getService,
    hasService: container.hasService,
    getClient: container.getClient,
};
