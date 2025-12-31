/**
 * /welcome Command
 * View welcome settings and test
 * Corporate Warfare Discord Bot
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config/config');
const { getWelcomeModule } = require('../../services');

module.exports = {
    category: 'Admin',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Welcome system commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('test')
                .setDescription('Test the welcome message')
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('View current welcome settings')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const welcomeModule = getWelcomeModule();

        if (sub === 'test') {
            const embed = welcomeModule.buildWelcomeEmbed(interaction.member);
            return interaction.reply({
                content: '**Preview of welcome message:**\n*React with ✅ to verify (won\'t actually change roles in test)*',
                embeds: [embed],
                ephemeral: true
            });
        }

        if (sub === 'status') {
            const embed = new EmbedBuilder()
                .setColor(config.colors.info)
                .setTitle('Welcome System Status')
                .addFields(
                    {
                        name: 'Welcome Channel',
                        value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : '❌ Not configured',
                        inline: true
                    },
                    {
                        name: 'Rules Channel',
                        value: config.rulesChannelId ? `<#${config.rulesChannelId}>` : '❌ Not configured',
                        inline: true
                    },
                    {
                        name: 'Member Role',
                        value: config.memberRoleId ? `<@&${config.memberRoleId}>` : '❌ Not configured',
                        inline: true
                    },
                    {
                        name: 'Unverified Role',
                        value: config.unverifiedRoleId ? `<@&${config.unverifiedRoleId}>` : '❌ Not configured',
                        inline: true
                    }
                )
                .setFooter({ text: 'Configure in .env file' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
