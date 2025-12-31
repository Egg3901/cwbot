/**
 * Ticket System Configuration
 * Corporate Warfare Discord Bot
 */

module.exports = {
    // Ticket categories
    categories: [
        { id: 'support', label: 'General Support', emoji: '🎫', description: 'Get help with general questions' },
        { id: 'bug', label: 'Bug Report', emoji: '🐛', description: 'Report a bug or issue' },
        { id: 'suggestion', label: 'Suggestion', emoji: '💡', description: 'Share an idea or suggestion' },
        { id: 'other', label: 'Other', emoji: '📝', description: 'Something else' }
    ],

    // Channel naming
    channelPrefix: 'ticket-',

    // Embed colors (matches config.colors pattern)
    colors: {
        open: 0x57F287,      // Green - ticket opened
        claimed: 0x5865F2,   // Blue - ticket claimed
        closed: 0xED4245    // Red - ticket closed
    },

    // Messages
    messages: {
        ticketCreated: 'Your ticket has been created! Staff will be with you shortly.',
        ticketClosed: 'This ticket has been closed.',
        ticketClaimed: 'This ticket has been claimed by {user}.',
        noPermission: 'You do not have permission to do this.',
        alreadyClaimed: 'This ticket has already been claimed.',
        transcriptSaved: 'Transcript saved to {channel}.'
    },

    // Button IDs
    buttons: {
        create: 'ticket_create',
        close: 'ticket_close',
        claim: 'ticket_claim',
        transcript: 'ticket_transcript',
        delete: 'ticket_delete',
        confirmClose: 'ticket_confirm_close',
        cancelClose: 'ticket_cancel_close'
    },

    // Modal IDs
    modals: {
        create: 'ticket_create_modal',
        closeReason: 'ticket_close_reason_modal'
    },

    // Intro settings
    intro: {
        emoji: '🎫',
        title: 'Corporate Warfare Support',
        description: 'Need help? We\'re here for you!\n\n**How to create a ticket:**\nClick the button below to open a support ticket.\n\n**What happens next:**\n• A private channel will be created for you\n• Our staff will assist you as soon as possible\n• Please be patient and provide details about your issue',
        footer: 'Click the button below to create a ticket'
    }
};
