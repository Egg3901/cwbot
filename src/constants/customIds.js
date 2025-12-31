/**
 * Custom ID Constants
 * Corporate Warfare Discord Bot
 *
 * Centralized custom IDs for buttons, modals, and select menus
 */

module.exports = {
    // Prefixes
    PREFIX: {
        TICKET: 'ticket_',
        HELP: 'help_',
        WELCOME: 'welcome_',
    },

    // Ticket buttons
    TICKET: {
        CLOSE: 'ticket_close',
        CLAIM: 'ticket_claim',
        TRANSCRIPT: 'ticket_transcript',
        DELETE: 'ticket_delete',
        CONFIRM_CLOSE: 'ticket_confirm_close',
        CANCEL_CLOSE: 'ticket_cancel_close',
    },

    // Ticket modals
    TICKET_MODAL: {
        CREATE: 'ticket_create_modal',
        CLOSE_REASON: 'ticket_close_reason_modal',
    },

    // Ticket select menus
    TICKET_SELECT: {
        CATEGORY: 'ticket_category_select',
    },

    // Help system
    HELP: {
        BACK: 'help_back',
        CATEGORY_SELECT: 'help_category_select',
        COMMAND_SELECT: 'help_command_select',
    },

    // Welcome system
    WELCOME: {
        VERIFY: 'welcome_verify',
    },

    // Utility functions
    isTicket: (id) => id.startsWith('ticket_'),
    isHelp: (id) => id.startsWith('help_'),
    isWelcome: (id) => id.startsWith('welcome_'),
};
