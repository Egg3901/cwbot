/**
 * Command Category Configuration
 * Corporate Warfare Discord Bot
 *
 * Add new categories here as you add command groups.
 * Commands are auto-sorted into these categories based on their `category` property.
 */

module.exports = {
    Admin: {
        emoji: '⚙️',
        description: 'Server administration commands',
        order: 1
    },
    Tickets: {
        emoji: '🎫',
        description: 'Support ticket system',
        order: 2
    },
    Utility: {
        emoji: '🔧',
        description: 'General utility commands',
        order: 3
    },
    // Fallback for uncategorized commands
    Uncategorized: {
        emoji: '📁',
        description: 'Other commands',
        order: 99
    }
};
