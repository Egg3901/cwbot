/**
 * Interactions Index
 * Corporate Warfare Discord Bot
 *
 * Barrel export and router setup
 */

const { router } = require('./router');
const commandHandler = require('./handlers/commandHandler');
const buttonHandler = require('./handlers/buttonHandler');
const selectMenuHandler = require('./handlers/selectMenuHandler');
const modalHandler = require('./handlers/modalHandler');
const { cooldownMiddleware } = require('./middleware/cooldown');

/**
 * Initialize the interaction router with handlers and middleware
 */
function initRouter() {
    // Register middleware (order matters)
    router.use(cooldownMiddleware);

    // Register handlers
    router.register('command', commandHandler);
    router.register('button', buttonHandler);
    router.register('selectMenu', selectMenuHandler);
    router.register('modal', modalHandler);

    return router;
}

module.exports = {
    router,
    initRouter,
    // Export individual handlers for testing
    handlers: {
        commandHandler,
        buttonHandler,
        selectMenuHandler,
        modalHandler,
    },
    middleware: {
        cooldownMiddleware,
    },
};
