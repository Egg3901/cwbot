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
        description: 'Hey {user}, welcome to **{server}**!\n\nYou are member **#{memberCount}**.\n\n**To gain access to the server:**\nReact with ✅ below to verify yourself!',
        color: 0x5865F2,
        thumbnail: true,
        footer: 'React below to verify'
    },

    // Verified message (sent after reaction)
    verifiedMessage: '✅ You have been verified! Check out {rules} for the server rules.'
};
