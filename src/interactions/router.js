/**
 * Interaction Router
 * Corporate Warfare Discord Bot
 *
 * Central dispatcher for all Discord interactions
 */

const { logError, logInfo } = require('../utils/errorHandler');

class InteractionRouter {
    constructor() {
        this.handlers = new Map();
        this.middleware = [];
    }

    /**
     * Register a handler for a specific interaction type
     * @param {string} type - Interaction type (command, button, selectMenu, modal)
     * @param {Function} handler - Handler function
     */
    register(type, handler) {
        this.handlers.set(type, handler);
        logInfo('Router', `Registered handler: ${type}`);
    }

    /**
     * Add middleware to the router
     * @param {Function} middleware - Middleware function (interaction, next) => void
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Route an interaction to the appropriate handler
     * @param {Interaction} interaction - Discord interaction
     * @param {Client} client - Discord client
     */
    async route(interaction, client) {
        const type = this.getInteractionType(interaction);
        const handler = this.handlers.get(type);

        if (!handler) {
            return;
        }

        // Build middleware chain
        const chain = [...this.middleware, handler];
        let index = 0;

        const next = async () => {
            if (index < chain.length) {
                const current = chain[index++];
                await current(interaction, client, next);
            }
        };

        try {
            await next();
        } catch (error) {
            logError('Router', `Error routing ${type} interaction`, error);
            throw error;
        }
    }

    /**
     * Determine the type of interaction
     * @param {Interaction} interaction - Discord interaction
     * @returns {string|null} Interaction type
     */
    getInteractionType(interaction) {
        if (interaction.isChatInputCommand()) return 'command';
        if (interaction.isButton()) return 'button';
        if (interaction.isStringSelectMenu()) return 'selectMenu';
        if (interaction.isModalSubmit()) return 'modal';
        if (interaction.isAutocomplete()) return 'autocomplete';
        if (interaction.isUserContextMenuCommand()) return 'userContext';
        if (interaction.isMessageContextMenuCommand()) return 'messageContext';
        return null;
    }
}

// Singleton instance
const router = new InteractionRouter();

module.exports = {
    InteractionRouter,
    router,
};
