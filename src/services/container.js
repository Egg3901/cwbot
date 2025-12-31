/**
 * Service Container
 * Corporate Warfare Discord Bot
 *
 * Dependency injection container for managing service instances.
 * Replaces direct client property assignments with centralized service management.
 */

const { logInfo, logError } = require('../utils/errorHandler');

/**
 * Service registry - stores service instances
 * @type {Map<string, any>}
 */
const services = new Map();

/**
 * Service factories - functions that create service instances
 * @type {Map<string, Function>}
 */
const factories = new Map();

/**
 * Discord client reference
 * @type {Client|null}
 */
let client = null;

/**
 * Register a service factory
 * @param {string} name - Service name
 * @param {Function} factory - Factory function (receives client)
 */
function register(name, factory) {
    if (typeof factory !== 'function') {
        throw new Error(`Service factory for '${name}' must be a function`);
    }
    factories.set(name, factory);
    logInfo('Container', `Registered service: ${name}`);
}

/**
 * Get a service instance (lazy initialization)
 * @param {string} name - Service name
 * @returns {any} Service instance
 */
function getService(name) {
    // Return cached instance if exists
    if (services.has(name)) {
        return services.get(name);
    }

    // Create instance from factory
    const factory = factories.get(name);
    if (!factory) {
        throw new Error(`Service '${name}' not registered`);
    }

    if (!client) {
        throw new Error(`Cannot initialize service '${name}' - client not set`);
    }

    const instance = factory(client);
    services.set(name, instance);
    logInfo('Container', `Initialized service: ${name}`);
    return instance;
}

/**
 * Check if a service is registered
 * @param {string} name - Service name
 * @returns {boolean} True if registered
 */
function hasService(name) {
    return factories.has(name) || services.has(name);
}

/**
 * Set the Discord client reference
 * @param {Client} discordClient - Discord.js client
 */
function setClient(discordClient) {
    client = discordClient;
    logInfo('Container', 'Client reference set');
}

/**
 * Get the Discord client
 * @returns {Client} Discord.js client
 */
function getClient() {
    if (!client) {
        throw new Error('Client not set in container');
    }
    return client;
}

/**
 * Initialize all registered services
 * Call this after setting the client
 */
function initializeAll() {
    for (const [name] of factories) {
        if (!services.has(name)) {
            getService(name);
        }
    }
    logInfo('Container', `All services initialized (${services.size} total)`);
}

/**
 * Clear all services (for testing)
 */
function clear() {
    services.clear();
    factories.clear();
    client = null;
}

/**
 * Get all service names
 * @returns {string[]} Array of service names
 */
function getServiceNames() {
    return [...new Set([...factories.keys(), ...services.keys()])];
}

module.exports = {
    register,
    getService,
    hasService,
    setClient,
    getClient,
    initializeAll,
    clear,
    getServiceNames,
};
