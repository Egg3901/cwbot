require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,

    // Channel IDs
    welcomeChannelId: process.env.WELCOME_CHANNEL,
    rulesChannelId: process.env.RULES_CHANNEL,

    // Role IDs
    memberRoleId: process.env.MEMBER_ROLE,
    unverifiedRoleId: process.env.UNVERIFIED_ROLE,

    // Bot settings
    colors: {
        primary: 0x5865F2,    // Discord Blurple
        success: 0x57F287,    // Green
        warning: 0xFEE75C,    // Yellow
        error: 0xED4245,      // Red
        info: 0x5865F2        // Blue
    },

    // Embed defaults
    embedDefaults: {
        footer: 'Corporate Warfare',
    }
};
