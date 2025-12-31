/**
 * Welcome System Configuration
 * Corporate Warfare Discord Bot
 */

module.exports = {
    // Verification emoji
    verifyEmoji: '✅',

    // Welcome embed settings
    embed: {
        title: 'Welcome to {server}!',
        description: 'Hey {user}, welcome to **{server}**!\n\nYou are member **#{memberCount}**.\n\n**Before you can access the server:**\n1. Read the rules in {rules}\n2. Once you have read and accept the rules, react with ✅ below',
        color: 0x5865F2,
        thumbnail: true,
        footer: 'React with ✅ after reading the rules'
    },

    // Verified message (sent after reaction)
    verifiedMessage: '✅ Welcome to the server! You now have full access.'
};
